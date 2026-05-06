import React, { useMemo } from "react";
import GalleryTile from "./GalleryTile";
import { buildSections } from "./galleryAlgorithm";

/**
 * Editorial masonry. Two layouts depending on the View Mode:
 *   - "curated" → split into 12-tile sections, each section gets a
 *     subtle background tinted by its hero image's dominant colour.
 *   - any other view → flat masonry grid.
 *
 * We use CSS Grid with `grid-auto-flow: dense` and per-tile spans so
 * featured/large tiles stand out without an external masonry lib.
 */
export default function GalleryGrid({ items, view, onOpen }) {
  const sections = useMemo(
    () => (view === "curated" ? buildSections(items, 12) : null),
    [items, view],
  );

  if (sections) {
    return (
      <div className="space-y-12">
        {sections.map((section, i) => (
          <section
            key={section.id}
            className="relative rounded-2xl px-2 py-6 md:px-4 md:py-8"
            style={{
              background: gradientFor(section.palette),
            }}
          >
            <Tiles items={section.items} onOpen={onOpen} firstIsHero={i === 0} />
          </section>
        ))}
      </div>
    );
  }

  return <Tiles items={items} onOpen={onOpen} firstIsHero />;
}

function Tiles({ items, onOpen, firstIsHero = false }) {
  return (
    <div
      className="grid auto-rows-[minmax(140px,auto)] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6"
      style={{ gridAutoFlow: "dense" }}
    >
      {items.map((it, idx) => (
        <GalleryTile
          key={it.id}
          item={it}
          onOpen={onOpen}
          priority={firstIsHero && idx === 0}
        />
      ))}
    </div>
  );
}

// Soft, very-low-contrast wash drawn from the section's palette. We keep
// this faint so the page never looks like a mood-board screenshot — just
// a gentle hue shift between sections so the eye finds rhythm.
function gradientFor(palette = []) {
  if (palette.length < 2) return "transparent";
  const [a, b] = palette;
  return `linear-gradient(135deg, ${withAlpha(a, 0.07)} 0%, ${withAlpha(b, 0.04)} 100%)`;
}

function withAlpha(hex, alpha) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return hex;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff, g = (v >> 8) & 0xff, b = v & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
