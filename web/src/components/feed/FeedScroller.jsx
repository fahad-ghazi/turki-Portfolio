import React, { useRef, useState, useEffect, useCallback } from "react";
import FeedItem from "./FeedItem";
import FixedUI from "./FixedUI";
import { FEED_ITEMS } from "./mediaData";

export default function FeedScroller() {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const isScrollingRef = useRef(false);
  const touchStartY = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(FEED_ITEMS.length - 1, index));
    setCurrent(clamped);
    const el = containerRef.current?.children[clamped];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Wheel snap
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      if (e.deltaY > 0) {
        setCurrent((prev) => {
          const next = Math.min(prev + 1, FEED_ITEMS.length - 1);
          goTo(next);
          return next;
        });
      } else {
        setCurrent((prev) => {
          const next = Math.max(prev - 1, 0);
          goTo(next);
          return next;
        });
      }

      setTimeout(() => { isScrollingRef.current = false; }, 700);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goTo]);

  // Touch snap
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      if (touchStartY.current === null) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goTo(current + 1);
        } else {
          goTo(current - 1);
        }
      }
      touchStartY.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [current, goTo]);

  // Keyboard navigation
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
      {/* Fixed UI overlay */}
      <FixedUI
        current={current}
        total={FEED_ITEMS.length}
        onDotClick={goTo}
      />

      {/* Snap container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden"
        style={{ scrollSnapType: "y mandatory", overflowY: "scroll" }}
      >
        {FEED_ITEMS.map((item, index) => (
          <div
            key={item.id}
            className="w-full flex-shrink-0"
            style={{
              height: "100dvh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <FeedItem
              item={item}
              isActive={index === current}
              isAdjacent={Math.abs(index - current) === 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}