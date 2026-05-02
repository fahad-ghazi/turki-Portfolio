import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartNextBar from "./SmartNextBar";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";
import { sortByBehavior, trackContentInteraction } from "../../utils/behaviorTracking";

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
        <img
        src={item.src}
        alt={item.alt || item.title}
        loading={isActive ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

export default function HorizontalSwiper({ items, onExit, categoryTitle }) {
  const rankedItems = sortByBehavior(items);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const isLast = current === rankedItems.length - 1;

  const goNext = () => {
    if (isLast) {
      onExit();
    } else {
      setCurrent((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (current === 0) {
      onExit();
    } else {
      setCurrent((p) => p - 1);
    }
  };

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
  }, [current]);

  const item = rankedItems[current];
  useContentTimeTracker(item?.id, Boolean(item), 2);

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
      {/* Media */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-2 overflow-hidden rounded-[1.35rem] border border-[#C9A961]/18 bg-black"
        >
          <MediaItem item={item} isActive={true} isAdjacent={false} />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.45) 100%)" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 pt-12 pb-4 bg-gradient-to-b from-black/35 to-transparent">
        <button
          onClick={onExit}
          className="text-[#F5F1E8]/80 hover:text-[#C9A961] text-xs tracking-widest font-cinzel transition-colors"
        >
          ← BACK
        </button>
        <span className="text-[#F5F1E8]/65 text-xs font-cinzel tracking-widest">{categoryTitle}</span>
        <span className="text-[#F5F1E8]/65 text-xs font-cinzel">
          {current + 1} / {rankedItems.length}
        </span>
      </div>

      {/* Bottom Info */}
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

      <SmartNextBar items={rankedItems} currentId={item.id} onSelect={selectSmartNext} />

      {/* Progress dots */}
      <div className="absolute bottom-7 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
        {rankedItems.map((_, i) => (
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