import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Maximize2, Pause, Play } from "lucide-react";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";

const GOLD = "#C9A961";

export default function FilmDetailScreen({ film, films, onBack, onSelect }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video?.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  useContentTimeTracker(film.id, true, playing ? 2 : 0.5);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-50 overflow-hidden bg-black text-[#F5F1E8]"
      dir="rtl"
    >
      <video
        ref={videoRef}
        src={film.videoUrl}
        autoPlay
        muted
        playsInline
        onTimeUpdate={updateProgress}
        poster={film.thumbnail}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/28 via-transparent to-black/78" />

      <div className="absolute left-7 right-7 top-7 z-20 flex items-center justify-between">
        <button onClick={onBack} className="menu-icon" aria-label="العودة للأفلام">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <span className="font-cinzel text-[10px] tracking-[0.45em]" style={{ color: GOLD }}>TURKI STUDIO</span>
        <button onClick={() => videoRef.current?.requestFullscreen?.()} className="menu-icon" aria-label="ملء الشاشة">
          <Maximize2 className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-8 pb-9">
        <h1 className="font-cormorant text-[4rem] font-semibold leading-[0.9] md:text-[6rem]">{film.title}</h1>
        <p className="mt-4 max-w-md font-noto text-sm leading-7 text-[#F5F1E8]/78">{film.description}</p>

        <div className="mt-7 flex items-center gap-5">
          <button onClick={togglePlay} className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A961] bg-black/24 text-[#C9A961] backdrop-blur-sm">
            {playing ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="h-6 w-6" fill="currentColor" />}
          </button>
          <div className="h-px flex-1 bg-[#F5F1E8]/22">
            <div className="h-px transition-all duration-150" style={{ width: `${progress}%`, background: GOLD }} />
          </div>
          <span className="font-cinzel text-[10px] text-[#F5F1E8]/70">{film.duration}</span>
        </div>

        <a href="/booking" className="mt-7 inline-flex items-center justify-center rounded-full bg-[#F5F1E8] px-6 py-3 font-noto text-sm font-bold text-[#1A1A1A] transition hover:bg-[#C9A961]">
          أريد مشروعًا مشابهًا
        </a>

        <div className="mt-7 flex gap-3 overflow-x-auto pb-1">
          {films.filter((item) => item.id !== film.id).slice(0, 6).map((item) => (
            <button key={item.id} onClick={() => onSelect(item)} className="h-20 min-w-16 overflow-hidden rounded-xl border border-[#F5F1E8]/18 transition hover:border-[#C9A961]">
              <img src={item.thumbnail} alt={item.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}