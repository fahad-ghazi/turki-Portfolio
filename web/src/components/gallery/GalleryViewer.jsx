import React, { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Link as LinkIcon, Check } from "lucide-react";
import Picture from "@/components/brand/Picture";

const SITE_URL = (import.meta.env?.VITE_PUBLIC_SITE_URL || "").replace(/\/$/, "");

function shareUrlFor(item) {
  // Deep link back to /gallery-intelligent with the focused item id.
  const base = SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/gallery-intelligent?item=${encodeURIComponent(item.id)}`;
}

export default function GalleryViewer({ item, onClose, onPrev, onNext }) {
  const [copied, setCopied] = useState(false);

  const copyShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrlFor(item));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }, [item]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  // Lock body scroll while the viewer is open.
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
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: item.dominant_color || "#000",
      }}
      onClick={onClose}
    >
      {/* Soft tinted overlay so any colour reads as cinematic, not flat. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 75%)",
        }}
      />

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60"
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-md transition hover:bg-black/55 md:left-6"
        aria-label="Previous"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white/90 backdrop-blur-md transition hover:bg-black/55 md:right-6"
        aria-label="Next"
      >
        <ChevronRight size={22} />
      </button>

      <div
        className="relative z-[1] flex h-full w-full max-w-[1600px] flex-col items-center justify-center px-4 py-16 md:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative w-full"
          style={{
            maxHeight: "78vh",
            aspectRatio: String(item.aspect_ratio || 1),
          }}
        >
          <Picture
            src={item.image_url}
            alt={item.alt || item.mood}
            className="absolute inset-0 h-full w-full object-contain"
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
          />
        </div>

        <div className="mt-5 flex w-full max-w-[900px] flex-wrap items-center justify-between gap-4 text-white/80">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/60">{item.mood}</span>
            <span className="hidden text-white/30 md:inline">·</span>
            <span className="hidden text-[11px] uppercase tracking-[0.2em] text-white/50 md:inline">
              {item.visual_group.replace("-", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {palette.slice(0, 5).map((c, i) => (
              <span
                key={i}
                className="h-4 w-4 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={copyShare}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-md transition hover:bg-white/20"
          >
            {copied ? <Check size={14} /> : <LinkIcon size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
