// Cinema sequencer — turns a flat list of manifest items into a list
// of "beats" (visual events) that scroll like a slow film, not a feed.
//
// Three principles guide every beat decision:
//
//   1. Visual proximity — adjacent beats use perceptually similar
//      images so the palette flows like a single take. The eye glides;
//      it never lurches.
//
//   2. Deliberate rhythm — the score is fixed but never repeats
//      back-to-back. Silences are rare and short — they're punctuation,
//      not paragraphs. Heavy → light → dense → quiet, like music.
//
//   3. Hero gravity — at scheduled positions the sequencer reaches
//      into the upcoming window and pulls the highest-energy image
//      forward. Same for "rest" beats which pull forward the calmest.
//      Strong images land where they belong, not in indexer order.

// --- 1. Visual proximity sort ------------------------------------------

function visualCoord(it) {
  return (
    it.warmth_score      * 0.50 +
    it.brightness_score  * 0.30 +
    it.saturation_score  * 0.20
  );
}

function arrangeForCinema(items) {
  const sorted = [...items].sort((a, b) => visualCoord(a) - visualCoord(b));
  const out = [];
  const breathStride = 14;
  const breathPool = [...sorted].reverse();
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i > 0 && i % breathStride === 0 && breathPool.length) {
      const shock = breathPool.shift();
      if (!out.includes(shock)) out.push(shock);
    }
  }
  const seen = new Set();
  return out.filter((it) => {
    if (seen.has(it.id)) return false;
    seen.add(it.id);
    return true;
  });
}

// --- 2. Beat pattern ----------------------------------------------------

// One full cycle of the score. Tuned against real screenshots — the
// previous score had ~35% silences which made the page feel scattered
// rather than rhythmic. This score is ~15% silence and never lets two
// quiet beats land in a row (a silence followed by a solo-quiet, or
// vice versa, would suck momentum out of the film).
//
// `consume` = how many images this beat eats from the deck.
// `weight`  = "hero" pulls forward a high-energy image; "rest" pulls
//             forward a low-energy one; otherwise sequential.
const PATTERN = [
  { type: "single",     consume: 1, weight: "hero" },
  { type: "triptych",   consume: 3 },
  { type: "pair",       consume: 2 },
  { type: "silence",    height: 6 },
  { type: "solo-quiet", consume: 1, weight: "rest" },
  { type: "cluster",    consume: 4 },
  { type: "single",     consume: 1, contained: true },
  { type: "montage",    consume: 5 },
  { type: "oversized",  consume: 1, weight: "hero" },
  { type: "silence",    height: 8 },
  { type: "triptych",   consume: 3 },
  { type: "pair",       consume: 2 },
  { type: "single",     consume: 1 },
  { type: "cluster",    consume: 4 },
  { type: "solo-quiet", consume: 1, weight: "rest" },
  { type: "montage",    consume: 5 },
  { type: "single",     consume: 1, weight: "hero" },
  { type: "silence",    height: 6 },
];

function pullImage(deck, weight) {
  if (!deck.length) return null;
  if (weight === "hero") {
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

  // Quiet beats — silence and solo-quiet — should never land back-to-back
  // or the page bottoms out. We track the previous type to skip duplicates.
  const isQuiet = (t) => t === "silence" || t === "solo-quiet";

  while (deck.length && safety++ < 5000) {
    const tpl = PATTERN[p % PATTERN.length];
    p++;

    const last = beats[beats.length - 1];

    if (tpl.type === "silence") {
      if (!last || isQuiet(last.type)) continue;
      beats.push({ type: "silence", height: tpl.height });
      continue;
    }

    // Skip a "rest" pull immediately after another quiet beat —
    // momentum needs to return.
    if (tpl.weight === "rest" && last && isQuiet(last.type)) {
      // Promote this slot to a normal sequential pick instead.
      const item = deck.shift();
      if (item) beats.push({ type: "single", items: [item], contained: true });
      continue;
    }

    const need = tpl.consume;
    if (deck.length < need) break;

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

  if (beats[beats.length - 1]?.type !== "silence") {
    beats.push({ type: "silence", height: 14 });
  }
  return beats;
}
