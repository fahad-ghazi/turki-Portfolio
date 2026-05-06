#!/usr/bin/env node
/**
 * Gallery Intelligent — Image Indexer
 *
 * Reads web/src/lib/imageManifest.json (source of truth for every
 * raster on the site: path + dimensions + blurhash). For each entry
 * it decodes the blurhash to a 32x32 RGBA buffer and derives:
 *
 *   - dominant_color, color_palette  (k-means over decoded pixels)
 *   - brightness / saturation / contrast / warmth  (0..1 scalars)
 *   - orientation (portrait | landscape | square)
 *   - visual_group  (dark-cinematic, warm-luxury, red-power, …)
 *   - mood, suggested_collection
 *   - layout_weight (featured | large | medium | small)
 *   - featured_score (0..1)
 *
 * Writes web/public/gallery-manifest.json — the only file the
 * /gallery-intelligent page reads at runtime.
 *
 * Constraints honoured (per CLAUDE.md & task spec):
 *   - No external API calls, no uploads, no model downloads.
 *   - No image bytes are required — we work from the blurhash that
 *     the existing build:images pipeline already produced. The
 *     blurhash is a low-res perceptual encoding of the image, so
 *     colour / brightness / contrast extracted from it are a faithful
 *     signal for editorial layout decisions.
 *   - Face detection is intentionally a stub (face_count = 0) — the
 *     schema is in place so a future pass can fill it in without
 *     reshaping the manifest.
 *
 * Run:    node scripts/build-gallery-index.js
 * Output: web/public/gallery-manifest.json
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { decode as decodeBlurhash } from "blurhash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SOURCE_MANIFEST = path.join(ROOT, "src", "lib", "imageManifest.json");
const OUT_MANIFEST = path.join(ROOT, "public", "gallery-manifest.json");

const SAMPLE = 32; // blurhash decode resolution — 1024 pixels is plenty for colour stats

// Map filename prefix → category metadata. Mirrors the existing site IA
// (ads, fashion, heritage, realestate, characters, films) so collection
// links stay shareable and predictable.
const CATEGORY_RULES = [
  { test: /^\/works\/ads\//,            id: "ads",          label: "Commercial Ads" },
  { test: /^\/works\/fashion\//,        id: "fashion",      label: "Fashion" },
  { test: /^\/works\/heritage\//,       id: "heritage",     label: "Heritage" },
  { test: /^\/works\/realestate\//,     id: "realestate",   label: "Real Estate" },
  { test: /^\/works\/trained_models\//, id: "characters",   label: "Characters" },
  { test: /^\/works\/banners\//,        id: "banners",      label: "Banners" },
  { test: /^\/works\/poster_/,          id: "films",        label: "Films" },
];

function categoryFor(p) {
  for (const r of CATEGORY_RULES) if (r.test.test(p)) return r;
  return { id: "experimental", label: "Experimental" };
}

// --- colour math --------------------------------------------------------

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

function rgbToHex(r, g, b) {
  const to = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
  return "#" + to(r) + to(g) + to(b);
}

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const round3 = (n) => Math.round(n * 1000) / 1000;

// Cheap k-means over a 32x32 RGBA buffer. Returns clusters sorted by
// weight (most prevalent first). 5 clusters × 6 iterations is enough to
// resolve a stable palette on a low-res blurhash decode.
function paletteOf(pixels, k = 5, iters = 6) {
  const n = pixels.length / 4;
  const centroids = [];
  for (let i = 0; i < k; i++) {
    const idx = Math.floor((i + 0.5) * n / k);
    const o = idx * 4;
    centroids.push([pixels[o], pixels[o + 1], pixels[o + 2]]);
  }
  const assign = new Uint8Array(n);
  for (let it = 0; it < iters; it++) {
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      const r = pixels[o], g = pixels[o + 1], b = pixels[o + 2];
      let best = 0, bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const dr = r - centroids[c][0];
        const dg = g - centroids[c][1];
        const db = b - centroids[c][2];
        const d = dr * dr + dg * dg + db * db;
        if (d < bestD) { bestD = d; best = c; }
      }
      assign[i] = best;
    }
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let i = 0; i < n; i++) {
      const o = i * 4, c = assign[i];
      sums[c][0] += pixels[o];
      sums[c][1] += pixels[o + 1];
      sums[c][2] += pixels[o + 2];
      sums[c][3] += 1;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c][3] > 0) {
        centroids[c] = [
          Math.round(sums[c][0] / sums[c][3]),
          Math.round(sums[c][1] / sums[c][3]),
          Math.round(sums[c][2] / sums[c][3]),
        ];
      }
    }
  }
  const counts = new Array(k).fill(0);
  for (let i = 0; i < n; i++) counts[assign[i]]++;
  return centroids
    .map((c, i) => ({ rgb: c, weight: counts[i] / n }))
    .sort((a, b) => b.weight - a.weight);
}

function analyzePixels(pixels) {
  const n = pixels.length / 4;
  let sumL = 0, sumS = 0, sumR = 0, sumG = 0, sumB = 0;
  const ls = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const r = pixels[o], g = pixels[o + 1], b = pixels[o + 2];
    sumR += r; sumG += g; sumB += b;
    const { s, l } = rgbToHsl(r, g, b);
    sumS += s;
    sumL += l;
    ls[i] = l;
  }
  const meanL = sumL / n;
  let sumLSq = 0;
  for (let i = 0; i < n; i++) {
    const d = ls[i] - meanL;
    sumLSq += d * d;
  }
  const stdL = Math.sqrt(sumLSq / n);
  const meanR = sumR / n, meanG = sumG / n, meanB = sumB / n;
  // Warmth: 0 = very cool/blue, 1 = very warm/red. Anchor at 0.5 = neutral.
  const warmth = clamp(((meanR + meanG * 0.5) - meanB) / 255 + 0.5, 0, 1);
  return {
    brightness: round3(meanL),
    saturation: round3(sumS / n),
    contrast: round3(clamp(stdL * 2, 0, 1)),
    warmth: round3(warmth),
  };
}

function visualGroupOf(a, dominant) {
  const { brightness: L, saturation: S, contrast: C, warmth: W } = a;
  const { h: hue } = rgbToHsl(dominant[0], dominant[1], dominant[2]);
  if (L < 0.2) return "dark-cinematic";
  if (S < 0.12 && L > 0.55) return "soft-neutral";
  if (S < 0.15) return "monochrome";
  if (hue < 25 && S > 0.35) return "red-power";
  if (hue >= 25 && hue < 55 && W > 0.55 && L > 0.45) return "golden-mood";
  if (hue >= 25 && hue < 65 && W > 0.5) return "warm-luxury";
  if (hue >= 180 && hue < 250) return "cool-blue";
  if (C > 0.42 && L < 0.55) return "high-contrast";
  if (W > 0.6 && L > 0.4) return "warm-luxury";
  return "editorial";
}

function moodOf(group, category) {
  if (category.id === "films") return "Cinematic";
  if (category.id === "fashion") return "Fashion";
  if (category.id === "characters") return "Characters";
  if (category.id === "ads") return "Product Ads";
  if (category.id === "heritage") return "Heritage";
  if (category.id === "realestate") return "Architecture";
  if (group === "dark-cinematic") return "Cinematic";
  if (group === "warm-luxury" || group === "golden-mood") return "Luxury";
  return "Experimental";
}

// Editorial weighting — bigger tiles for images that earn the real estate.
// Editorial weighting. Thresholds were tuned against the live 379-image
// distribution so the result is roughly: 10% featured, 15% large,
// 25% medium, 50% small. Re-run the indexer if scoring changes.
function weightOf(a, ratio) {
  const ratioBonus = 1 - Math.min(1, Math.abs(0.66 - ratio));
  const score = clamp(a.contrast * 0.4 + a.saturation * 0.35 + ratioBonus * 0.25, 0, 1);
  if (score > 0.53)  return { layout_weight: "featured", featured_score: round3(score) };
  if (score > 0.46)  return { layout_weight: "large",    featured_score: round3(score) };
  if (score > 0.38)  return { layout_weight: "medium",   featured_score: round3(score) };
  return { layout_weight: "small", featured_score: round3(score) };
}

function orientationOf(ar) {
  if (ar > 1.05) return "landscape";
  if (ar < 0.95) return "portrait";
  return "square";
}

function idOf(p) {
  return p.replace(/^\//, "").replace(/\.[a-z]+$/i, "").replace(/[\\/]/g, "-");
}

async function run() {
  const raw = JSON.parse(await fs.readFile(SOURCE_MANIFEST, "utf8"));
  const entries = Object.entries(raw);
  const items = [];
  let analyzed = 0, skipped = 0;
  const t0 = Date.now();

  for (const [pathKey, meta] of entries) {
    const { width, height, blurhash } = meta;
    const aspectRatio = meta.aspectRatio ?? (width && height ? width / height : 1);
    if (!blurhash) { skipped++; continue; }

    let pixels;
    try {
      pixels = decodeBlurhash(blurhash, SAMPLE, SAMPLE);
    } catch (e) {
      console.warn("blurhash decode failed:", pathKey, e.message);
      skipped++;
      continue;
    }

    const analysis = analyzePixels(pixels);
    const palette = paletteOf(pixels, 5);
    const dominantRgb = palette[0].rgb;
    const cat = categoryFor(pathKey);
    const group = visualGroupOf(analysis, dominantRgb);
    const mood = moodOf(group, cat);
    const orientation = orientationOf(aspectRatio);
    const lw = weightOf(analysis, aspectRatio);

    items.push({
      id: idOf(pathKey),
      image_url: pathKey,
      filename: pathKey.split("/").pop(),
      width,
      height,
      aspect_ratio: round3(aspectRatio),
      orientation,
      dominant_color: rgbToHex(dominantRgb[0], dominantRgb[1], dominantRgb[2]),
      color_palette: palette.map(c => rgbToHex(c.rgb[0], c.rgb[1], c.rgb[2])),
      brightness_score: analysis.brightness,
      contrast_score: analysis.contrast,
      saturation_score: analysis.saturation,
      warmth_score: analysis.warmth,
      face_count: 0,
      face_position: null,
      visual_group: group,
      suggested_collection: cat.id,
      mood,
      layout_weight: lw.layout_weight,
      featured_score: lw.featured_score,
      blurhash,
    });
    analyzed++;
  }

  // Stable order: by collection then by featured score (descending).
  // Runtime view modes can re-sort however they like.
  items.sort((a, b) =>
    a.suggested_collection.localeCompare(b.suggested_collection) ||
    b.featured_score - a.featured_score
  );

  // Distinct group / mood / collection summaries — useful for UI chips.
  const summary = (key) => Array.from(items.reduce((m, it) => {
    m.set(it[key], (m.get(it[key]) || 0) + 1);
    return m;
  }, new Map()).entries()).map(([id, count]) => ({ id, count }));

  const result = {
    generated_at: new Date().toISOString(),
    count: items.length,
    collections: summary("suggested_collection"),
    moods: summary("mood"),
    visual_groups: summary("visual_group"),
    items,
  };

  await fs.mkdir(path.dirname(OUT_MANIFEST), { recursive: true });
  await fs.writeFile(OUT_MANIFEST, JSON.stringify(result));
  const t = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`gallery-index: ${analyzed}/${entries.length} indexed (${skipped} skipped) in ${t}s`);
  console.log(`               → ${path.relative(process.cwd(), OUT_MANIFEST)}`);
  console.log(`               collections: ${result.collections.map(c => `${c.id}(${c.count})`).join(", ")}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
