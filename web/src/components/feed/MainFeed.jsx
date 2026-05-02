import React, { useRef, useState, useEffect, useCallback } from "react";
import HeroFeedItem from "./HeroFeedItem";
import CategoryFeedItem from "./CategoryFeedItem";
import { CATEGORIES } from "./categoriesData";

// Total items = 1 hero + categories
const TOTAL = 1 + CATEGORIES.length;

export default function MainFeed() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const touchStartY = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(TOTAL - 1, index));
    setCurrent(clamped);
    const el = containerRef.current?.children[clamped];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Scroll past hero to first category
  const handleHeroEnter = () => goTo(1);

  // Wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;
      if (e.deltaY > 0) {
        setCurrent((prev) => { const n = Math.min(prev + 1, TOTAL - 1); goTo(n); return n; });
      } else {
        setCurrent((prev) => { const n = Math.max(prev - 1, 0); goTo(n); return n; });
      }
      setTimeout(() => { isScrollingRef.current = false; }, 700);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goTo]);

  // Touch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
    const onTouchEnd = (e) => {
      if (touchStartY.current === null) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) diff > 0 ? goTo(current + 1) : goTo(current - 1);
      touchStartY.current = null;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [current, goTo]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowUp") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* Category dots — only show when past hero */}
      {current > 0 && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          {CATEGORIES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i + 1)}
              className="w-1.5 rounded-full transition-all duration-300"
              style={{
                height: i === current - 1 ? "20px" : "6px",
                backgroundColor: i === current - 1 ? "hsl(40 45% 58%)" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{ scrollSnapType: "y mandatory", overflowY: "scroll" }}
      >
        {/* Hero slide */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}>
          <HeroFeedItem isActive={current === 0} onEnter={handleHeroEnter} />
        </div>

        {/* Category slides */}
        {CATEGORIES.map((cat, index) => (
          <div
            key={cat.id}
            style={{ height: "100dvh", scrollSnapAlign: "start", scrollSnapStop: "always" }}
          >
            <CategoryFeedItem
              category={cat}
              isActive={index + 1 === current}
            />
          </div>
        ))}
      </div>
    </div>
  );
}