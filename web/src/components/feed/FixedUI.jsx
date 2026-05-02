import React from "react";
import { motion } from "framer-motion";

export default function FixedUI({ current, total, onDotClick }) {
  return (
    <>
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 pt-safe-top pb-3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
        {/* Hamburger placeholder */}
        <div className="w-8 h-8 flex flex-col justify-center gap-1.5 pointer-events-auto opacity-70">
          <div className="w-5 h-px bg-white/80" />
          <div className="w-4 h-px bg-white/80" />
          <div className="w-5 h-px bg-white/80" />
        </div>

        {/* TG Logo */}
        <div className="font-cinzel text-lg font-bold tracking-[0.3em] text-white/90">
          TG
        </div>

        {/* Placeholder right */}
        <div className="w-8" />
      </div>

      {/* Right Side Progress Dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            aria-label={`Go to item ${i + 1}`}
            className="w-1.5 rounded-full transition-all duration-300 focus:outline-none"
            style={{
              height: i === current ? "20px" : "6px",
              backgroundColor: i === current
                ? "hsl(40 45% 58%)"
                : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>

      {/* Bottom Swipe Hint (only on first item) */}
      {current === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-transparent to-white/50 rounded-full"
          />
          <span className="text-white/40 text-xs tracking-widest font-cinzel">SCROLL</span>
        </motion.div>
      )}
    </>
  );
}