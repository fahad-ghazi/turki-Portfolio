import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PROJECTS = [
  {
    id: 1,
    title: "GOLD ERA CAMPAIGN",
    category: "AI Film",
    image: "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/c6a4f8523_IMG_0267.jpg",
  },
  {
    id: 2,
    title: "PRODUCT PRO",
    category: "Product",
    image: "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/c19215f8f_IMG_0262.jpg",
  },
  {
    id: 3,
    title: "60 SEC CINEMATIC",
    category: "Creative",
    image: "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/903d3fe3b_IMG_0268.jpg",
  },
  {
    id: 4,
    title: "FASHION STUDIO",
    category: "AI Film",
    image: "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/8ca04bb7d_IMG_0266.jpg",
  },
  {
    id: 5,
    title: "DESERT VISION",
    category: "Creative",
    image: "https://media.base44.com/images/public/user_685b19d62576f664d63bade4/1f7df23f8_IMG_0265.jpg",
  },
];

export default function ProjectsSection({ onProjectSelect }) {
  const [current, setCurrent] = useState(0);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const handleTouchStart = (e) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0 && current < PROJECTS.length - 1) {
        setCurrent(current + 1);
      } else if (distance < 0 && current > 0) {
        setCurrent(current - 1);
      }
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  return (
    <section id="projects" className="relative min-h-screen bg-background py-20 overflow-hidden" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 px-6"
      >
        <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-foreground mb-3">
          المشاريع
        </h2>
        <div className="w-12 h-px bg-primary/40 mx-auto" />
      </motion.div>

      {/* Swipe Cards */}
      <div
        className="relative flex items-center justify-center h-[60vh] md:h-[65vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="popLayout">
          {PROJECTS.map((project, index) => {
            const offset = index - current;
            if (Math.abs(offset) > 1) return null;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.85, x: offset > 0 ? 300 : -300 }}
                animate={{
                  opacity: offset === 0 ? 1 : 0.4,
                  scale: offset === 0 ? 1 : 0.82,
                  x: offset * 220,
                  zIndex: offset === 0 ? 10 : 5,
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute w-[75vw] md:w-[400px] cursor-pointer"
                onClick={() => offset === 0 && onProjectSelect(project)}
              >
                <div className="relative rounded-lg overflow-hidden shadow-2xl">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-[50vh] md:h-[55vh] object-cover"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                  {/* Info */}
                  {offset === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="absolute bottom-0 left-0 right-0 p-6"
                    >
                      <span className="text-primary text-xs tracking-[0.2em] font-cinzel">
                        {project.category}
                      </span>
                      <h3 className="font-cinzel text-lg md:text-xl text-foreground mt-1 tracking-wider">
                        {project.title}
                      </h3>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {PROJECTS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === current ? "bg-primary w-6" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    </section>
  );
}