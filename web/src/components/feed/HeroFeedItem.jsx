import React, { useState } from "react";
import { motion } from "framer-motion";

const HERO_IMAGE = "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/a3a81c251_IMG_0264.jpg";
const TOTAL = 5;

// Luxury gold constant
const GOLD = "#C9A961";

export default function HeroFeedItem({ isActive, onEnter }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black" dir="rtl">
      {/* SEO hidden layer */}
      <div className="sr-only">
        <h1>تركي غازي — مصمم ومبدع بصري بالذكاء الاصطناعي</h1>
        <p>نصنع عوالم بصرية بالذكاء الاصطناعي تتجاوز الخيال. تركي غازي مصمم بصري متخصص في أزياء الذكاء الاصطناعي، الإعلانات التجارية، العقارات والتراث السعودي.</p>
      </div>

      {/* Background */}
      <img
        src={HERO_IMAGE}
        alt="تركي غازي — مصمم ومبدع بصري"
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{
          transform: isActive ? "scale(1.0)" : "scale(1.06)",
          transition: "transform 10s ease-out, opacity 1s",
        }}
      />

      {/* Deep cinematic gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pt-14 z-10">
        {/* TG Monogram */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col items-end"
        >
          <span
            className="font-cinzel text-lg font-semibold tracking-[0.2em]"
            style={{ color: GOLD }}
          >
            TG
          </span>
          <div className="w-full h-px mt-0.5" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
        </motion.div>

        {/* Menu icon — minimal */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="menu-icon flex-col gap-[5px]"
          aria-label="القائمة"
        >
          <span className="icon-line w-5" />
          <span className="icon-line w-3.5" />
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8" style={{ background: GOLD }} />
            <span
              className="font-cinzel text-[10px] tracking-[0.45em] uppercase"
              style={{ color: GOLD }}
            >
              Visual Studio
            </span>
          </motion.div>

          {/* Big Name — white, dominant */}
          <h1
            className="font-cormorant font-semibold leading-[0.92] mb-6"
            style={{
              fontSize: "clamp(4rem, 17vw, 7rem)",
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
              textShadow: "0 4px 40px rgba(0,0,0,0.6)",
            }}
          >
            تركي
            <br />
            غازي
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px max-w-[3rem]" style={{ background: `linear-gradient(to left, ${GOLD}, transparent)` }} />
            <span
              className="font-noto text-xs font-light tracking-[0.2em]"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              مصمم ومبدع بصري
            </span>
          </div>

          {/* Description */}
          <p
            className="font-noto text-sm font-light leading-[2] mb-10 max-w-[240px]"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            نصنع عوالم بصرية بالذكاء الاصطناعي
            <br />
            تتجاوز الخيال.
          </p>

          {/* CTA — luxury ghost button */}
          <motion.button
            onClick={onEnter}
            whileHover={{ boxShadow: `0 0 32px rgba(201,169,97,0.2)` }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-4 px-7 py-3.5 transition-all duration-500 font-cinzel text-xs tracking-[0.3em]"
            style={{
              border: `1px solid rgba(201,169,97,0.45)`,
              color: "rgba(201,169,97,0.9)",
              background: "transparent",
              borderRadius: "2px",
            }}
          >
            <span>ادخل التجربة</span>
            <span style={{ color: GOLD, fontSize: "10px" }}>←</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Side dots — right side, minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.8 }}
        className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2.5"
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-500"
            style={{
              width: "3px",
              height: i === 0 ? "20px" : "3px",
              backgroundColor: i === 0 ? GOLD : "rgba(255,255,255,0.18)",
            }}
          />
        ))}
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 py-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-cinzel text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            اسحب للأسفل
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-5"
            style={{ background: `linear-gradient(to bottom, transparent, ${GOLD}, transparent)` }}
          />
        </div>

        <div className="flex items-baseline gap-1">
          <span className="font-cinzel font-medium text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>01</span>
          <span className="font-cinzel text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
            /{String(TOTAL).padStart(2, "0")}
          </span>
        </div>
      </motion.div>
    </div>
  );
}