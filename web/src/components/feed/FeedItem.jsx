import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function ImageItem({ src, isActive, isAdjacent }) {
  const [loaded, setLoaded] = useState(false);
  const shouldLoad = isActive || isAdjacent;

  return (
    <div className="absolute inset-0">
      {/* Low-res blur placeholder */}
      {shouldLoad && !loaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-60"
          style={{ backgroundImage: `url(${src})` }}
        />
      )}
      {shouldLoad && (
        <img
          src={src}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

function VideoItem({ src, isActive }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        preload={isActive ? "auto" : "none"}
      />
    </div>
  );
}

function BrandItem({ src, title, subtitle }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="text-center px-8">
        <div className="w-28 h-28 mx-auto mb-8 rounded-full overflow-hidden border border-primary/30">
          <img src={src} alt="TG Logo" className="w-full h-full object-cover" />
        </div>
        <p className="text-muted-foreground text-sm mb-4 font-light">رحلتك انتهت</p>
        <h2 className="font-cinzel text-3xl md:text-5xl font-bold text-foreground mb-2 tracking-wider">
          والإبداع لا يتوقف
        </h2>
        <div className="w-16 h-px bg-primary/40 mx-auto my-6" />
        <h3 className="font-cinzel text-2xl text-primary tracking-[0.15em] mb-3">{title}</h3>
        <p className="text-muted-foreground text-sm mb-8">{subtitle}</p>
        <a
          href="mailto:hello@turkighazi.com"
          className="inline-block border border-primary/60 text-primary px-8 py-3 text-sm tracking-widest hover:bg-primary hover:text-primary-foreground transition-all duration-500"
        >
          تواصل معي
        </a>
      </div>
    </div>
  );
}

export default function FeedItem({ item, isActive, isAdjacent }) {
  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Media Layer */}
      {item.isBrand ? (
        <BrandItem src={item.src} title={item.title} subtitle={item.subtitle} />
      ) : item.type === "video" ? (
        <VideoItem src={item.src} isActive={isActive} />
      ) : (
        <ImageItem src={item.src} isActive={isActive} isAdjacent={isAdjacent} />
      )}

      {/* Gradient Overlay */}
      {!item.isBrand && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
      )}

      {/* Text Overlay */}
      {!item.isBrand && (item.title || item.category) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="absolute bottom-24 right-0 left-0 px-6 text-right"
          dir="rtl"
        >
          {item.category && (
            <span className="text-primary text-xs tracking-[0.25em] font-cinzel block mb-2">
              {item.category}
            </span>
          )}
          {item.title && (
            <h2 className={`font-cinzel font-bold text-white tracking-wider ${item.isHero ? "text-4xl md:text-6xl" : "text-2xl md:text-3xl"}`}>
              {item.title}
            </h2>
          )}
          {item.subtitle && (
            <p className="text-white/70 text-sm mt-1 font-light">{item.subtitle}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}