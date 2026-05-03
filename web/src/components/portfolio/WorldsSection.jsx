import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const GALLERY_IMAGE = "/works/hero-poster.jpg";

export default function WorldsSection() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 0.5], [1.15, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.5], [60, 0]);

  return (
    <section
      id="worlds"
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      dir="rtl"
    >
      {/* Background with scale effect */}
      <motion.div className="absolute inset-0" style={{ scale }}>
        <img
          src={GALLERY_IMAGE}
          alt="Visual worlds gallery"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Perspective lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, y }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="font-cinzel text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
            عوالم بصرية
          </h2>
          <p className="text-primary font-cinzel text-base md:text-lg tracking-[0.2em] mb-6">
            تصنع بالذكاء الاصطناعي
          </p>
          <div className="w-16 h-px bg-primary/40 mx-auto mb-8" />
          <p className="text-muted-foreground text-sm md:text-base font-light">
            استكشف العوالم الإبداعية
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}