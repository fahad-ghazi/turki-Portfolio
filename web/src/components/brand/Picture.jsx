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

function buildSrcSet(src, format, widths) {
  const ext = src.match(RASTER_RE)?.[0] ?? "";
  if (!ext) return null;
  const base = src.slice(0, -ext.length);
  const formatExt = format === "jpg" ? "jpg" : format;
  return widths.map((w) => `${base}-${w}w.${formatExt} ${w}w`).join(", ");
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

  const entry = src && manifest[src];
  if (!src || !RASTER_RE.test(src) || !entry) {
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

  return (
    <span className={`relative block overflow-hidden ${className}`} style={aspectStyle}>
      {useBlur && !loaded && (
        <BlurhashCanvas
          hash={entry.blurhash}
          aspectRatio={entry.aspectRatio ? String(entry.aspectRatio) : undefined}
        />
      )}
      <picture className="block h-full w-full">
        <source type={FORMAT_TYPES.avif} srcSet={buildSrcSet(src, "avif", widths)} sizes={sizes} />
        <source type={FORMAT_TYPES.webp} srcSet={buildSrcSet(src, "webp", widths)} sizes={sizes} />
        <img
          ref={setRefs}
          src={src}
          srcSet={buildSrcSet(src, "jpg", widths)}
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
          className={`block h-full w-full transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          {...rest}
        />
      </picture>
    </span>
  );
});

export default Picture;
