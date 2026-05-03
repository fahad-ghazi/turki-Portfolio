#!/usr/bin/env node
/**
 * 2026 image-delivery pipeline.
 *
 * For every JPG/PNG under web/public/works (and brand/), this script
 * produces:
 *
 *   - <name>-480w.avif    <name>-480w.webp    <name>-480w.jpg
 *   - <name>-960w.avif    <name>-960w.webp    <name>-960w.jpg
 *   - <name>-1440w.avif   <name>-1440w.webp   <name>-1440w.jpg
 *   - <name>-1920w.avif   <name>-1920w.webp   <name>-1920w.jpg
 *
 * (only widths ≤ original; sharp won't upscale)
 *
 * Plus a blurhash for instant placeholder rendering.
 *
 * Output is written next to the original. The original JPG is kept as
 * the ultimate fallback for ancient browsers and as the canonical link
 * target. Clean up old Phase-1 .webp files (single-size) so we have one
 * coherent generation on disk.
 *
 * The metadata for every image (its widths actually generated, its
 * intrinsic dimensions, and its blurhash) is dumped to
 * web/src/lib/imageManifest.json so the Picture component can pick the
 * right srcset and show a blurred placeholder while the real image
 * loads.
 *
 * Run:   npm run build:images
 * (Wraps:  node tools/build-images.mjs)
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import sharp from "sharp";
import { encode as encodeBlurhash } from "blurhash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, "..", "public");
const WORKS_ROOT = path.join(PUBLIC_ROOT, "works");
const BRAND_ROOT = path.join(PUBLIC_ROOT, "brand");
const MANIFEST_PATH = path.resolve(__dirname, "..", "src", "lib", "imageManifest.json");

// 480 mobile portrait (1x dpr small phones), 960 mobile retina + tablet,
// 1440 laptop, 1920 large desktop / Retina iPhone full-bleed.
const WIDTHS = [480, 960, 1440, 1920];
const FORMATS = ["avif", "webp", "jpg"];
const FORMAT_OPTS = {
  avif: { quality: 60, effort: 5 }, // AVIF q60 ≈ JPG q85 visually but ~50% smaller
  webp: { quality: 82, smartSubsample: true, effort: 5 },
  jpg: { quality: 84, mozjpeg: true, progressive: true },
};

const RASTER_RE = /\.(jpe?g|png)$/i;

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else if (e.isFile() && RASTER_RE.test(e.name)) {
      yield full;
    }
  }
}

function variantPath(filePath, width, format) {
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const formatExt = format === "jpg" ? "jpg" : format;
  return `${base}-${width}w.${formatExt}`;
}

function publicUrl(filePath) {
  // /Users/.../web/public/works/foo/bar.jpg → /works/foo/bar.jpg
  const rel = path.relative(PUBLIC_ROOT, filePath);
  return "/" + rel.split(path.sep).join("/");
}

async function generateBlurhash(buffer) {
  // 32×32 sample is the sweet spot — small enough to encode quickly,
  // large enough to give a recognisable preview.
  const { data, info } = await sharp(buffer)
    .resize(32, 32, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encodeBlurhash(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
}

async function processOne(filePath, manifest) {
  const start = performance.now();
  const original = await fs.readFile(filePath);
  const metadata = await sharp(original).metadata();
  const origWidth = metadata.width ?? 0;
  const origHeight = metadata.height ?? 0;

  // Only emit widths that are ≤ the source. Sharp would happily
  // upscale but that just makes a blurry larger file. Always include
  // the original width as the largest variant so high-DPR phones get
  // the full source resolution even when the source sits between
  // buckets (e.g. 1280px → emit 480w, 960w, 1280w).
  const eligibleWidths = WIDTHS.filter((w) => w < origWidth);
  if (origWidth > 0) eligibleWidths.push(origWidth);

  const written = [];
  for (const width of eligibleWidths) {
    for (const format of FORMATS) {
      const out = variantPath(filePath, width, format);
      // Skip if already up-to-date — fast no-op when re-running
      try {
        const existing = await fs.stat(out);
        const src = await fs.stat(filePath);
        if (existing.mtimeMs > src.mtimeMs) continue;
      } catch {
        /* missing → generate */
      }

      const pipeline = sharp(original).resize(width, null, { fit: "inside", withoutEnlargement: true });
      if (format === "avif") {
        await pipeline.avif(FORMAT_OPTS.avif).toFile(out);
      } else if (format === "webp") {
        await pipeline.webp(FORMAT_OPTS.webp).toFile(out);
      } else {
        await pipeline.jpeg(FORMAT_OPTS.jpg).toFile(out);
      }
      written.push(out);
    }
  }

  const blurhash = await generateBlurhash(original);

  manifest[publicUrl(filePath)] = {
    width: origWidth,
    height: origHeight,
    blurhash,
    widths: eligibleWidths,
    aspectRatio: origHeight && origWidth ? +(origWidth / origHeight).toFixed(4) : null,
  };

  const elapsed = (performance.now() - start).toFixed(0);
  return { written: written.length, elapsed };
}

async function main() {
  const t0 = performance.now();
  const manifest = {};

  let total = 0;
  let producedFiles = 0;

  // Walk works/ + brand/
  for (const root of [WORKS_ROOT, BRAND_ROOT]) {
    try {
      await fs.access(root);
    } catch {
      continue;
    }
    for await (const file of walk(root)) {
      // Skip already-generated variants (anything with -NNNw.X)
      if (/-\d+w\.(avif|webp|jpg|jpeg|png)$/i.test(file)) continue;
      total += 1;
      const { written } = await processOne(file, manifest);
      producedFiles += written;
      if (total % 25 === 0) {
        process.stdout.write(`  …${total} sources processed\n`);
      }
    }
  }

  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const seconds = ((performance.now() - t0) / 1000).toFixed(1);
  console.log("");
  console.log(`✓ Processed ${total} source images in ${seconds}s`);
  console.log(`✓ Wrote ${producedFiles} new variants`);
  console.log(`✓ Manifest: ${path.relative(process.cwd(), MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error("✗ build-images failed:", err);
  process.exit(1);
});
