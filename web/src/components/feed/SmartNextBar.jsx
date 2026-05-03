import React from "react";
import { ArrowLeft } from "lucide-react";
import { getRecommendedItems } from "../../utils/behaviorTracking";
import Picture from "@/components/brand/Picture";
const GOLD = "#C9A961";

export default function SmartNextBar({ items, currentId, onSelect }) {
  const [next] = getRecommendedItems(items, currentId, 1);
  if (!next) return null;

  return (
    <button
      onClick={() => onSelect(next)}
      className="absolute bottom-20 right-5 z-30 flex max-w-[78%] items-center gap-3 rounded-full border border-[#C9A961]/35 bg-[#F5F1E8]/92 px-4 py-2.5 text-right shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-[#C9A961]/65"
    >
      <Picture src={next.src} alt={next.title} className="h-10 w-14 rounded-full object-cover" />
      <div className="min-w-0 flex-1">
        <p className="font-cinzel text-[8px] tracking-[0.22em]" style={{ color: GOLD }}>المشروع التالي</p>
        <h4 className="truncate font-noto text-xs text-[#1A1A1A]/80">{next.title}</h4>
      </div>
      <ArrowLeft className="h-4 w-4 text-[#C9A961]" strokeWidth={1.5} />
    </button>
  );
}