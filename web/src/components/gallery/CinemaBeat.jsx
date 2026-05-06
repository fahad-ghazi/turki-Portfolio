import React from "react";
import CinemaImage from "./CinemaImage";

/**
 * Renders one beat from the cinema sequence. Eight beat types:
 *
 *   silence      — pure breathing room, no image
 *   single       — one image, near full-bleed (or contained for variation)
 *   solo-quiet   — small image floating in a tall empty section (rest)
 *   triptych     — three side-by-side, stacked on mobile
 *   cluster      — asymmetric 4-image arrangement on desktop, 2x2 on mobile
 *   pair         — two images, breath between them
 *   oversized    — single image that exceeds the viewport vertically
 *   montage      — five images, dense vertical strip on mobile, 5-up on desktop
 *
 * All beat heights are expressed in viewport units so the rhythm
 * holds across screen sizes. We never use scroll-snap — the cadence
 * comes from the beat heights, not from forced stops.
 */
export default function CinemaBeat({ beat, index, onOpen }) {
  if (beat.type === "silence") {
    return (
      <div
        aria-hidden="true"
        className="w-full"
        style={{ height: `${beat.height || 10}vh` }}
      />
    );
  }

  // First non-silence beat is the intro.
  const isIntro = index === 0;

  switch (beat.type) {
    case "single":
      return <BeatSingle beat={beat} isIntro={isIntro} onOpen={onOpen} />;
    case "solo-quiet":
      return <BeatSoloQuiet beat={beat} onOpen={onOpen} />;
    case "triptych":
      return <BeatTriptych beat={beat} onOpen={onOpen} />;
    case "cluster":
      return <BeatCluster beat={beat} onOpen={onOpen} />;
    case "pair":
      return <BeatPair beat={beat} onOpen={onOpen} />;
    case "oversized":
      return <BeatOversized beat={beat} onOpen={onOpen} />;
    case "montage":
      return <BeatMontage beat={beat} onOpen={onOpen} />;
    default:
      return null;
  }
}

// --- Beat layouts -------------------------------------------------------

function BeatSingle({ beat, isIntro, onOpen }) {
  const item = beat.items[0];
  // Contained singles get a max-width so they read as a "frame" rather
  // than a full-bleed shock — a softer note in the score.
  const containerCls = beat.contained
    ? "mx-auto w-[88vw] max-w-[1100px]"
    : "w-full";
  return (
    <section className={containerCls}>
      <CinemaImage
        item={item}
        eager={isIntro}
        intro={isIntro}
        sizes="100vw"
        style={{
          aspectRatio: String(item.aspect_ratio || 1),
          maxHeight: beat.contained ? "82vh" : "92vh",
        }}
        onOpen={onOpen}
      />
    </section>
  );
}

function BeatSoloQuiet({ beat, onOpen }) {
  const item = beat.items[0];
  return (
    <section
      className="flex w-full items-center justify-center"
      style={{ minHeight: "92vh" }}
    >
      <div
        className="w-[68vw] md:w-[34vw]"
        style={{ maxWidth: "560px" }}
      >
        <CinemaImage
          item={item}
          sizes="(min-width: 768px) 34vw, 68vw"
          style={{ aspectRatio: String(item.aspect_ratio || 0.75) }}
          onOpen={onOpen}
        />
      </div>
    </section>
  );
}

function BeatTriptych({ beat, onOpen }) {
  return (
    <section className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
      {beat.items.map((it) => (
        <CinemaImage
          key={it.id}
          item={it}
          sizes="(min-width: 768px) 33vw, 100vw"
          style={{ aspectRatio: String(it.aspect_ratio || 1) }}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

function BeatCluster({ beat, onOpen }) {
  // Asymmetric arrangement on desktop — staggered vertical offsets so
  // it never reads as a 2x2 grid. On mobile we collapse to a tight 2x2
  // because asymmetry on small screens just creates awkward gaps.
  const desktopSlots = [
    "md:col-start-1 md:col-end-7  md:row-start-1",
    "md:col-start-8 md:col-end-13 md:row-start-1 md:mt-12",
    "md:col-start-2 md:col-end-7  md:row-start-2 md:-mt-10",
    "md:col-start-7 md:col-end-12 md:row-start-2 md:mt-6",
  ];
  return (
    <section className="mx-auto w-full max-w-[1280px]">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:gap-4">
        {beat.items.slice(0, 4).map((it, i) => (
          <CinemaImage
            key={it.id}
            item={it}
            sizes="(min-width: 768px) 30vw, 50vw"
            className={desktopSlots[i] || ""}
            style={{ aspectRatio: String(it.aspect_ratio || 1) }}
            onOpen={onOpen}
          />
        ))}
      </div>
    </section>
  );
}

function BeatPair({ beat, onOpen }) {
  return (
    <section className="grid w-full grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
      {beat.items.map((it) => (
        <CinemaImage
          key={it.id}
          item={it}
          sizes="(min-width: 768px) 50vw, 100vw"
          style={{ aspectRatio: String(it.aspect_ratio || 1) }}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

function BeatOversized({ beat, onOpen }) {
  const item = beat.items[0];
  // Force a tall aspect so the image earns its "oversized" name. If the
  // source is landscape, we still let it dominate by using min-height.
  return (
    <section className="w-full">
      <CinemaImage
        item={item}
        sizes="100vw"
        style={{
          aspectRatio: String(item.aspect_ratio || 0.65),
          minHeight: "104vh",
        }}
        onOpen={onOpen}
      />
    </section>
  );
}

function BeatMontage({ beat, onOpen }) {
  // A 5-frame filmstrip. Always 5 columns — on mobile this becomes a
  // tight contact-sheet of small portraits, which is exactly the
  // "explosion of dense imagery" beat the score asks for. The narrow
  // tile width keeps the strip vertically short, so it functions as a
  // burst of energy between calmer beats.
  return (
    <section className="grid w-full grid-cols-5 gap-1 md:gap-2">
      {beat.items.map((it) => (
        <CinemaImage
          key={it.id}
          item={it}
          sizes="20vw"
          style={{ aspectRatio: String(it.aspect_ratio || 0.7) }}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}
