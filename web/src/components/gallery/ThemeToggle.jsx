import React from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ theme, onToggle }) {
  const isLight = theme === "light";
  const next = isLight ? "dark" : "light";
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={() => onToggle(next)}
      aria-label={isLight ? "تفعيل الوضع الليلي" : "تفعيل الوضع الفاتح"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition"
      style={{
        borderColor: "var(--gi-border)",
        color: "var(--gi-text-muted)",
        backgroundColor: "transparent",
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
      <Icon size={15} strokeWidth={1.6} />
    </button>
  );
}
