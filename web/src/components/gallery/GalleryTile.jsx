import React, { memo } from "react";
import Picture from "@/components/brand/Picture";

/**
 * One tile in the masonry. Sizing is driven by `layout_weight` and the
 * tile's index inside its chapter so heroes get proper room. We bend
 * the grid on purpose: featured tiles span 2 cols × 2 rows, large tiles
 * span 2 cols, and "hero of chapter" gets an extra boost on desktop.
 *
 * On mobile we cap at 2 columns and let featured tiles span both —
 * one image per row when it earns it, otherwise a tight 2-up.
 */
function GalleryTileBase({ item, onOpen, isHero = false, priority = false }) {
  const { image_url, dominant_color, aspect_ratio, layout_weight, mood, alt } = item;

  // Desktop spans
  let span = "";
  if (isHero) {
    span = "col-span-2 row-span-2 md:col-span-3 md:row-span-2";
  } else if (layout_weight === "featured") {
    span = "col-span-2 row-span-2 md:col-span-2 md:row-span-2";
  } else if (layout_weight === "large") {
    span = "md:col-span-2";
  }

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`group relative block w-full overflow-hidden rounded-[14px] outline-none focus-visible:ring-2 ${span}`}
      style={{
        aspectRatio: String(aspect_ratio || 1),
        backgroundColor: dominant_color,
        boxShadow: "0 1px 0 var(--gi-border)",
      }}
      aria-label={alt || `فتح صورة — ${mood}`}
    >
      <Picture
        src={image_url}
        alt={alt || `${mood} — تركي غازي`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        sizes={
          isHero
            ? "(min-width: 1024px) 50vw, 100vw"
            : "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
        }
      />

      {/* Hover veil — extremely subtle, no badges, no chrome. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </button>
  );
}

const GalleryTile = memo(GalleryTileBase);
export default GalleryTile;
