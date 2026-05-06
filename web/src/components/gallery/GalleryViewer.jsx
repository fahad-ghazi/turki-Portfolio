import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Link as LinkIcon, Check } from "lucide-react";
import Picture from "@/components/brand/Picture";

const SITE_URL = (import.meta.env?.VITE_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function shareUrlFor(item) {
  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/gallery-intelligent?item=${encodeURIComponent(item.id)}`;
}

/**
 * Spotlight viewer. Stripped of metadata — no mood/group labels, no
 * filename. Just the image, dominant-colour backdrop, palette dots,
 * and three controls. The page is a film; this is the close-up.
 *
 * Arrow keys are mirrored for RTL: ← = next, → = previous.
 */
export default function GalleryViewer({ item, onClose, onPrev, onNext }) {
  const [copied, setCopied] = useState(false);

  const copyShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrlFor(item));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }, [item]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onPrev();
      else if (e.key === "ArrowLeft") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!item) return null;
  const palette = item.color_palette || [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="rtl"
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: item.dominant_color || "#000" }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.78) 78%)",
        }}
      />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute left-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-md transition hover:bg-black/65"
        aria-label="إغلاق"
      >
        <X size={18} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-white/85 backdrop-blur-md transition hover:bg-black/55 md:right-6"
        aria-label="السابق"
      >
        <ChevronRight size={22} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-white/85 backdrop-blur-md transition hover:bg-black/55 md:left-6"
        aria-label="التالي"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </button>

      <div
        className="relative z-[1] flex h-full w-full max-w-[1600px] flex-col items-center justify-center px-4 py-16 md:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full"
          style={{ maxHeight: "82vh", aspectRatio: String(item.aspect_ratio || 1) }}
        >
          <Picture
            src={item.image_url}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
          />
        </div>

        <div className="mt-6 flex w-full max-w-[680px] items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            {palette.slice(0, 5).map((c, i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 rounded-full ring-1 ring-white/15"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={copyShare}
            className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-[11px] tracking-[0.18em] text-white/85 backdrop-blur-md transition hover:bg-white/16"
          >
            {copied ? <Check size={13} strokeWidth={1.6} /> : <LinkIcon size={13} strokeWidth={1.6} />}
            {copied ? "تم النسخ" : "نسخ الرابط"}
          </button>
        </div>
      </div>
    </div>
  );
}
