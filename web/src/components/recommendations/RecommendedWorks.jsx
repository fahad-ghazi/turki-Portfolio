import React from "react";
import { Play } from "lucide-react";

const GOLD = "#C9A961";

export default function RecommendedWorks({ items, onSelect }) {
  if (!items.length) return null;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-noto text-xs font-medium text-[#1A1A1A]/75">مقترح لك</p>
        <span className="font-cinzel text-[9px] tracking-[0.25em]" style={{ color: GOLD }}>SMART PICKS</span>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group flex w-full items-center gap-3 rounded-2xl border border-[#C9A961]/18 bg-[#F5F1E8]/72 p-2 text-right transition hover:border-[#C9A961]/45 hover:bg-[#F5F1E8]"
          >
            <img src={item.thumbnail || item.src} alt={item.title} className="h-16 w-24 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-cinzel text-[9px] tracking-[0.22em]" style={{ color: GOLD }}>{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 truncate font-noto text-sm font-light text-[#1A1A1A]/85">{item.title}</h3>
              <p className="mt-1 font-cinzel text-[10px] text-[#1A1A1A]/42">{item.duration || item.year || "AI Visual"}</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C9A961]/45 text-[#C9A961]">
              <Play className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1.4} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}