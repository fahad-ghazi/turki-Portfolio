import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SmartNextBar from "./SmartNextBar";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";
import { sortByBehavior, trackContentInteraction } from "../../utils/behaviorTracking";
import { trackEvent } from "@/utils/trackEvent";
import Picture from "@/components/brand/Picture";

function MediaItem({ item, isActive, isAdjacent }) {
  const [loaded, setLoaded] = useState(false);
  const shouldLoad = isActive || isAdjacent;

  return (
    <div className="absolute inset-0">
      {shouldLoad && !loaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-50"
          style={{ backgroundImage: `url(${item.src})` }}
        />
      )}
      {shouldLoad && (
        <Picture
          src={item.src}
          alt={item.alt || item.title}
          loading={isActive ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

export default function HorizontalSwiper({ items, onExit, categoryTitle, categoryId }) {
  const rankedItems = useMemo(() => sortByBehavior(items), [items]);
  // Audit #47: append a synthetic CTA slide at the end of every section.
  const totalSlots = rankedItems.length + 1;
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const isCta = current === rankedItems.length;
  const isLast = current === totalSlots - 1;

  // Audit #8: useCallback so goNext/goPrev have stable identities.
  // The keyboard useEffect previously listed only [current] as a dep,
  // which meant the captured goPrev/goNext were stale on every render
  // after the first — keyboard nav still worked because of the freshly
  // re-bound listener, but adding deps later would have re-attached the
  // listener every render. Stable callbacks fix both ends.
  const goNext = useCallback(() => {
    if (isLast) onExit();
    else setCurrent((p) => p + 1);
  }, [isLast, onExit]);

  const goPrev = useCallback(() => {
    if (current === 0) onExit();
    else setCurrent((p) => p - 1);
  }, [current, onExit]);

  // Touch
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "ArrowLeft") goNext();
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext, onExit]);

  const item = rankedItems[current];
  useContentTimeTracker(item?.id, Boolean(item) && !isCta, 2);

  // Fire once when the CTA slide appears so we can measure how many
  // visitors actually reach it from each section.
  useEffect(() => {
    if (isCta) {
      trackEvent("section_cta_shown", {
        event_type: "page_view",
        section: categoryId || categoryTitle,
      });
    }
  }, [isCta, categoryId, categoryTitle]);

  const selectSmartNext = (nextItem) => {
    const nextIndex = rankedItems.findIndex((entry) => entry.id === nextItem.id);
    if (nextIndex >= 0) {
      trackContentInteraction(nextItem.id, 3);
      setCurrent(nextIndex);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-[#F5F1E8] p-2"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Media or end-of-section CTA */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-2 overflow-hidden rounded-[1.35rem] border border-[#C9A961]/18 bg-black"
        >
          {isCta ? (
            <div
              className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1A1A1A] via-[#2a2520] to-[#1A1A1A] px-8 text-center"
              dir="rtl"
            >
              <span className="font-cinzel text-[10px] tracking-[0.45em] text-[#C9A961]">
                {categoryTitle}
              </span>
              <h3 className="mt-6 max-w-md font-noto text-4xl font-bold leading-tight text-[#F5F1E8] md:text-5xl">
                أعجبك ما رأيت؟
              </h3>
              <p className="mt-5 max-w-md font-noto text-base leading-9 text-[#F5F1E8]/72">
                نصمم لك نفس الأسلوب — مخصصاً لمشروعك ولعلامتك التجارية.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/booking"
                  onClick={() => trackEvent("section_cta_book_clicked", { event_type: "button_click", section: categoryId || categoryTitle })}
                  className="rounded-full border-2 border-[#C9A961] bg-[#C9A961] px-8 py-3.5 font-noto text-base font-bold text-[#1A1A1A] transition hover:bg-[#F5F1E8] hover:text-[#1A1A1A]"
                >
                  أريد مشروعاً مشابهاً
                </Link>
                <button
                  onClick={onExit}
                  className="rounded-full border-2 border-[#F5F1E8]/35 bg-transparent px-8 py-3.5 font-noto text-base font-bold text-[#F5F1E8] transition hover:border-[#C9A961] hover:text-[#C9A961]"
                >
                  العودة للأقسام
                </button>
              </div>
            </div>
          ) : (
            <>
              <MediaItem item={item} isActive={true} isAdjacent={false} />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.45) 100%)" }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-12 pb-4 bg-gradient-to-b from-black/35 to-transparent">
        <button
          onClick={onExit}
          aria-label="رجوع"
          className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[#F5F1E8]/80 transition-colors hover:text-[#C9A961]"
        >
          <span aria-hidden="true" className="text-base leading-none">←</span>
          <span className="font-noto text-xs font-medium">رجوع</span>
        </button>
        <span className="text-[#F5F1E8]/65 text-xs font-cinzel tracking-widest">{categoryTitle}</span>
        <span className="text-[#F5F1E8]/65 text-xs font-cinzel tabular-nums">
          {isCta ? `${rankedItems.length} / ${rankedItems.length}` : `${current + 1} / ${rankedItems.length}`}
        </span>
      </div>

      {/* Bottom Info — only on media slides, not the CTA slot */}
      {!isCta && (
      <motion.div
        key={`info-${current}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="absolute bottom-28 right-0 left-0 px-6"
        dir="rtl"
      >
        <h3 className="font-cinzel text-xl md:text-2xl font-bold text-[#F5F1E8] mb-2 tracking-wider">
          {item.title}
        </h3>
        <p className="text-[#F5F1E8]/78 text-sm font-light leading-relaxed max-w-sm">
          {item.description}
        </p>
      </motion.div>
      )}

      {!isCta && <SmartNextBar items={rankedItems} currentId={item.id} onSelect={selectSmartNext} />}

      {/* Progress dots — show one extra dot for the CTA slot */}
      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
        {Array.from({ length: totalSlots }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300"
            aria-label={`Go to item ${i + 1}`}
          >
            <span
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                backgroundColor: i === current ? "#C9A961" : "rgba(245,241,232,0.35)",
              }}
            />
          </button>
        ))}
      </div>

      {/* Clear navigation buttons */}
      <button onClick={goPrev} className="absolute left-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F5F1E8]/35 bg-black/25 font-cinzel text-lg text-[#F5F1E8] backdrop-blur-sm transition hover:border-[#C9A961] hover:text-[#C9A961]" aria-label="Previous">‹</button>
      <button onClick={goNext} className="absolute right-4 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#F5F1E8]/35 bg-black/25 font-cinzel text-lg text-[#F5F1E8] backdrop-blur-sm transition hover:border-[#C9A961] hover:text-[#C9A961]" aria-label="Next">›</button>
    </div>
  );
}