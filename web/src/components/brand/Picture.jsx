import React, { forwardRef } from "react";

/**
 * Drop-in replacement for <img> that serves WebP to capable browsers
 * and falls back to the original JPG/PNG for everyone else. Same
 * dimensions, same alt text, same loading semantics — just better
 * compression on modern browsers (~25% smaller payload, no quality
 * loss visible at typical viewing sizes).
 *
 * For every "/path/to/image.jpg" we point at, the build pipeline has
 * also generated "/path/to/image.webp" alongside it.
 *
 * Usage:
 *   <Picture src="/works/fashion/f_001.jpg" alt="..." className="..." />
 *
 * Caveat: this does NOT magically upscale resolution. The source files
 * are 1200-1600px wide; if you need true 4K crispness you have to
 * re-export the originals at higher resolution from the AI generator.
 */
const SUPPORTED_RASTER = /\.(jpe?g|png)$/i;

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
    ...rest
  },
  ref,
) {
  if (!src || !SUPPORTED_RASTER.test(src)) {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        onError={onError}
        draggable={draggable}
        {...rest}
      />
    );
  }

  const webpSrc = src.replace(SUPPORTED_RASTER, ".webp");

  return (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        onLoad={onLoad}
        onError={onError}
        draggable={draggable}
        {...rest}
      />
    </picture>
  );
});

export default Picture;
