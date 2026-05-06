// Sorting / grouping helpers that drive the View Modes on the
// /gallery-intelligent page. All operate on items from
// public/gallery-manifest.json — pure functions, no side effects.

const WEIGHT_RANK = { featured: 4, large: 3, medium: 2, small: 1 };

// Stable hash of a string id → 0..1. Used so "Random Editorial" is
// deterministic per session-seed (so the user can copy the URL and the
// other person sees the same arrangement).
function hash01(str, seed = 0) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 2654435761);
  }
  return ((h >>> 0) % 100000) / 100000;
}

// Curated: alternate orientations and visual_groups so adjacent tiles
// never feel like duplicates, while keeping the strongest images near
// the top of each cluster. Implementation:
//   1. Bucket items by visual_group.
//   2. Sort each bucket by featured_score desc.
//   3. Round-robin pull from buckets, biggest bucket first.
//   4. Inside the merged list, swap any two adjacent items that share
//      both visual_group and orientation.
export function arrangeCurated(items) {
  const buckets = new Map();
  for (const it of items) {
    if (!buckets.has(it.visual_group)) buckets.set(it.visual_group, []);
    buckets.get(it.visual_group).push(it);
  }
  for (const arr of buckets.values()) {
    arr.sort((a, b) => b.featured_score - a.featured_score);
  }
  const queues = [...buckets.values()].sort((a, b) => b.length - a.length);
  const out = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) {
      if (q.length) out.push(q.shift());
    }
  }
  for (let i = 1; i < out.length; i++) {
    if (
      out[i].visual_group === out[i - 1].visual_group &&
      out[i].orientation === out[i - 1].orientation &&
      i + 1 < out.length
    ) {
      [out[i], out[i + 1]] = [out[i + 1], out[i]];
    }
  }
  return out;
}

// Group by visual_group (color family), each group internally sorted
// by hue-ish proxy so neighbouring tiles flow softly.
export function arrangeByColor(items) {
  const ORDER = [
    "dark-cinematic",
    "red-power",
    "warm-luxury",
    "golden-mood",
    "soft-neutral",
    "monochrome",
    "high-contrast",
    "cool-blue",
    "editorial",
  ];
  const sorted = [...items].sort((a, b) => {
    const ai = ORDER.indexOf(a.visual_group);
    const bi = ORDER.indexOf(b.visual_group);
    if (ai !== bi) return ai - bi;
    return a.warmth_score - b.warmth_score;
  });
  return sorted;
}

export function arrangeByBrightness(items, direction = "dark-to-light") {
  const sorted = [...items].sort((a, b) => a.brightness_score - b.brightness_score);
  return direction === "light-to-dark" ? sorted.reverse() : sorted;
}

export function arrangeByFaces(items) {
  // Stub today — face_count is always 0. Once a future indexer pass
  // populates this, we can rank by close-up confidence.
  return items.filter((it) => it.face_count > 0);
}

export function arrangeByMood(items) {
  return [...items].sort(
    (a, b) =>
      a.mood.localeCompare(b.mood) ||
      WEIGHT_RANK[b.layout_weight] - WEIGHT_RANK[a.layout_weight] ||
      b.featured_score - a.featured_score,
  );
}

// Random but balanced: shuffle inside each group, then interleave so
// strong tiles aren't all clustered. Seed lets the URL be shareable.
export function arrangeRandomEditorial(items, seed = Date.now() % 9973) {
  const decorated = items
    .map((it) => ({ it, k: hash01(it.id, seed) }))
    .sort((a, b) => a.k - b.k);
  const featured = [];
  const rest = [];
  for (const { it } of decorated) {
    (WEIGHT_RANK[it.layout_weight] >= 3 ? featured : rest).push(it);
  }
  const out = [];
  let fi = 0, ri = 0;
  // Drop a featured tile every ~4 items so the page breathes.
  while (fi < featured.length || ri < rest.length) {
    if (fi < featured.length && (out.length % 4 === 0 || ri >= rest.length)) {
      out.push(featured[fi++]);
    } else if (ri < rest.length) {
      out.push(rest[ri++]);
    } else {
      out.push(featured[fi++]);
    }
  }
  return out;
}

