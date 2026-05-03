import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const HERO_IMAGE = "/works/hero-poster.jpg";

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToWorlds = () => {
    document.getElementById("worlds")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden" dir="rtl">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      >
        <img
          src={HERO_IMAGE}
          alt="Turki Ghazi walking"
          className="w-full h-[120%] object-cover object-center"
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <h1 className="font-cinzel text-5xl md:text-7xl font-bold text-foreground tracking-wider mb-3">
            تركي غازي
          </h1>
          <p className="text-primary font-cinzel text-lg md:text-xl tracking-[0.3em] mb-6">
            مصمم ومبدع بصري
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-muted-foreground text-sm md:text-base mb-10 font-light"
        >
          نصنع عوالم بصرية بالذكاء الاصطناعي
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          onClick={scrollToWorlds}
          className="border border-primary/60 text-primary px-8 py-3 text-sm tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-500 font-noto"
        >
          ادخل التجربة ←
        </motion.button>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-primary/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}