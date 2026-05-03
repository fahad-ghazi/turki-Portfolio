import { useEffect, useState } from "react";

/**
 * Returns true on devices that have a real hover-capable pointer
 * (mouse/trackpad/pen). On touch-only devices (most phones, tablets)
 * returns false, so callers can skip framer-motion `whileHover`
 * effects that would otherwise stick after a tap.
 *
 *   const hoverable = useHoverable();
 *   <motion.button whileHover={hoverable ? { scale: 1.04 } : undefined} />
 *
 * Listens to the (hover: hover) media query so the value stays in sync
 * if a user plugs in/unplugs a mouse mid-session.
 */
export default function useHoverable() {
  const [hoverable, setHoverable] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handler = (e) => setHoverable(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return hoverable;
}
