import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import TGLogo from "@/components/brand/TGLogo";
import Picture from "@/components/brand/Picture";
const GOLD = "#C9A961";

export default function FilmsListScreen({ films, onSelect }) {
  const [featuredFilm, setFeaturedFilm] = useState(films[0]);
  const activeFilm = featuredFilm || films[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 overflow-hidden bg-[#0B0B0B] text-[#F5F1E8]"
      dir="rtl"
    >
      <Picture src={activeFilm?.thumbnail} alt={activeFilm?.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/88" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_24%,rgba(201,169,97,0.22),transparent_34%)]" />

      <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 pt-7 md:px-10">
        <Link to="/" className="menu-icon" aria-label="العودة للرئيسية">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <TGLogo size="sm" />
      </header>

      <main className="relative z-10 flex h-full flex-col justify-end px-6 pb-7 pt-24 md:px-12 md:pb-12">
        <div className="grid min-h-0 flex-1 items-end gap-7 md:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] md:items-center">
          <motion.section
            key={activeFilm?.id}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8" style={{ background: GOLD }} />
              <span className="font-cinzel text-[10px] tracking-[0.42em]" style={{ color: GOLD }}>TURKI STUDIO FILMS</span>
            </div>
            <p className="mb-3 font-noto text-xs font-light text-[#F5F1E8]/68">اختر البوستر أو اضغط التشغيل مباشرة</p>
            <h1 className="font-cormorant text-[3.5rem] font-semibold leading-[0.9] tracking-[-0.02em] sm:text-[4.7rem] md:text-[6.5rem]">
              {activeFilm?.title}
            </h1>
            <p className="mt-5 max-w-md font-noto text-sm leading-8 text-[#F5F1E8]/82">{activeFilm?.description}</p>
            <button
              onClick={() => onSelect(activeFilm)}
              className="mt-7 inline-flex items-center gap-4 rounded-full bg-[#F5F1E8] px-7 py-3.5 font-noto text-sm font-bold text-[#1A1A1A] transition hover:bg-[#C9A961]"
            >
              <Play className="h-4 w-4" fill="currentColor" strokeWidth={1.4} />
              تشغيل الآن
            </button>
          </motion.section>

          <button
            onClick={() => onSelect(activeFilm)}
            className="group relative mx-auto hidden aspect-[3/4] w-full max-w-[360px] overflow-hidden rounded-[2rem] border border-[#C9A961]/45 bg-black/30 shadow-2xl shadow-black/40 md:block"
          >
            <Picture src={activeFilm?.thumbnail} alt={activeFilm?.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A961] bg-black/35 text-[#C9A961] backdrop-blur-sm transition group-hover:scale-110">
              <Play className="h-6 w-6" fill="currentColor" strokeWidth={1.4} />
            </span>
          </button>
        </div>

        <div className="mt-7 flex gap-3 overflow-x-auto pb-2 md:mt-2">
          {films.map((film, index) => (
            <button
              key={film.id}
              onMouseEnter={() => setFeaturedFilm(film)}
              onFocus={() => setFeaturedFilm(film)}
              onClick={() => onSelect(film)}
              className={`group relative h-32 min-w-[92px] overflow-hidden rounded-2xl border transition duration-300 md:h-36 md:min-w-[108px] ${activeFilm?.id === film.id ? "border-[#C9A961] shadow-lg shadow-[#C9A961]/15" : "border-[#F5F1E8]/16 hover:border-[#C9A961]/70"}`}
            >
              <Picture src={film.thumbnail} alt={film.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute bottom-3 right-3 font-cinzel text-[10px] tracking-[0.18em] text-[#F5F1E8]">{String(index + 1).padStart(2, "0")}</span>
              <span className="absolute bottom-3 left-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F1E8]/90 text-[#1A1A1A] opacity-0 transition group-hover:opacity-100">
                <Play className="h-3 w-3" fill="currentColor" />
              </span>
            </button>
          ))}
        </div>
      </main>
    </motion.div>
  );
}