import React from "react";
import { useLang } from "@/lib/LanguageContext";

const GOLD = "#C9A961";

/**
 * Editorial "eyebrow" label that sits above page titles. Bilingual:
 *
 *   <Eyebrow ar="عن تركي" en="About" />
 *
 * Latin reading (en): font-cinzel small caps tracked-out — the
 * editorial luxury feel.
 * Arabic reading (ar): font-noto bold tracked tightly — Cinzel doesn't
 * have Arabic glyphs.
 *
 * Audit fixes:
 *   #17 — eyebrows used to render English labels in Arabic UIs.
 *   #41 — minimum size bumped from 10px to 11px so they're not
 *         straining on a phone.
 */
export default function Eyebrow({ ar, en, className = "" }) {
  const { isAr } = useLang();
  if (isAr) {
    return (
      <span
        className={`font-noto text-xs font-bold tracking-[0.18em] ${className}`}
        style={{ color: GOLD }}
      >
        {ar}
      </span>
    );
  }
  return (
    <span
      className={`font-cinzel text-[11px] tracking-[0.4em] uppercase ${className}`}
      style={{ color: GOLD }}
    >
      {en}
    </span>
  );
}
