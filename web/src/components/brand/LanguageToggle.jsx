import React from "react";
import { useLang } from "@/lib/LanguageContext";

/**
 * Compact language toggle. Renders as a tiny inline pill ("AR · EN")
 * with the current language highlighted. Designed to live inside
 * existing menus (HeroFeedItem menu) without adding a new visual
 * affordance to the chrome — the user explicitly rejected a top
 * navigation bar earlier.
 *
 * Usage:
 *   <LanguageToggle />              // pill style (default)
 *   <LanguageToggle variant="link"  // text-only "EN" / "AR" link
 *      compact />
 */
export default function LanguageToggle({ variant = "pill", compact = false, className = "" }) {
  const { lang, set } = useLang();

  if (variant === "link") {
    const next = lang === "ar" ? "en" : "ar";
    return (
      <button
        type="button"
        onClick={() => set(next)}
        aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
        className={`font-cinzel text-[11px] tracking-[0.35em] text-[#C9A961]/85 transition hover:text-[#C9A961] ${className}`}
      >
        {compact ? next.toUpperCase() : lang === "ar" ? "EN" : "AR"}
      </button>
    );
  }

  // pill — segmented "AR · EN"
  return (
    <div
      role="group"
      aria-label={lang === "ar" ? "اللغة" : "Language"}
      className={`inline-flex items-center gap-1 rounded-full border border-[#C9A961]/40 bg-black/22 p-0.5 text-[11px] backdrop-blur-sm ${className}`}
    >
      {[
        { code: "ar", label: "AR" },
        { code: "en", label: "EN" },
      ].map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => set(code)}
          className={`min-w-9 rounded-full px-2.5 py-1 font-cinzel tracking-[0.2em] transition ${
            lang === code
              ? "bg-[#C9A961] text-[#1A1A1A]"
              : "text-[#F5F1E8]/75 hover:text-[#C9A961]"
          }`}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
