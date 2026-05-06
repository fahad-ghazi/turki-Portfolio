import React, { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { COLLECTIONS, VIEW_MODES } from "./galleryAlgorithm";

export default function GalleryHeader({
  view,
  collection,
  count,
  onChangeView,
  onChangeCollection,
}) {
  const [copied, setCopied] = useState(false);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — silently ignore */
    }
  }

  return (
    <header className="mx-auto w-full max-w-[1600px] px-5 pb-8 pt-16 md:px-10 md:pt-24">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-white/45">
          <span>AI Visual Studio</span>
          <span className="text-white/20">·</span>
          <span>{count} works</span>
        </div>
        <h1 className="text-[clamp(2.4rem,6vw,4.6rem)] font-semibold tracking-tight text-white">
          AI Visual Worlds
        </h1>
        <p className="max-w-[640px] text-[15px] leading-relaxed text-white/55">
          Curated visual experiments generated with AI — sorted not by date,
          but by colour, light, contrast and mood.
        </p>
      </div>

      {/* Controls — minimal, no chrome. Wraps cleanly on mobile. */}
      <div className="mt-9 flex flex-col gap-4">
        <ChipRow
          label="View"
          options={VIEW_MODES}
          value={view}
          onChange={onChangeView}
        />
        <ChipRow
          label="Collection"
          options={COLLECTIONS}
          value={collection || "all"}
          onChange={onChangeCollection}
        />
        <div className="pt-1">
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {copied ? <Check size={13} /> : <LinkIcon size={13} />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>
    </header>
  );
}

function ChipRow({ label, options, value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-[10px] uppercase tracking-[0.28em] text-white/35">
        {label}
      </span>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] tracking-wide transition ${
              active
                ? "bg-white text-black"
                : "border border-white/12 text-white/65 hover:border-white/30 hover:text-white"
            }`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
