import React from "react";

export default function AdminStatCard({ title, value, note }) {
  return (
    <div className="rounded-2xl border border-[#C9A961]/16 bg-[#F5F1E8] p-5">
      <p className="font-noto text-xs text-[#1A1A1A]/48">{title}</p>
      <h3 className="mt-3 font-cinzel text-3xl text-[#1A1A1A]">{value}</h3>
      {note && <p className="mt-2 font-noto text-[11px] text-[#1A1A1A]/45">{note}</p>}
    </div>
  );
}