import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronUp } from "lucide-react";

export default function CategoryFeedItem({ category, isActive }) {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const handleEnter = () => navigate(category.slug);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black" dir="rtl">
      {/* Background Image */}
      {isActive && (
        <img
          src={category.coverImage}
          alt={category.titleEn}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} scale-105`}
          style={{ transform: isActive ? "scale(1.03)" : "scale(1.08)", transition: "transform 8s ease-out, opacity 0.7s" }}
        />
      )}

      {/* Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-t ${category.color} via-black/40 to-black/30`} />

      {/* Tap / swipe up zone */}
      <button
        onClick={handleEnter}
        className="absolute inset-0 w-full h-full focus:outline-none"
        aria-label={`Enter ${category.titleEn}`}
      />

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute bottom-28 right-0 left-0 px-8 pointer-events-none"
      >
        <span className="text-primary text-xs tracking-[0.3em] font-cinzel block mb-3 uppercase">
          {category.titleEn}
        </span>
        <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
          {category.title}
        </h2>
        <p className="text-white/60 text-sm font-light leading-relaxed max-w-xs">
          {category.subtitle}
        </p>
      </motion.div>

      {/* Enter CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
      >
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronUp className="w-5 h-5 text-white/50" />
        </motion.div>
        <span className="text-white/40 text-xs tracking-[0.2em] font-cinzel">TAP TO ENTER</span>
      </motion.div>
    </div>
  );
}