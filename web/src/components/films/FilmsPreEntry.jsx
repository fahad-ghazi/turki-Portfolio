import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import TGLogo from "@/components/brand/TGLogo";
import Picture from "@/components/brand/Picture";
const GOLD = "#C9A961";
const BG = "https://media.apiClient.com/images/public/69f618d78f528f5ed96d2f9c/85671f43f_hero-poster.jpg";

export default function FilmsPreEntry({ onEnter }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 overflow-hidden bg-[#F5F1E8] p-1.5"
      dir="rtl"
    >
      <div className="relative h-full overflow-hidden rounded-[1.35rem] bg-[#E9E2D3]">
        <Picture src={BG} alt="الأفلام السينمائية" className="absolute inset-0 h-full w-full object-cover" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.45) 100%)" }}
        />

        <div className="absolute left-7 top-7 z-20">
          <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F5F1E8]/40 bg-black/25 text-[#F5F1E8] backdrop-blur-sm transition hover:border-[#C9A961] hover:text-[#C9A961]" aria-label="Home">
            <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="absolute right-5 top-4 z-20">
          <TGLogo size="sm" />
        </div>

        <div className="absolute right-7 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-3">
          {[0, 1, 2, 3, 4].map((dot) => (
            <span
              key={dot}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: dot === 0 ? GOLD : "rgba(245,241,232,0.32)" }}
            />
          ))}
        </div>

        <div className="absolute bottom-24 left-7 right-7 z-20 flex flex-col items-start text-right sm:bottom-28 sm:left-10">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-cinzel text-[10px] tracking-[0.45em] uppercase"
            style={{ color: GOLD }}
          >
            TURKI STUDIO
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-5 max-w-[280px] font-cormorant text-[4.2rem] font-semibold leading-[0.92] text-[#F5F1E8] sm:text-[5.4rem]"
          >
            الأفلام<br />السينمائية
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
            className="mt-5 max-w-[230px] font-noto text-sm font-light leading-7 text-[#F5F1E8]/85"
          >
            قصص بصرية تُصنع لتبقى في الذاكرة
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58 }}
            whileTap={{ scale: 0.97 }}
            onClick={onEnter}
            className="relative z-30 mt-8 min-h-[46px] rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3 font-noto text-base font-bold text-[#1A1A1A] transition-all duration-300 hover:border-[#C9A961]"
          >
            استكشف الأفلام →
          </motion.button>
        </div>

        <div className="absolute bottom-8 left-7 z-20 font-cinzel text-[11px] text-[#C9A961]">01 <span className="text-[#F5F1E8]/60">/ 05</span></div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="font-noto text-[10px] text-[#F5F1E8]/70">اسحب للأسفل</span>
          <div className="relative h-10 w-px" style={{ background: `linear-gradient(to bottom, rgba(201,169,97,0.2), ${GOLD})` }}>
            <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full" style={{ background: GOLD }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}