import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { trackContentInteraction } from "../../utils/behaviorTracking";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";

const GOLD = "#C9A961";

function CleanBg({ src, color }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.34) 55%, rgba(0,0,0,0.64) 100%)" }}
      />
    </div>
  );
}

export default function TikTokSection({ category, isActive, onEnter }) {
  const { isAr } = useLang();
  useContentTimeTracker(category.id, isActive, 1.5);

  useEffect(() => {
    if (isActive) {
      trackContentInteraction(category.id, 2);
    }
  }, [isActive, category.id]);

  const handleEnter = () => {
    if (navigator.vibrate) navigator.vibrate(12);
    onEnter();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F5F1E8]" dir={isAr ? "rtl" : "ltr"}>
      <CleanBg src={category.coverImage} color={category.color} />

      {/* Text content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="absolute bottom-48 right-0 left-0 px-9 pointer-events-none"
      >
        {/* Title — white, large, editorial */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.85, delay: 0.3 }}
          className="font-cormorant font-semibold leading-[1.05] mb-5"
          style={{
            fontSize: "clamp(3rem, 11vw, 4.9rem)",
            color: "#F5F1E8",
            textShadow: "0 4px 26px rgba(0,0,0,0.45)",
            letterSpacing: "-0.01em",
          }}
        >
          {isAr ? category.title : category.titleEn}
        </motion.h2>

        {/* Short description line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="font-noto text-sm font-normal leading-7"
          style={{ color: "rgba(245,241,232,0.92)", letterSpacing: "0.02em", textShadow: "0 3px 18px rgba(0,0,0,0.5)" }}
        >
          {isAr ? category.subtitle : category.subtitleEn}
        </motion.p>
      </motion.div>

      {/* CTA — luxury ghost button */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute bottom-28 right-0 left-0 flex justify-center z-10"
      >
        <motion.button
          onClick={handleEnter}
          whileTap={{ scale: 0.96 }}
          whileHover={{ boxShadow: `0 0 36px rgba(201,169,97,0.22)`, borderColor: "rgba(201,169,97,0.7)" }}
          className="flex items-center gap-4 font-noto text-base font-bold transition-all duration-500"
          style={{
            border: "2px solid #1A1A1A",
            color: "#1A1A1A",
            background: "rgba(245,241,232,0.96)",
            borderRadius: "999px",
            padding: "14px 32px",
          }}
        >
          <span>{isAr ? "استعرض الأعمال" : "View Works"}</span>
          <motion.span
            animate={{ x: [0, isAr ? -4 : 4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "10px" }}
          >
            {isAr ? "←" : "→"}
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}