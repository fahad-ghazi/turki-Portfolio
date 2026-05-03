import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/LanguageContext";
import { trainedCharacters } from "@/components/characters/trainedCharactersData";
import TinderMode from "./TinderMode";
import Picture from "@/components/brand/Picture";
const GOLD = "#C9A961";

export default function MicroContext({ isActive }) {
  const { isAr } = useLang();
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [galleryCharacter, setGalleryCharacter] = useState(null);
  // Audit fix: previous version called setRotation 60 times/second via
  // requestAnimationFrame, which forced a full re-render of MicroContext
  // (parent + 8 children) every frame. On mid-tier phones that meant
  // the orbit jittered visibly. Now we keep rotation in a ref and write
  // the new transform straight onto the ring's DOM node — React state
  // never moves, the children never re-render for the animation.
  const ringRef = useRef(null);
  const buttonsRef = useRef([]);
  const frameRef = useRef(null);
  const lastFrameTimeRef = useRef(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (selectedCharacter || galleryCharacter) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastFrameTimeRef.current = null;
      return;
    }

    const rotate = (time) => {
      if (lastFrameTimeRef.current !== null) {
        const delta = time - lastFrameTimeRef.current;
        rotationRef.current = (rotationRef.current + (delta * 360) / 28000) % 360;
        const r = rotationRef.current;
        // Outer ring rotates positively to carry the buttons around.
        if (ringRef.current) {
          ringRef.current.style.transform = `rotate(${r}deg)`;
        }
        // Inner content of each button counter-rotates so the photo
        // stays upright as the orbit turns.
        const inv = -r;
        const inner = buttonsRef.current;
        for (let i = 0; i < inner.length; i++) {
          if (inner[i]) inner[i].style.transform = `rotate(${inv}deg)`;
        }
      }
      lastFrameTimeRef.current = time;
      frameRef.current = requestAnimationFrame(rotate);
    };

    frameRef.current = requestAnimationFrame(rotate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastFrameTimeRef.current = null;
    };
  }, [selectedCharacter, galleryCharacter]);

  const characterCategory = galleryCharacter ? {
    id: `character-${galleryCharacter.id}`,
    titleEn: galleryCharacter.nameEn,
    items: galleryCharacter.images.map((src, index) => ({
      id: `${galleryCharacter.id}-${index}`,
      type: "image",
      src,
      alt: `${galleryCharacter.name} angle ${index + 1}`,
      title: galleryCharacter.name,
      description: galleryCharacter.bio,
    })),
  } : null;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#F5F1E8]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,169,97,0.12) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        className="flex flex-col items-center gap-5 px-10 text-center"
      >
        <div className="flex items-center gap-3">
          <div className="h-px w-6" style={{ background: GOLD }} />
          <span className="font-noto text-xl font-bold tracking-[0.08em] md:text-2xl" style={{ color: GOLD }}>
            {isAr ? "وش أسوي؟" : "What I Do?"}
          </span>
          <div className="h-px w-6" style={{ background: GOLD }} />
        </div>

        <p
          className="font-noto font-light leading-[2]"
          style={{
            fontSize: "clamp(1.35rem, 5.8vw, 1.9rem)",
            color: "#0B0B0B",
            maxWidth: "420px",
            letterSpacing: "0.015em",
          }}
        >
          {isAr
            ? "أصمم محتوى بصري للأفلام والإعلانات باستخدام الذكاء الاصطناعي"
            : "I design visual content for films and ads using AI"}
        </p>

        <div className="h-px w-8 mt-1" style={{ background: "rgba(201,169,97,0.24)" }} />

        <div className="mt-2 w-full max-w-[520px]">
          <div className="relative mx-auto h-56 w-56">
            <div className="absolute inset-8 rounded-full border border-[#C9A961]/25 bg-[#E9E2D3]/35" />
            {/* The orbit ring rotates as a whole (animated by ringRef.style
                in the requestAnimationFrame loop); each child sits at a
                fixed angle within it and only counter-rotates its inner
                content to stay upright. No React state per frame. */}
            <div ref={ringRef} className="absolute inset-0" style={{ willChange: "transform" }}>
              {trainedCharacters.map((character, index) => {
                const angle = (360 / trainedCharacters.length) * index;
                return (
                  <button
                    key={character.id}
                    onClick={() => {
                      if (selectedCharacter?.id === character.id) {
                        setGalleryCharacter(character);
                      } else {
                        setSelectedCharacter(character);
                      }
                    }}
                    className={`group absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border bg-black/20 shadow-lg shadow-black/10 transition duration-300 hover:scale-110 hover:border-[#C9A961] ${selectedCharacter?.id === character.id ? "scale-110 border-[#C9A961] shadow-[#C9A961]/30" : "border-[#C9A961]/55 shadow-black/10"}`}
                    style={{
                      // Position on the orbit. The outer ring rotation
                      // is applied by the parent via ringRef. We just
                      // place this button at its fixed slot.
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-88px)`,
                    }}
                    aria-label={`عرض ${character.name}`}
                  >
                    {/* Counter-rotated inner wrapper so the image stays
                        upright as the parent orbit spins. The inline
                        ref stash lets the rAF loop update its transform
                        without triggering React. */}
                    <span
                      ref={(el) => {
                        buttonsRef.current[index] = el;
                      }}
                      className="block h-full w-full"
                      style={{
                        transform: `rotate(-${angle}deg)`,
                        willChange: "transform",
                      }}
                    >
                      <Picture src={character.cover} alt={character.name} className="h-full w-full object-cover object-top" />
                      <span className="absolute inset-0 bg-gradient-to-tr from-[#C9A961]/55 via-transparent to-black/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-full border border-[#C9A961]/35 bg-[#F5F1E8]/90 px-5 py-3 font-noto text-sm font-bold text-[#1A1A1A] shadow-md">
                {isAr ? "عيالي" : "Characters"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {characterCategory && (
          <TinderMode
            category={characterCategory}
            onExit={() => {
              setGalleryCharacter(null);
              setSelectedCharacter(null);
            }}
            onNextCategory={() => {
              setGalleryCharacter(null);
              setSelectedCharacter(null);
            }}
            closeOnComplete
          />
        )}
      </AnimatePresence>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-10 left-0 right-0 flex justify-center"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-5"
          style={{ background: `linear-gradient(to bottom, transparent, rgba(201,169,97,0.4), transparent)` }}
        />
      </motion.div>
    </div>
  );
}