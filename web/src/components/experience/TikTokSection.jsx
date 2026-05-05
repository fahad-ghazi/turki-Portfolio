import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { trackContentInteraction } from "../../utils/behaviorTracking";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";
import Picture from "@/components/brand/Picture";

const GOLD = "#C9A961";

// Per-category colour tint — each section gets a unique mood overlay.
// Designed so every slide is visually distinct at a glance.
const CATEGORY_TINT = {
  // Fashion: f_030 is blue sky + bold outfit — rose tint adds couture warmth
  "ai-fashion":     "rgba(120,20,55,0.18)",   // rose / couture
  // Ads: commercial.jpg is dark marble perfume — amber-gold tint lifts the luxury feel
  "commercial-ads": "rgba(160,120,40,0.22)",  // amber-gold / luxury product
  // Characters: char_03 is a close face portrait — violet tint reads as AI / uncanny
  "trained-models": "rgba(80,24,120,0.20)",   // violet / AI
  // Films: golden doorway — near-black deepens the cinematic contrast
  "films":          "rgba(4,10,30,0.22)",     // near-black / cinematic
  // Real Estate: realestate.jpg already glows blue-gold at night — subtle warm tint
  "real-estate":    "rgba(140,110,50,0.18)",  // amber-gold / luxury
  // Heritage: h_015 is warm golden-hour dust — sienna tint amplifies nostalgia
  "heritage":       "rgba(110,48,14,0.25)",   // warm sienna / memory
};

// Per-category CTA copy — avoids the same label repeating 6 times.
const CATEGORY_CTA = {
  "ai-fashion":     { ar: "تصفح الأزياء",       en: "Browse Fashion"    },
  "commercial-ads": { ar: "شوف الإعلانات",      en: "View Ads"          },
  "trained-models": { ar: "اكتشف الشخصيات",     en: "Meet Characters"   },
  "films":          { ar: "شوف الأفلام",         en: "Watch Films"       },
  "real-estate":    { ar: "استعرض العقارات",     en: "Browse Properties" },
  "heritage":       { ar: "اكتشف التراث",        en: "Explore Heritage"  },
};

// Per-category eyebrow badge.
const CATEGORY_BADGE = {
  "ai-fashion":     { ar: "أزياء · افتتاحيات",  en: "FASHION · EDITORIAL"  },
  "commercial-ads": { ar: "إعلانات · تجارية",   en: "COMMERCIAL · ADS"     },
  "trained-models": { ar: "شخصيات · AI",        en: "CHARACTERS · AI"      },
  "films":          { ar: "أفلام · سينما",       en: "FILMS · CINEMATIC"    },
  "real-estate":    { ar: "عقار · فاخر",         en: "REAL ESTATE · LUXURY" },
  "heritage":       { ar: "تراث · ذاكرة",        en: "HERITAGE · MEMORY"    },
};

// Section background: full-bleed cover image routed through R2 CDN via
// the Picture component (AVIF → WebP → JPG responsive srcset + blurhash
// placeholder so there's never a blank rectangle while loading).
// tint = per-category RGBA overlay for visual differentiation.
function CleanBg({ src, tint }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Picture
        src={src || "/works/hero-poster.jpg"}
        alt=""
        loading="lazy"
        sizes="100vw"
        className="w-full h-full object-cover object-top"
      />
      {/* Base luminosity gradient — keeps text readable on any image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.14) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.62) 100%)" }}
      />
      {/* Per-category mood tint — gives each section a distinct identity */}
      {tint && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: tint }}
        />
      )}
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

  const tint  = CATEGORY_TINT[category.id];
  const cta   = CATEGORY_CTA[category.id]   ?? { ar: "استعرض الأعمال", en: "View Works" };
  const badge = CATEGORY_BADGE[category.id] ?? null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0F0F0F]" dir={isAr ? "rtl" : "ltr"}>
      <CleanBg src={category.coverImage} tint={tint} />

      {/* Category badge — eyebrow that uniquely identifies each section */}
      {badge && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="absolute top-0 right-0 left-0 px-8 z-10"
          style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}
        >
          <span
            className="font-cinzel text-[9px] tracking-[0.34em] uppercase"
            style={{ color: GOLD, letterSpacing: "0.34em" }}
          >
            {isAr ? badge.ar : badge.en}
          </span>
        </motion.div>
      )}

      {/* Text content — bottom offset accounts for iOS safe-area-inset-bottom */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="absolute right-0 left-0 px-9 pointer-events-none"
        style={{ bottom: "calc(11rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Title — white, large, editorial */}
        <motion.h2
          initial={{ opacity: 0, y: 22 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
          transition={{ duration: 0.85, delay: 0.3 }}
          className="font-cormorant font-semibold leading-[1.05] mb-4"
          style={{
            fontSize: "clamp(2.6rem, 10vw, 4.4rem)",
            color: "#F5F1E8",
            textShadow: "0 4px 26px rgba(0,0,0,0.55)",
            letterSpacing: "-0.01em",
          }}
        >
          {isAr ? category.title : (category.titleEn || category.title)}
        </motion.h2>

        {/* Short description line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="font-noto text-sm font-normal leading-7"
          style={{ color: "rgba(245,241,232,0.82)", letterSpacing: "0.02em", textShadow: "0 3px 18px rgba(0,0,0,0.55)" }}
        >
          {isAr ? category.subtitle : category.subtitleEn}
        </motion.p>
      </motion.div>

      {/* CTA — unique label per category, not the same button 6 times */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute right-0 left-0 flex justify-center z-10"
        style={{ bottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
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
          <span>{isAr ? cta.ar : cta.en}</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ fontSize: "10px" }}
          >
            →
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}