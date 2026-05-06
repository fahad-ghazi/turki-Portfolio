import React, { useMemo } from "react";
import GalleryTile from "./GalleryTile";
import { assignChapters } from "./galleryChapters";

/**
 * The masonry grid. Two rendering modes:
 *
 *   "curated" — assigns items into Visual Chapters (شخصيات / أزياء /
 *   سينمائي / أحمر / صحراء / ليل / هدوء / تجارب) and renders each
 *   chapter as a panel with an Arabic heading, a short subtitle, and
 *   a soft tinted wash drawn from the chapter's hero palette.
 *
 *   anything else — flat masonry sorted by the active view mode. No
 *   chapter chrome, just the tiles.
 *
 * The layout uses CSS Grid + `grid-auto-flow: dense` and per-tile
 * spans coming out of <GalleryTile>. We deliberately allow uneven
 * gaps and the occasional hero to break the rhythm — too uniform reads
 * as Pinterest, not editorial.
 */
export default function GalleryGrid({ items, view, onOpen }) {
  const chapters = useMemo(
    () => (view === "curated" ? assignChapters(items) : null),
    [items, view],
  );

  if (chapters && chapters.length > 1) {
    return (
      <div className="space-y-16 md:space-y-24">
        {chapters.map(({ chapter, items: chapterItems }, idx) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            items={chapterItems}
            firstChapter={idx === 0}
            onOpen={onOpen}
          />
        ))}
      </div>
    );
  }

  return <FlatGrid items={items} onOpen={onOpen} firstIsHero />;
}

function ChapterSection({ chapter, items, firstChapter, onOpen }) {
  const wash = useMemo(() => paletteWash(items[0]?.color_palette), [items]);
  return (
    <section className="relative">
      {/* Soft palette wash so each chapter has its own atmospheric tint.
          Falls behind the heading + grid; never strong enough to fight
          the photos. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-10 -z-0 h-72 rounded-[28px] blur-3xl"
        style={{ background: wash, opacity: 0.55 }}
      />

      <ChapterHeading chapter={chapter} count={items.length} />

      <FlatGrid items={items} onOpen={onOpen} firstIsHero={firstChapter} heroFromChapter />
    </section>
  );
}

function ChapterHeading({ chapter, count }) {
  return (
    <div className="relative z-[1] mb-8 flex items-end justify-between gap-6 px-2 md:mb-10 md:px-3">
      <div className="flex items-baseline gap-4">
        <h2
          className="font-medium leading-none tracking-tight"
          style={{
            fontSize: "clamp(1.75rem, 3.6vw, 2.6rem)",
            color: "var(--gi-text)",
          }}
        >
          {chapter.title}
        </h2>
        {chapter.subtitle && (
          <span
            className="hidden text-[13px] md:inline"
            style={{ color: "var(--gi-text-muted)" }}
          >
            {chapter.subtitle}
          </span>
        )}
      </div>
      <span
        className="text-[11px] tracking-[0.28em]"
        style={{ color: "var(--gi-text-subtle)" }}
      >
        {count}
      </span>
    </div>
  );
}

function FlatGrid({ items, onOpen, firstIsHero = false, heroFromChapter = false }) {
  return (
    <div
      className="relative z-[1] grid auto-rows-[minmax(180px,auto)] grid-cols-2 gap-4 md:auto-rows-[minmax(150px,auto)] md:grid-cols-6 md:gap-5"
      style={{ gridAutoFlow: "dense" }}
    >
      {items.map((it, idx) => (
        <GalleryTile
          key={it.id}
          item={it}
          onOpen={onOpen}
          isHero={heroFromChapter && idx === 0}
          priority={firstIsHero && idx === 0}
        />
      ))}
    </div>
  );
}

// Diagonal wash drawn from the chapter hero's palette. Returns a
// `linear-gradient(...)` string at very low alpha so the canvas under
// the chapter feels tinted, not coloured.
function paletteWash(palette = []) {
  if (palette.length < 2) return "transparent";
  const [a, b] = palette;
  return `linear-gradient(135deg, ${withAlpha(a, 0.18)} 0%, ${withAlpha(b, 0.10)} 100%)`;
}

function withAlpha(hex, alpha) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff, g = (v >> 8) & 0xff, b = v & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
