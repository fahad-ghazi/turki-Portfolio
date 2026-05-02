import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";
import Seo from "@/components/seo/Seo";

const GOLD = "#C9A961";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-10 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="تواصل"
        description="تواصل مع تركي غازي — مصمم بصري بالذكاء الاصطناعي. ابدأ مشروعك أو احجز مكالمة."
        canonical="/contact"
      />
      <Link to="/" className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]">الرئيسية</Link>
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-cinzel text-[10px] tracking-[0.45em] uppercase" style={{ color: GOLD }}>
          Contact
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 font-cormorant text-7xl font-bold leading-none md:text-8xl">
          تواصل معي
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 max-w-md font-noto text-base font-normal leading-9 text-[#0B0B0B]">
          إذا عندك فكرة، حملة، فيلم، أو عالم بصري — خلنا نحوله لتجربة سينمائية.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link to="/booking" className="rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 text-center font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]">
            ابدأ مشروعك
          </Link>
          <a href="/cv" className="flex items-center justify-center gap-3 rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]">
            <Download className="h-4 w-4" /> عرض السيرة
          </a>
        </motion.div>

        <div className="mt-12 flex gap-4">
          <a className="social-icon" href="mailto:contact@turkighazi.com" aria-label="Email"><Mail /></a>
        </div>
      </div>
    </div>
  );
}