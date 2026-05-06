import React from "react";
import CinemaImage from "./CinemaImage";

/**
 * Renders one beat from the cinema sequence. Eight beat types:
 *
 *   silence      — pure breathing room, no image (4–14vh)
 *   single       — one image, optionally contained
 *   solo-quiet   — small image floating in vertical padding (rest)
 *   triptych     — three side-by-side film frames
 *   cluster      — clean 2x2 of film frames
 *   pair         — two side-by-side film frames
 *   oversized    — single tall image (85–100vh)
 *   montage      — five-frame filmstrip (≤30vh)
 *
 * IMPORTANT: every grouped beat (pair / triptych / cluster / montage)
 * uses a UNIFORM aspect ratio across its tiles, computed as the clamped
 * average of the items' aspect ratios. The cinema uses this discipline
 * to read as a single composition rather than a Pinterest-style row of
 * mismatched cards. Each tile uses object-cover so any minor crop is
 * absorbed gracefully.
 */
export default function CinemaBeat({ beat, index, onOpen }) {
  if (beat.type === "silence") {
    return (
      <div
        aria-hidden="true"
        className="w-full"
        style={{ height: `${beat.height || 6}vh` }}
      />
    );
  }

  const isIntro = index === 0;

  switch (beat.type) {
    case "single":      return <BeatSingle      beat={beat} isIntro={isIntro} onOpen={onOpen} />;
    case "solo-quiet":  return <BeatSoloQuiet   beat={beat} onOpen={onOpen} />;
    case "triptych":    return <BeatTriptych    beat={beat} onOpen={onOpen} />;
    case "cluster":     return <BeatCluster     beat={beat} onOpen={onOpen} />;
    case "pair":        return <BeatPair        beat={beat} onOpen={onOpen} />;
    case "oversized":   return <BeatOversized   beat={beat} onOpen={onOpen} />;
    case "montage":     return <BeatMontage     beat={beat} onOpen={onOpen} />;
    default: return null;
  }
}

// Average aspect ratio of a beat's items, clamped so a single very-tall
// or very-wide image can't pull the entire group into a strange shape.
function uniformAspect(items, min = 0.7, max = 1.4) {
  const avg = items.reduce((s, it) => s + (it.aspect_ratio || 1), 0) / items.length;
  return Math.max(min, Math.min(max, avg));
}

// --- Beat layouts -------------------------------------------------------

function BeatSingle({ beat, isIntro, onOpen }) {
  const item = beat.items[0];
  const ar = item.aspect_ratio || 1;
  // Cap by viewport HEIGHT, then back-solve width from the image's
  // natural aspect ratio. This preserves image proportions exactly
  // (no stretch, no awkward crop) while ensuring the beat fits the
  // viewport. The intro hero gets a slightly larger cap so it lands
  // like an opening shot.
  const heightCap = isIntro ? 92 : (beat.contained ? 72 : 86);
  const widthMax = beat.contained ? 88 : 100;
  return (
    <section className="flex w-full justify-center">
      <CinemaImage
        item={item}
        eager={isIntro}
        intro={isIntro}
        sizes="100vw"
        style={{
          aspectRatio: String(ar),
          width: `min(${widthMax}vw, calc(${heightCap}vh * ${ar}))`,
          maxHeight: `${heightCap}vh`,
        }}
        onOpen={onOpen}
      />
    </section>
  );
}

function BeatSoloQuiet({ beat, onOpen }) {
  const item = beat.items[0];
  const ar = item.aspect_ratio || 0.75;
  return (
    <section className="flex w-full justify-center py-10 md:py-20">
      <CinemaImage
        item={item}
        sizes="(min-width: 768px) 32vw, 68vw"
        style={{
          aspectRatio: String(ar),
          // Mobile-first sizing — small framed image. The min() falls back
          // to whichever constraint is tighter, so the tile always fits.
          width: `min(68vw, calc(56vh * ${ar}), 520px)`,
          maxHeight: "56vh",
        }}
        onOpen={onOpen}
      />
    </section>
  );
}

function BeatTriptych({ beat, onOpen }) {
  const ar = uniformAspect(beat.items, 0.7, 1.1);
  return (
    <section className="grid w-full grid-cols-3 gap-1.5 md:gap-3">
      {beat.items.map((it) => (
        <CinemaImage
          key={it.id}
          item={it}
          sizes="33vw"
          style={{ aspectRatio: String(ar) }}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

function BeatCluster({ beat, onOpen }) {
  // Clean 2x2 with a uniform aspect — reads as one composition. The
  // earlier asymmetric "fashion editorial" placement left visible empty
  // grid cells, which broke the cinematic continuity.
  const ar = uniformAspect(beat.items, 0.85, 1.15);
  return (
    <section className="mx-auto w-full max-w-[1100px]">
      <div className="grid grid-cols-2 gap-1.5 md:gap-3">
        {beat.items.slice(0, 4).map((it) => (
          <CinemaImage
            key={it.id}
            item={it}
            sizes="(min-width: 768px) 32vw, 50vw"
            style={{ aspectRatio: String(ar) }}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function BeatPair({ beat, onOpen }) {
  const ar = uniformAspect(beat.items, 0.7, 1.2);
  return (
    <section className="grid w-full grid-cols-2 gap-1.5 md:gap-4">
      {beat.items.map((it) => (
        <CinemaImage
          key={it.id}
          item={it}
          sizes="50vw"
          style={{ aspectRatio: String(ar) }}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

function BeatOversized({ beat, onOpen }) {
  const item = beat.items[0];
  const ar = item.aspect_ratio || 0.7;
  // "Boom" beat — same width-from-height technique as BeatSingle so the
  // image keeps its native shape. Pushed slightly taller (98vh) so it
  // dominates the viewport without breaking the film.
  return (
    <section className="flex w-full justify-center">
      <CinemaImage
        item={item}
        sizes="100vw"
        style={{
          aspectRatio: String(ar),
          width: `min(100vw, calc(98vh * ${ar}))`,
          maxHeight: "100vh",
          minHeight: "78vh",
        }}
        onOpen={onOpen}
      />
    </section>
  );
}

function BeatMontage({ beat, onOpen }) {
  const ar = uniformAspect(beat.items, 0.6, 0.9);
  return (
    <section className="grid w-full grid-cols-5 gap-1 md:gap-2">
      {beat.items.map((it) => (
        <CinemaImage
          key={it.id}
          item={it}
          sizes="20vw"
          style={{ aspectRatio: String(ar) }}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}
