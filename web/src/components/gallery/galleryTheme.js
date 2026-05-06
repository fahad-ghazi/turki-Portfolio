// Theme tokens for /gallery-intelligent. Two scoped palettes — they
// are applied as CSS variables on the page wrapper only, so the rest
// of the site keeps its own design system untouched.
//
// Light is intentionally NOT clinical white. It's a warm editorial
// beige (think fashion magazine, cinematic luxury) — bone background,
// near-black text, very soft hairline borders, a muted gold accent.
//
// Dark mirrors what the gallery already had — true black with paper-
// white text and a slightly warmer gold so it doesn't read as cyan.

export const TOKENS = {
  light: {
    bg:         "#F4EFE5",
    surface:    "#EDE7D8",
    elevated:   "#FBF7EE",
    text:       "#0A0A0A",
    textMuted:  "#5C5C5C",
    textSubtle: "#8A8A8A",
    border:     "rgba(10,10,10,0.08)",
    borderStrong: "rgba(10,10,10,0.18)",
    accent:     "#9B8454",   // muted olive-gold
    accentInk:  "#FFFFFF",
    chipBg:     "rgba(10,10,10,0.04)",
    chipActive: "#0A0A0A",
    chipActiveInk: "#FBF7EE",
    overlayBg:  "rgba(0,0,0,0.6)",
    skeleton:   "rgba(10,10,10,0.05)",
    headerHaze: "rgba(244,239,229,0.85)",
  },
  dark: {
    bg:         "#0A0A0B",
    surface:    "#131316",
    elevated:   "#1A1A1F",
    text:       "#FFFFFF",
    textMuted:  "rgba(255,255,255,0.65)",
    textSubtle: "rgba(255,255,255,0.42)",
    border:     "rgba(255,255,255,0.10)",
    borderStrong: "rgba(255,255,255,0.22)",
    accent:     "#D4B77A",
    accentInk:  "#0A0A0A",
    chipBg:     "rgba(255,255,255,0.06)",
    chipActive: "#FFFFFF",
    chipActiveInk: "#0A0A0A",
    overlayBg:  "rgba(0,0,0,0.7)",
    skeleton:   "rgba(255,255,255,0.06)",
    headerHaze: "rgba(10,10,11,0.78)",
  },
};

// Build the inline `style` object for the wrapper. We expose every
// token as `--gi-*` so children can read them with `var(--gi-text)`
// inside Tailwind arbitrary values: e.g. `text-[color:var(--gi-text)]`.
export function styleFromTokens(theme) {
  const t = TOKENS[theme] || TOKENS.dark;
  const vars = {};
  for (const [k, v] of Object.entries(t)) {
    vars["--gi-" + camelToKebab(k)] = v;
  }
  vars.backgroundColor = "var(--gi-bg)";
  vars.color = "var(--gi-text)";
  return vars;
}

function camelToKebab(s) {
  return s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

// Resolve initial theme: persisted choice → system preference → dark.
export function resolveInitialTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = window.localStorage.getItem("gi:theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch { /* localStorage may be blocked */ }
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

export function persistTheme(theme) {
  try { window.localStorage.setItem("gi:theme", theme); } catch { /* ignore */ }
}
