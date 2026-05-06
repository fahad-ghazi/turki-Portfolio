import React, { useEffect, useRef, useState } from "react";
import Picture from "@/components/brand/Picture";

/**
 * One image inside the cinema flow. Three subtle behaviours, nothing
 * more:
 *
 *   - Fades in from opacity 0 + 18px translate when 25% in viewport.
 *     Single transition, 900ms, the same physics-y curve everywhere
 *     so the page has one heartbeat.
 *
 *   - On hover (desktop), 1.6s scale 1.025 — barely perceptible. Most
 *     users won't notice; the ones who do will feel the page is alive.
 *
 *   - Click → calls onOpen(item). The cursor flips to zoom-in so the
 *     affordance is implicit, no UI badge.
 *
 * `intro` skips the IntersectionObserver and runs the fade as a CSS
 * keyframe straight after mount — used by the very first beat so the
 * page opens like a film fade-in, not a jump-cut.
 */
export default function CinemaImage({
  item,
  eager = false,
  intro = false,
  sizes = "100vw",
  className = "",
  style,
  onOpen,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(intro);

  useEffect(() => {
    if (intro || !ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [intro]);

  const fadeStyle = intro
    ? { animation: "cinemaIntroFade 1700ms cubic-bezier(0.2,0.8,0.2,1) both" }
    : {
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : "translate3d(0,18px,0)",
        transition:
          "opacity 900ms cubic-bezier(0.2,0.8,0.2,1), transform 900ms cubic-bezier(0.2,0.8,0.2,1)",
      };

  return (
    <div
      ref={ref}
      onClick={() => onOpen?.(item)}
      className={`group relative cursor-zoom-in overflow-hidden ${className}`}
      style={{
        backgroundColor: item.dominant_color || "#000",
        ...style,
        ...fadeStyle,
      }}
    >
      <Picture
        src={item.image_url}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        sizes={sizes}
        className="absolute inset-0 h-full w-full object-cover transition-transform ease-out [transition-duration:1600ms] group-hover:scale-[1.025]"
      />
    </div>
  );
}
