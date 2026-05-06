// Visual Chapters for the Curated view. Each chapter is one panel in
// the page — Arabic title, optional subtitle, and a `match` predicate
// against an item from gallery-manifest.json.
//
// Items are assigned greedily — the first chapter that claims an item
// owns it. The order below therefore matters: identity-driven chapters
// (شخصيات / أزياء / إعلانات) come first; mood chapters (أحمر / صحراء
// / ليل / هدوء) sweep up everything else. A final تجارب catches
// anything that didn't fit so no image is ever lost.

export const CHAPTERS = [
  {
    id: "characters",
    title: "شخصيات",
    subtitle: "نماذج مدرَّبة، وجوه، حضور.",
    match: (it) => it.suggested_collection === "characters",
  },
  {
    id: "fashion",
    title: "أزياء",
    subtitle: "أناقة بصريّة، ضوء وقماش.",
    match: (it) => it.suggested_collection === "fashion",
  },
  {
    id: "cinema",
    title: "سينمائي",
    subtitle: "كادرات، مزاج، ظِل.",
    match: (it) =>
      it.suggested_collection === "films" ||
      (it.visual_group === "dark-cinematic" && it.suggested_collection !== "ads"),
  },
  {
    id: "ads",
    title: "إعلانات",
    subtitle: "منتجات وحملات.",
    match: (it) => it.suggested_collection === "ads",
  },
  {
    id: "heritage",
    title: "تراث",
    subtitle: "ذاكرة الجزيرة بصريًّا.",
    match: (it) => it.suggested_collection === "heritage",
  },
  {
    id: "architecture",
    title: "معمار",
    subtitle: "فضاءات، أحجام، خطوط.",
    match: (it) => it.suggested_collection === "realestate",
  },
  {
    id: "red",
    title: "أحمر",
    subtitle: "قوة لون واحدة.",
    match: (it) => it.visual_group === "red-power",
  },
  {
    id: "desert",
    title: "صحراء",
    subtitle: "دفء، رمل، ذهب.",
    match: (it) => it.visual_group === "warm-luxury" || it.visual_group === "golden-mood",
  },
  {
    id: "night",
    title: "ليل",
    subtitle: "ظلام مدروس.",
    match: (it) => it.brightness_score < 0.22,
  },
  {
    id: "calm",
    title: "هدوء",
    subtitle: "ألوان مكتومة.",
    match: (it) =>
      it.visual_group === "soft-neutral" ||
      it.visual_group === "monochrome" ||
      it.visual_group === "cool-blue",
  },
  {
    id: "experiments",
    title: "تجارب",
    subtitle: "ما لا يُصنَّف.",
    match: () => true,
  },
];

// Greedy assignment. Returns `[{ chapter, items }]` in display order.
// Empty chapters are dropped so the page never shows a hollow heading.
export function assignChapters(items) {
  const buckets = new Map(CHAPTERS.map((c) => [c.id, { chapter: c, items: [] }]));
  for (const it of items) {
    for (const c of CHAPTERS) {
      if (c.match(it)) {
        buckets.get(c.id).items.push(it);
        break;
      }
    }
  }
  // Sort each bucket by featured_score so each chapter "opens" with a hero,
  // then re-spread by orientation so the masonry breathes (portrait /
  // landscape / portrait / square pattern).
  const out = [];
  for (const c of CHAPTERS) {
    const bucket = buckets.get(c.id);
    if (!bucket.items.length) continue;
    bucket.items.sort((a, b) => b.featured_score - a.featured_score);
    const [hero, ...tail] = bucket.items;
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
    bucket.items = [hero, ...merged];
    out.push(bucket);
  }
  return out;
}
