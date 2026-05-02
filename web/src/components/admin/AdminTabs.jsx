import React from "react";

export const ADMIN_TABS = [
  ["overview", "نظرة عامة"],
  ["content", "المحتوى"],
  ["projects", "الأعمال"],
  ["films", "الأفلام"],
  ["blog", "المدونة"],
  ["sources", "المصادر"],
  ["seo", "SEO / AEO"],
  ["analytics", "التحليلات"],
  ["leads", "الحجوزات"],
  ["errors", "الأخطاء"],
  ["media", "المكتبة"],
];

export default function AdminTabs({ activeTab, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {ADMIN_TABS.map(([id, label]) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`shrink-0 rounded-full border px-4 py-2 font-noto text-xs transition ${activeTab === id ? "border-[#C9A961] bg-[#C9A961]/10 text-[#C9A961]" : "border-[#1A1A1A]/10 text-[#1A1A1A]/55 hover:border-[#C9A961]/45"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}