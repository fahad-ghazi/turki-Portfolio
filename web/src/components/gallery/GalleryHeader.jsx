import React, { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { COLLECTIONS, VIEW_MODES } from "./galleryAlgorithm";
import ThemeToggle from "./ThemeToggle";

/**
 * Editorial Arabic-first header. The earlier English version was busy —
 * this one strips it down to: brand, title, subtitle, two chip rows,
 * a theme toggle and a copy-link affordance. Lots of breathing room
 * and a single accent rule under the title.
 */
export default function GalleryHeader({
  view,
  collection,
  count,
  theme,
  onChangeTheme,
  onChangeView,
  onChangeCollection,
}) {
  const [copied, setCopied] = useState(false);

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  return (
    <header className="mx-auto w-full max-w-[1600px] px-5 pb-12 pt-14 md:px-12 md:pb-20 md:pt-24">
      {/* Top bar — eyebrow, count, theme toggle */}
      <div className="mb-12 flex items-center justify-between">
        <div
          className="flex items-center gap-3 text-[10.5px] tracking-[0.32em]"
          style={{ color: "var(--gi-text-subtle)" }}
        >
          <span>تركي غازي</span>
          <span style={{ color: "var(--gi-border-strong)" }}>·</span>
          <span>{count} عمل</span>
        </div>
        <ThemeToggle theme={theme} onToggle={onChangeTheme} />
      </div>

      {/* Title block */}
      <div className="flex flex-col gap-5">
        <h1
          className="font-medium leading-[1.05] tracking-tight"
          style={{
            fontSize: "clamp(3rem, 9vw, 7rem)",
            color: "var(--gi-text)",
            fontFeatureSettings: "'ss01'",
          }}
        >
          عوالم تركي
        </h1>

        <div
          className="h-px w-16"
          style={{ backgroundColor: "var(--gi-accent)" }}
        />

        <p
          className="max-w-[640px] text-[15px] leading-[1.9] md:text-[17px]"
          style={{ color: "var(--gi-text-muted)" }}
        >
          تجارب بصرية مولَّدة بالذكاء الاصطناعي — مُرتَّبة لا حسب التاريخ، بل
          حسب اللون والضوء والمزاج.
        </p>
      </div>

      {/* Controls — single column on mobile, breathable on desktop */}
      <div className="mt-14 flex flex-col gap-7 md:gap-5">
        <ChipRow
          options={COLLECTIONS}
          value={collection || "all"}
          onChange={onChangeCollection}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <ChipRow
            small
            options={VIEW_MODES}
            value={view}
            onChange={onChangeView}
          />
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] tracking-[0.18em] transition"
            style={{
              border: "1px solid var(--gi-border)",
              color: "var(--gi-text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--gi-border-strong)";
              e.currentTarget.style.color = "var(--gi-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--gi-border)";
              e.currentTarget.style.color = "var(--gi-text-muted)";
            }}
          >
            {copied ? <Check size={13} /> : <LinkIcon size={13} />}
            {copied ? "تم النسخ" : "نسخ الرابط"}
          </button>
        </div>
      </div>
    </header>
  );
}

function ChipRow({ options, value, onChange, small = false }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`rounded-full transition ${
              small ? "px-3 py-1 text-[12px]" : "px-4 py-2 text-[13px]"
            }`}
            style={
              active
                ? {
                    backgroundColor: "var(--gi-chip-active)",
                    color: "var(--gi-chip-active-ink)",
                    border: "1px solid var(--gi-chip-active)",
                  }
                : {
                    backgroundColor: "transparent",
                    color: "var(--gi-text-muted)",
                    border: "1px solid var(--gi-border)",
                  }
            }
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = "var(--gi-border-strong)";
                e.currentTarget.style.color = "var(--gi-text)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = "var(--gi-border)";
                e.currentTarget.style.color = "var(--gi-text-muted)";
              }
            }}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
