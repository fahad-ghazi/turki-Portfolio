import React, { useRef, useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TikTokSection from "./TikTokSection";
import TinderMode from "./TinderMode";
import HeroFeedItem from "./HeroFeedItem";
import MicroContext from "./MicroContext";
import FinalSlide from "./FinalSlide";
import { CATEGORIES } from "../feed/categoriesData";

const SECTION_ORDER = { films: 0 };

// 0 = Hero, 1 = MicroContext, 2..N+1 = categories, last = FinalSlide
const sortCategoriesByAnalytics = (events = []) => {
  const scores = events.reduce((acc, event) => {
    if (event.target_id && event.event_name === "project_visit") {
      acc[event.target_id] = (acc[event.target_id] || 0) + 1;
    }
    return acc;
  }, {});

  return CATEGORIES.map((category, index) => ({
    ...category,
    originalIndex: index,
    analyticsScore: (scores[category.id] || 0) + (category.items || []).reduce((total, item) => total + (scores[item.id] || 0), 0),
    items: [...(category.items || [])].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)),
  })).sort((a, b) => ((SECTION_ORDER[a.id] ?? 10) - (SECTION_ORDER[b.id] ?? 10)) || (b.analyticsScore - a.analyticsScore) || (a.originalIndex - b.originalIndex));
};

export default function DualNav() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null); // null = TikTok mode
  const [orderedCategories] = useState(sortCategoriesByAnalytics());
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const touchStartY = useRef(null);
  const slides = 1 + 1 + orderedCategories.length + 1;

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(slides - 1, index));
    setCurrentSlide(clamped);
    const el = containerRef.current?.children[clamped];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [slides]);

  // Wheel snap
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current || activeCategoryIndex !== null) return;
      isScrollingRef.current = true;
      setCurrentSlide((p) => {
        const n = e.deltaY > 0
          ? Math.min(p + 1, slides - 1)
          : Math.max(p - 1, 0);
        const child = containerRef.current?.children[n];
        if (child) child.scrollIntoView({ behavior: "smooth", block: "start" });
        return n;
      });
      setTimeout(() => { isScrollingRef.current = false; }, 750);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [activeCategoryIndex, slides]);

  // Touch snap (vertical)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (touchStartY.current === null || activeCategoryIndex !== null) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) diff > 0 ? goTo(currentSlide + 1) : goTo(currentSlide - 1);
      touchStartY.current = null;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [currentSlide, goTo, activeCategoryIndex]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (activeCategoryIndex !== null) {
        if (e.key === "Escape") setActiveCategoryIndex(null);
        return;
      }
      if (e.key === "ArrowDown") goTo(currentSlide + 1);
      if (e.key === "ArrowUp") goTo(currentSlide - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSlide, goTo, activeCategoryIndex]);

  const handleEnterCategory = (catIndex) => {
    const category = orderedCategories[catIndex];
    if (["films", "trained-models"].includes(category?.id)) {
      navigate(category.slug);
      return;
    }
    setActiveCategoryIndex(catIndex);
  };
  const handleExitCategory = () => setActiveCategoryIndex(null);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F5F1E8]">
      {/* ── TikTok vertical feed ── */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ overflowY: activeCategoryIndex !== null ? "hidden" : "scroll", scrollSnapType: "y mandatory" }}
      >
        {/* Hero slide — index 0 */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
          <HeroFeedItem isActive={currentSlide === 0 && activeCategoryIndex === null} onEnter={() => goTo(2)} />
        </div>

        {/* Micro context — index 1 */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
          <MicroContext isActive={currentSlide === 1 && activeCategoryIndex === null} />
        </div>

        {/* Category slides — index 2..N+1 */}
        {orderedCategories.map((cat, i) => (
          <div
            key={cat.id}
            style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            <TikTokSection
              category={cat}
              isActive={i + 2 === currentSlide && activeCategoryIndex === null}
              onEnter={() => handleEnterCategory(i)}
            />
          </div>
        ))}

        {/* Final slide — last index */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
          <FinalSlide isActive={currentSlide === slides - 1 && activeCategoryIndex === null} />
        </div>
      </div>

      {/* Vertical progress dots */}
      {activeCategoryIndex === null && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
          {Array.from({ length: slides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 focus:outline-none"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className="rounded-full transition-all duration-300"
                style={{
                  width: "5px",
                  height: i === currentSlide ? "22px" : "5px",
                  backgroundColor: i === currentSlide ? "#C9A961" : "rgba(26,26,26,0.18)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Tinder overlay — cinematic entry ── */}
      <AnimatePresence>
        {activeCategoryIndex !== null && (
          <motion.div
            key="tinder"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40"
          >
            <TinderMode
              category={orderedCategories[activeCategoryIndex]}
              onExit={handleExitCategory}
              onNextCategory={() => {
                const nextCatIndex = activeCategoryIndex + 1;
                if (nextCatIndex < orderedCategories.length) {
                  setActiveCategoryIndex(nextCatIndex);
                } else {
                  handleExitCategory();
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}