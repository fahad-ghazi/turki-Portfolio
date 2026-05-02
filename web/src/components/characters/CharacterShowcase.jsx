import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cinematicTileClasses = [
  "col-span-4 row-span-3",
  "col-span-2 row-span-2",
  "col-span-2 row-span-2",
  "col-span-3 row-span-2",
  "col-span-3 row-span-2",
  "col-span-2 row-span-2",
];

export default function CharacterShowcase({ character }) {
  const [activeImage, setActiveImage] = useState(character.images[0]);
  const isFeaturedProfile = ["layla-03", "omar-04"].includes(character.id);

  React.useEffect(() => {
    setActiveImage(character.images[0]);
  }, [character]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative min-h-[62vh] overflow-hidden rounded-[2rem] border border-[#C9A961]/25 bg-black">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={character.name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        {isFeaturedProfile && (
          <div
            className="absolute inset-0 opacity-60 mix-blend-screen"
            style={{ background: `radial-gradient(circle at 72% 18%, ${character.accent}55, transparent 42%)` }}
          />
        )}
        <div className="absolute bottom-0 right-0 left-0 p-6 text-[#F5F1E8]">
          <p className="font-cinzel text-[10px] tracking-[0.38em] text-[#C9A961]">{character.code} · TRAINED CHARACTER</p>
          <h2 className="mt-3 font-noto text-5xl font-bold leading-none md:text-7xl">{character.name}</h2>
          <p className="mt-4 max-w-lg font-noto text-sm leading-7 text-[#F5F1E8]/75">{character.tone}</p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#C9A961]/18 bg-[#E9E2D3]/45 p-5">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="font-cinzel text-[10px] tracking-[0.34em] text-[#C9A961]">ANGLE LIBRARY</p>
            <h3 className="mt-2 font-noto text-2xl font-bold text-[#1A1A1A]">زوايا الشخصية</h3>
          </div>
          <span className="rounded-full border border-[#1A1A1A]/20 px-3 py-1 font-noto text-xs text-[#1A1A1A]/65">{character.images.length} صور</span>
        </div>

        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 pr-1 md:grid md:max-h-[62vh] md:auto-rows-[140px] md:grid-cols-6 md:gap-2 md:overflow-y-auto md:pb-0">
          {character.images.map((image, index) => (
            <button
              key={image}
              onClick={() => setActiveImage(image)}
              className={`group relative h-[54vh] min-w-[78vw] snap-center overflow-hidden rounded-2xl border transition-all duration-500 sm:min-w-[56vw] md:h-auto md:min-w-0 ${cinematicTileClasses[index % cinematicTileClasses.length]} ${activeImage === image ? "border-[#C9A961] shadow-lg shadow-[#C9A961]/20" : "border-transparent hover:border-[#C9A961]/60"}`}
            >
              <img src={image} alt={`${character.name} angle ${index + 1}`} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#C9A961]/45 via-black/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              {isFeaturedProfile && (
                <span
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-80"
                  style={{ background: `linear-gradient(135deg, ${character.accent}66, transparent 58%)` }}
                />
              )}
              <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-cinzel text-[8px] text-[#F5F1E8] backdrop-blur-sm">
                A{String(index + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-[#C9A961]/20 bg-[#F5F1E8]/70 p-5">
          <p className="font-cinzel text-[10px] tracking-[0.32em] text-[#C9A961]">CHARACTER STORY</p>
          <h4 className="mt-2 font-noto text-xl font-bold text-[#1A1A1A]">نبذة عن {character.name}</h4>
          <p className="mt-3 font-noto text-sm leading-8 text-[#1A1A1A]/70">
            {isFeaturedProfile ? character.profileStory : character.bio || character.role}
          </p>
        </div>
      </div>
    </div>
  );
}