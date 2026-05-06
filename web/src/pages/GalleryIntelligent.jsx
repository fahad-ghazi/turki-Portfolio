import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import CinemaBeat from "@/components/gallery/CinemaBeat";
import GalleryViewer from "@/components/gallery/GalleryViewer";
import { buildCinemaSequence } from "@/components/gallery/cinemaSequence";

/**
 * /gallery-intelligent — Cinema prototype.
 *
 * The page is not a gallery, it's a slow film. Beats stack vertically
 * with deliberate variation in size and breathing room. There is no
 * header, no chips, no filters, no theme toggle. The only UI is the
 * viewer that opens when an image is clicked.
 *
 * Reads only from public/gallery-manifest.json. The cinema sequencer
 * (cinemaSequence.js) reorders items by visual proximity and assigns
 * them into beats — single / silence / triptych / solo-quiet / cluster
 * / pair / oversized / montage — following a fixed score.
 *
 * URL params:
 *   ?item=<id>  opens the spotlight viewer focused on that image.
 *
 * No view modes, no collections — those filters belong to a gallery,
 * and this isn't a gallery.
 */
export default function GalleryIntelligent() {
  const [params, setParams] = useSearchParams();
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [showBrand, setShowBrand] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/gallery-manifest.json", { cache: "force-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`gallery-manifest ${r.status}`);
        return r.json();
      })
      .then((m) => { if (!cancelled) setManifest(m); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  const beats = useMemo(
    () => (manifest ? buildCinemaSequence(manifest.items) : []),
    [manifest],
  );

  // Flat list of just the images, in cinema order — used for prev/next
  // inside the viewer so the user keeps moving through the film, not
  // through alphabetical slugs.
  const orderedItems = useMemo(
    () => beats.flatMap((b) => b.items || []),
    [beats],
  );

  useEffect(() => {
    if (!manifest) return;
    const id = params.get("item");
    if (!id) { setOpenItem(null); return; }
    const found = manifest.items.find((x) => x.id === id);
    setOpenItem(found || null);
  }, [manifest, params]);

  // Hide the brand mark once the user starts moving — keeps the
  // opening contemplative and the rest of the scroll free of chrome.
  useEffect(() => {
    function onScroll() {
      if (window.scrollY > window.innerHeight * 0.6) setShowBrand(false);
      else setShowBrand(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const updateItemParam = useCallback((value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete("item"); else next.set("item", value);
    setParams(next, { replace: false });
  }, [params, setParams]);

  const openIndex = useMemo(
    () => (openItem ? orderedItems.findIndex((x) => x.id === openItem.id) : -1),
    [openItem, orderedItems],
  );

  const onPrev = useCallback(() => {
    if (openIndex < 0) return;
    const next = orderedItems[(openIndex - 1 + orderedItems.length) % orderedItems.length];
    updateItemParam(next.id);
  }, [openIndex, orderedItems, updateItemParam]);

  const onNext = useCallback(() => {
    if (openIndex < 0) return;
    const next = orderedItems[(openIndex + 1) % orderedItems.length];
    updateItemParam(next.id);
  }, [openIndex, orderedItems, updateItemParam]);

  const onClose = useCallback(() => updateItemParam(null), [updateItemParam]);

  return (
    <div dir="rtl" className="relative min-h-screen bg-black text-white antialiased">
      {/* The intro fade keyframe is shared by every CinemaImage marked
          `intro`. Defining it here keeps the gallery stylesheet
          self-contained — no new global CSS file. */}
      <style>{`
        @keyframes cinemaIntroFade {
          0%   { opacity: 0; transform: translate3d(0, 24px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes cinemaBrandFade {
          0%   { opacity: 0; }
          60%  { opacity: 0; }
          100% { opacity: 0.7; }
        }
        @keyframes cinemaScrollHint {
          0%, 100% { opacity: 0; transform: translateY(0); }
          50%      { opacity: 0.55; transform: translateY(8px); }
        }
      `}</style>

      <Seo
        title="عوالم تركي"
        description="تجربة بصرية متدفّقة بالذكاء الاصطناعي."
        canonical="/gallery-intelligent"
        lang="ar"
      />

      {/* Brand mark — fades in 1.4s after load, fades out once the
          user scrolls past the opening. Pure typographic anchor; no
          navigation, no link. */}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-30 text-[10px] tracking-[0.42em] text-white/70 transition-opacity duration-1000"
        style={{
          opacity: showBrand ? 0.7 : 0,
          animation: "cinemaBrandFade 2400ms ease-out both",
        }}
      >
        تركي غازي · عوالم
      </div>

      {/* A near-invisible scroll hint that appears only at the very
          top, to let the first-time visitor know there's more below
          the opening frame. */}
      <div
        className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2 text-[9px] tracking-[0.42em] text-white/45"
        style={{
          opacity: showBrand ? 1 : 0,
          animation: "cinemaScrollHint 2800ms ease-in-out 3200ms infinite",
        }}
      >
        ↓
      </div>

      {error && (
        <p className="px-4 py-32 text-center text-sm text-white/45">
          تعذّر تحميل العالم البصري.
        </p>
      )}

      {!error && !manifest && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-[11px] tracking-[0.42em] text-white/30">
            جاري الفتح…
          </div>
        </div>
      )}

      {manifest && beats.length > 0 && (
        <main className="flex flex-col gap-3 md:gap-5">
          {beats.map((beat, i) => (
            <CinemaBeat
              key={`b-${i}`}
              beat={beat}
              index={i}
              onOpen={(it) => updateItemParam(it.id)}
            />
          ))}
        </main>
      )}

      {/* Closing breath + signature — minimal, monochrome. */}
      {manifest && (
        <footer className="px-6 pb-24 pt-32 text-center text-[10px] tracking-[0.42em] text-white/35">
          تركي غازي
        </footer>
      )}

      {openItem && (
        <GalleryViewer
          item={openItem}
          onClose={onClose}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </div>
  );
}
