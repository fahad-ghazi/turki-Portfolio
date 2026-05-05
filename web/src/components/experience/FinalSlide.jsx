import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { Lightbulb, Globe, Film, Download } from "lucide-react";

// motion-enhanced Link so we can use whileTap/whileHover on router links
const MotionLink = motion(Link);

const GOLD = "#C9A961";

const STEPS = [
  {
    Icon: Lightbulb,
    labelAr: "الفكرة",
    labelEn: "Idea",
  },
  {
    Icon: Globe,
    labelAr: "بناء العالم",
    labelEn: "World",
  },
  {
    Icon: Film,
    labelAr: "الإخراج",
    labelEn: "Output",
  },
];

export default function FinalSlide({ isActive }) {
  const { isAr } = useLang();

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center bg-[#F5F1E8] overflow-hidden px-8"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 55% 45% at 50% 60%, rgba(201,169,97,0.12) 0%, transparent 70%)",
        }}
      />

      {/* How I Work */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="flex flex-col items-center gap-8 mb-14 w-full max-w-xs"
      >
        <div className="flex items-center gap-3">
          <div className="h-px w-5" style={{ background: GOLD }} />
          <span className="font-cinzel text-sm tracking-[0.32em] uppercase" style={{ color: GOLD }}>
            {isAr ? "كيف نعمل" : "How I Work"}
          </span>
          <div className="h-px w-5" style={{ background: GOLD }} />
        </div>

        <div className="flex items-center justify-center gap-6 w-full">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.12 }}
              className="flex flex-col items-center gap-3"
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "42px",
                  height: "42px",
                  border: "1px solid rgba(201,169,97,0.25)",
                  borderRadius: "2px",
                  background: "rgba(201,169,97,0.04)",
                }}
              >
                <step.Icon
                  style={{ color: "#C9A961", width: "18px", height: "18px", strokeWidth: 1.2 }}
                />
              </div>
              <span
                className="font-noto text-sm font-medium"
                style={{ color: "#1A1A1A", letterSpacing: "0.02em" }}
              >
                {isAr ? step.labelAr : step.labelEn}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={isActive ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="w-16 h-px mb-12"
        style={{ background: "rgba(201,169,97,0.25)" }}
      />

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <p
          className="font-cormorant font-semibold leading-[1.2]"
          style={{
            fontSize: "clamp(2.05rem, 8vw, 3rem)",
            color: "#0B0B0B",
            textShadow: "none",
          }}
        >
          {isAr ? "عندك فكرة؟" : "Got an idea?"}
          <br />
          <span style={{ color: "rgba(11,11,11,0.9)", fontSize: "82%" }}>
            {isAr ? "خلنا نحولها لعالم بصري" : "Let's build your visual world"}
          </span>
        </p>

        <div className="flex flex-col gap-3">
          {/* Use MotionLink so React Router handles the navigation —
              <a href> would trigger a full page reload inside the SPA. */}
          <MotionLink
            to="/booking"
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 0 36px rgba(201,169,97,0.22)", borderColor: "rgba(201,169,97,0.8)" }}
            className="flex items-center justify-center gap-3 font-noto text-base font-bold transition-all duration-400"
            style={{
              border: "2px solid #1A1A1A",
              color: "#1A1A1A",
              background: "#F5F1E8",
              borderRadius: "999px",
              padding: "14px 32px",
            }}
          >
            {isAr ? "ابدأ مشروعك" : "Start Your Project"}
          </MotionLink>
          {/* CV page is served at /cv — no plain-text file to download */}
          <MotionLink
            to="/cv"
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-3 rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-7 py-3 font-noto text-base font-bold text-[#1A1A1A]"
          >
            <Download className="h-4 w-4" /> {isAr ? "السيرة الذاتية" : "View CV"}
          </MotionLink>
        </div>
      </motion.div>
    </div>
  );
}