// Cluster items into editorial sections — Curated mode renders these
// with a per-section background drawn from the section's palette.
// Each section starts with a featured/large tile.
export function buildSections(items, perSection = 12) {
  const sections = [];
  let current = null;
  for (const it of items) {
    if (!current || current.items.length >= perSection) {
      current = { id: `s-${sections.length}`, items: [], palette: it.color_palette, group: it.visual_group };
      sections.push(current);
    }
    current.items.push(it);
  }
  // Hoist the strongest tile in each section to position 0 so the
  // section "opens" with a hero.
  for (const s of sections) {
    s.items.sort((a, b) => WEIGHT_RANK[b.layout_weight] - WEIGHT_RANK[a.layout_weight] || b.featured_score - a.featured_score);
    // Re-spread by orientation after the hero so the masonry breathes.
    const [hero, ...tail] = s.items;
    const portraits = tail.filter((t) => t.orientation === "portrait");
    const landscapes = tail.filter((t) => t.orientation === "landscape");
    const squares = tail.filter((t) => t.orientation === "square");
    const merged = [];
    while (portraits.length || landscapes.length || squares.length) {
      if (portraits.length) merged.push(portraits.shift());
      if (landscapes.length) merged.push(landscapes.shift());
      if (portraits.length) merged.push(portraits.shift());
      if (squares.length) merged.push(squares.shift());
    }
    s.items = [hero, ...merged];
    // Section palette = palette of the hero, lightly desaturated downstream in CSS.
    s.palette = hero.color_palette;
    s.dominant = hero.dominant_color;
    s.group = hero.visual_group;
  }
  return sections;
}

export function filterByCollection(items, collection) {
  if (!collection || collection === "all") return items;
  // Allow both suggested_collection and visual_group-style ids so
  // /gallery-intelligent?collection=cinematic works alongside ?collection=fashion.
  const wantedGroups = MOOD_TO_GROUP[collection];
  return items.filter((it) =>
    it.suggested_collection === collection ||
    it.mood.toLowerCase() === collection.toLowerCase() ||
    (wantedGroups && wantedGroups.includes(it.visual_group)),
  );
}

const MOOD_TO_GROUP = {
  cinematic: ["dark-cinematic", "high-contrast"],
  luxury: ["warm-luxury", "golden-mood"],
  warm: ["warm-luxury", "golden-mood", "red-power"],
  dark: ["dark-cinematic", "high-contrast"],
  red: ["red-power"],
  cool: ["cool-blue"],
  "high-contrast": ["high-contrast"],
};

// Public list of collections shown in the header chips, in display order.
// Arabic labels — the page is RTL-first.
export const COLLECTIONS = [
  { id: "all",          label: "الكل" },
  { id: "characters",   label: "شخصيات" },
  { id: "fashion",      label: "أزياء" },
  { id: "ads",          label: "إعلانات" },
  { id: "films",        label: "سينمائي" },
  { id: "heritage",     label: "تراث" },
  { id: "realestate",   label: "معمار" },
  { id: "luxury",       label: "صحراء" },
  { id: "dark",         label: "ليل" },
  { id: "red",          label: "أحمر" },
];

export const VIEW_MODES = [
  { id: "curated",       label: "مُنتقى" },
  { id: "by-color",      label: "حسب اللون" },
  { id: "by-brightness", label: "حسب الضوء" },
  { id: "by-mood",       label: "حسب المزاج" },
  { id: "random",        label: "عشوائي" },
];

export function arrangeForView(items, view, seed) {
  switch (view) {
    case "by-color":      return arrangeByColor(items);
    case "by-brightness": return arrangeByBrightness(items);
    case "by-faces":      return arrangeByFaces(items);
    case "by-mood":       return arrangeByMood(items);
    case "random":        return arrangeRandomEditorial(items, seed);
    case "curated":
    default:              return arrangeCurated(items);
  }
}
