import React, { memo } from "react";
import Picture from "@/components/brand/Picture";

/**
 * One tile in the intelligent gallery masonry.
 *
 * Sizing is driven by `layout_weight` from gallery-manifest.json:
 *   featured → spans 2 columns and ~1.5x rows  (≈ 8% of items)
 *   large    → spans 2 columns
 *   medium / small → 1 column
 *
 * The tile uses the existing <Picture> component so we get the same
 * AVIF/WebP/JPG srcset + blurhash placeholder pipeline the rest of
 * the site uses — no new image delivery code, no new requests.
 */
function GalleryTileBase({ item, onOpen, priority = false }) {
  const { image_url, dominant_color, aspect_ratio, layout_weight, mood, alt } = item;

  const span =
    layout_weight === "featured" ? "md:col-span-2 md:row-span-2"
    : layout_weight === "large"   ? "md:col-span-2"
    : "";

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`group relative block w-full overflow-hidden rounded-xl bg-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${span}`}
      style={{
        aspectRatio: String(aspect_ratio || 1),
        backgroundColor: dominant_color,
      }}
      aria-label={alt || `Open ${mood} image`}
    >
      <Picture
        src={image_url}
        alt={alt || `${mood} — AI visual`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
      />

      {/* Subtle vignette + caption appearing on hover — kept minimal so the
          editorial feel stays. No badges, no chrome, no border. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 pt-8 text-[11px] uppercase tracking-[0.18em] text-white/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {mood}
      </div>
    </button>
  );
}

const GalleryTile = memo(GalleryTileBase);
export default GalleryTile;
