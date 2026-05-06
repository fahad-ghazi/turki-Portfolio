// Cinema sequencer — turns a flat list of manifest items into a list
// of "beats" (visual events) that scroll like a slow film, not a feed.
//
// Three principles guide every beat decision:
//
//   1. Visual proximity — adjacent beats use perceptually similar
//      images so the palette flows like a single take. The eye glides;
//      it never lurches.
//
//   2. Deliberate rhythm — the beat pattern is fixed but never repeats
//      back-to-back. After a heavy beat (oversized / single hero) the
//      next beat is always lighter (silence or rest). After a calm
//      stretch, energy returns. We compose tension and release like
//      music.
//
//   3. Hero gravity — at scheduled positions the sequencer reaches
//      into the upcoming window and pulls the highest-energy image
//      forward. Same for "rest" beats which reach for the calmest,
//      lowest-saturation image. The result: the strong images land
//      *where* they belong, not in the order the indexer happened to
//      output.

// --- 1. Visual proximity sort ------------------------------------------

// One-dimensional perceptual coordinate. Two images with similar
// coordinates look related when placed side-by-side. We weight warmth
// most strongly because hue temperature is the most legible global
// shift; brightness next; saturation as a tie-breaker.
function visualCoord(it) {
  return (
    it.warmth_score      * 0.50 +
    it.brightness_score  * 0.30 +
    it.saturation_score  * 0.20
  );
}

// Sort the deck along the perceptual axis, but introduce a small,
// repeating "breath" so we don't smear the entire page into one
// continuous gradient. Every ~14 items we pull a contrasting image
// forward — a beat of disruption inside the smooth flow.
function arrangeForCinema(items) {
  const sorted = [...items].sort((a, b) => visualCoord(a) - visualCoord(b));
  const out = [];
  const breathStride = 14;
  let breathPool = [...sorted].reverse(); // furthest images, used as occasional shocks
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i > 0 && i % breathStride === 0 && breathPool.length) {
      const shock = breathPool.shift();
      // Avoid duplicating an item we already placed.
      if (!out.includes(shock)) out.push(shock);
    }
  }
  // Dedupe while preserving order.
  const seen = new Set();
  return out.filter((it) => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
}

// --- 2. Beat pattern ----------------------------------------------------

// One full cycle of the score. The sequencer cycles through this list
// indefinitely until the deck is consumed. Silences are zero-image
// beats — pure breathing room. The pattern was tuned by ear (so to
// speak): heavy → light, dense → quiet, surprise every ~6 beats.
//
// `consume` = how many images this beat eats from the deck.
// `weight`  = "hero" pulls forward a high-energy image; "rest" pulls
//             forward a low-energy one; otherwise sequential.
const PATTERN = [
  { type: "single",        consume: 1, weight: "hero", contained: false },  // open with bang
  { type: "silence",       height: 14 },
  { type: "triptych",      consume: 3 },
  { type: "silence",       height: 8 },
  { type: "solo-quiet",    consume: 1, weight: "rest" },
  { type: "cluster",       consume: 4 },
  { type: "silence",       height: 12 },
  { type: "single",        consume: 1, contained: true },
  { type: "pair",          consume: 2 },
  { type: "silence",       height: 10 },
  { type: "oversized",     consume: 1, weight: "hero" },
  { type: "silence",       height: 18 },
  { type: "montage",       consume: 5 },
  { type: "silence",       height: 8 },
  { type: "single",        consume: 1, contained: true },
  { type: "triptych",      consume: 3 },
  { type: "solo-quiet",    consume: 1, weight: "rest" },
  { type: "pair",          consume: 2 },
  { type: "silence",       height: 14 },
  { type: "cluster",       consume: 4 },
  { type: "single",        consume: 1, weight: "hero" },
  { type: "silence",       height: 10 },
  { type: "montage",       consume: 5 },
  { type: "solo-quiet",    consume: 1, weight: "rest" },
  { type: "oversized",     consume: 1, weight: "hero" },
  { type: "silence",       height: 16 },
];

function pullImage(deck, weight) {
  if (!deck.length) return null;
  if (weight === "hero") {
    // Look ahead 16 items for a strong candidate, fall back to head.
    const window = Math.min(16, deck.length);
    let bestIdx = 0, best = -Infinity;
    for (let i = 0; i < window; i++) {
      const it = deck[i];
      const score =
        it.featured_score * 0.6 +
        it.contrast_score * 0.25 +
        it.saturation_score * 0.15;
      if (score > best) { best = score; bestIdx = i; }
    }
    return deck.splice(bestIdx, 1)[0];
  }
  if (weight === "rest") {
    // Look ahead 12 items for a calm candidate.
    const window = Math.min(12, deck.length);
    let bestIdx = 0, best = Infinity;
    for (let i = 0; i < window; i++) {
      const it = deck[i];
      const score =
        it.saturation_score * 0.5 +
        it.contrast_score * 0.5;
      if (score < best) { best = score; bestIdx = i; }
    }
    return deck.splice(bestIdx, 1)[0];
  }
  return deck.shift();
}

// --- 3. Public API ------------------------------------------------------

export function buildCinemaSequence(items) {
  const deck = arrangeForCinema(items);
  const beats = [];
  let p = 0;
  let safety = 0;

  while (deck.length && safety++ < 5000) {
    const tpl = PATTERN[p % PATTERN.length];
    p++;

    if (tpl.type === "silence") {
      // Skip silence at the very start — we want the open with an image.
      if (beats.length === 0) continue;
      // Never two silences in a row.
      if (beats[beats.length - 1].type === "silence") continue;
      beats.push({ type: "silence", height: tpl.height });
      continue;
    }

    const need = tpl.consume;
    if (deck.length < need) break;

    // Hero pulls one high-energy item; remainder are sequential neighbours
    // so the visual flow stays cohesive.
    const picked = [];
    if (tpl.weight) {
      const head = pullImage(deck, tpl.weight);
      if (head) picked.push(head);
      while (picked.length < need && deck.length) picked.push(deck.shift());
    } else {
      while (picked.length < need && deck.length) picked.push(deck.shift());
    }

    beats.push({
      type: tpl.type,
      items: picked,
      contained: !!tpl.contained,
      isHeroBeat: tpl.weight === "hero",
    });
  }

  // Ensure we end on a quiet beat so the page exhales.
  if (beats[beats.length - 1]?.type !== "silence") {
    beats.push({ type: "silence", height: 22 });
  }
  return beats;
}
