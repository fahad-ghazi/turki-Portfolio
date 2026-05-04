import React, { forwardRef, useEffect, useRef, useState } from "react";
import { decode as decodeBlurhash } from "blurhash";
import manifest from "@/lib/imageManifest.json";

/**
 * 2026 image-delivery component. For every <Picture src="…" /> we render:
 *
 *   <picture>
 *     <source srcset="<name>-480w.avif 480w, …" type="image/avif" />
 *     <source srcset="<name>-480w.webp 480w, …" type="image/webp" />
 *     <img    srcset="<name>-480w.jpg  480w, …" sizes="…" src="…" />
 *   </picture>
 *
 * with a blurhash placeholder painted into a <canvas> behind the <img>
 * so there's never a blank rectangle while the real bytes arrive.
 *
 * Browsers pick the smallest format they understand and the smallest
 * width the layout needs (driven by the `sizes` attribute). On a
 * Retina iPhone Pro full-bleed gallery slide this is typically the
 * 1440w AVIF — ~70KB instead of the 600KB JPG we used to ship.
 *
 * The variant files are produced offline by `npm run build:images`
 * (see web/tools/build-images.mjs). Their existence + dimensions +
 * blurhash live in `web/src/lib/imageManifest.json`. If a `src` isn't
 * in the manifest (remote URL, SVG, brand mark) we fall through to a
 * plain <img> — same DOM shape as before.
 */

const RASTER_RE = /\.(jpe?g|png)$/i;
const FORMAT_TYPES = { avif: "image/avif", webp: "image/webp", jpg: "image/jpeg" };

// When images are served from Cloudflare R2 the manifest keys stay as
// local paths (/works/…) but the actual bytes live at the R2 CDN.
// VITE_R2_BASE is injected at build time; absent means we're in local dev
// and the public/ folder serves the files directly.
const R2_BASE = import.meta.env.VITE_R2_BASE ?? "";

// Convert a local public path (/works/ads/a_001.jpg) to the delivery URL.
// If R2_BASE is empty the path passes through unchanged (dev / local).
function toDeliveryUrl(localPath) {
  if (!localPath || localPath.startsWith("http")) return localPath;
  return R2_BASE ? `${R2_BASE}${localPath}` : localPath;
}

function buildSrcSet(localSrc, format, widths) {
  const ext = localSrc.match(RASTER_RE)?.[0] ?? "";
  if (!ext) return null;
  const base = localSrc.slice(0, -ext.length);
  const formatExt = format === "jpg" ? "jpg" : format;
  // Variant URLs go through R2 CDN in production.
  return widths
    .map((w) => `${toDeliveryUrl(`${base}-${w}w.${formatExt}`)} ${w}w`)
    .join(", ");
}

function BlurhashCanvas({ hash, aspectRatio, className = "" }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!hash || !canvasRef.current) return;
    try {
      const pixels = decodeBlurhash(hash, 32, 32);
      const ctx = canvasRef.current.getContext("2d");
      const imageData = ctx.createImageData(32, 32);
      imageData.data.set(pixels);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      /* malformed hash — fall through to neutral background */
    }
  }, [hash]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={32}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ aspectRatio: aspectRatio || undefined }}
    />
  );
}

const Picture = forwardRef(function Picture(
  {
    src,
    alt = "",
    className = "",
    loading = "lazy",
    decoding = "async",
    fetchPriority,
    onLoad,
    onError,
    draggable,
    sizes = "100vw",
    placeholder = "blur",
    ...rest
  },
  ref,
) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const setRefs = (node) => {
    imgRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  // Manifest is keyed on local paths (/works/…). The incoming src may
  // already be an absolute R2 URL if other components set it directly —
  // strip the base so the lookup still hits.
  const localSrc = R2_BASE && src?.startsWith(R2_BASE)
    ? src.slice(R2_BASE.length)
    : src;
  const entry = localSrc && manifest[localSrc];
  if (!src || !RASTER_RE.test(localSrc) || !entry) {
    return (
      <img
        ref={setRefs}
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={onError}
        draggable={draggable}
        {...rest}
      />
    );
  }

  const widths = entry.widths;
  const useBlur = placeholder === "blur" && entry.blurhash;
  const aspectStyle = entry.aspectRatio
    ? { aspectRatio: String(entry.aspectRatio) }
    : undefined;

  // CSS properties that only work on replaced elements (img, video) must
  // go on the <img>, not the wrapping <span>. Extract object-* classes
  // so callers can write className="w-full h-full object-cover"
  // and object-* lands on the <img>.
  //
  // ⚠️  Do NOT pass "absolute inset-0" inside className — this <span>
  // already has a hardcoded "relative" class. Both absolute and relative
  // have equal specificity; Tailwind sorts "absolute" before "relative"
  // alphabetically so "relative" wins the cascade → span height collapses
  // to 0 on mobile. Always wrap in a <div className="absolute inset-0">
  // and pass only "w-full h-full object-cover" to Picture.
  const IMG_CLASS_RE = /\bobject-\S+\b/g;
  const imgPassthrough = (className.match(IMG_CLASS_RE) ?? []).join(" ");

  return (
    <span className={`relative block overflow-hidden ${className}`} style={aspectStyle}>
      {useBlur && !loaded && (
        <BlurhashCanvas
          hash={entry.blurhash}
          aspectRatio={entry.aspectRatio ? String(entry.aspectRatio) : undefined}
        />
      )}
      <picture className="block h-full w-full">
        <source type={FORMAT_TYPES.avif} srcSet={buildSrcSet(localSrc, "avif", widths)} sizes={sizes} />
        <source type={FORMAT_TYPES.webp} srcSet={buildSrcSet(localSrc, "webp", widths)} sizes={sizes} />
        <img
          ref={setRefs}
          src={toDeliveryUrl(localSrc)}
          srcSet={buildSrcSet(localSrc, "jpg", widths)}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding={decoding}
          fetchPriority={fetchPriority}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={onError}
          draggable={draggable}
          className={`block h-full w-full transition-opacity duration-300 ${imgPassthrough} ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          {...rest}
        />
      </picture>
    </span>
  );
});

export default Picture;
