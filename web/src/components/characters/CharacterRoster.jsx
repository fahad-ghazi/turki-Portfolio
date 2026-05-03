import React from "react";
import { motion } from "framer-motion";
import Picture from "@/components/brand/Picture";
export default function CharacterRoster({ characters, selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {characters.map((character, index) => {
        const active = selectedId === character.id;
        return (
          <motion.button
            key={character.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() => onSelect(character)}
            className={`group relative overflow-hidden rounded-[1.6rem] border text-right transition-all duration-500 ${active ? "border-[#C9A961] bg-[#1A1A1A]" : "border-[#C9A961]/20 bg-[#E9E2D3]/45 hover:border-[#C9A961]/60"}`}
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Picture src={character.cover} alt={character.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A961]/55 via-transparent to-[#1A1A1A]/35 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute right-3 top-3 rounded-full border border-[#C9A961]/60 bg-black/35 px-3 py-1 font-cinzel text-[9px] tracking-[0.25em] text-[#C9A961] backdrop-blur-sm">
                {character.code}
              </span>
              <span className="absolute bottom-3 left-3 rounded-full bg-[#F5F1E8]/90 px-3 py-1 font-noto text-[10px] font-bold text-[#1A1A1A]">
                {character.images.length} زوايا
              </span>
            </div>
            <div className="p-4">
              <h3 className={`font-noto text-xl font-bold ${active ? "text-[#F5F1E8]" : "text-[#1A1A1A]"}`}>{character.name}</h3>
              <p className="mt-1 font-cinzel text-[9px] tracking-[0.25em] text-[#C9A961]">{character.nameEn}</p>
              <p className={`mt-3 line-clamp-2 font-noto text-xs leading-6 ${active ? "text-[#F5F1E8]/70" : "text-[#1A1A1A]/65"}`}>{character.role}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}