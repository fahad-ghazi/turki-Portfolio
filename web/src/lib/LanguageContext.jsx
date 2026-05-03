import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "turki_lang";
const DEFAULT_LANG = "ar";

const LanguageContext = createContext(null);

function readInitial() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    /* localStorage may be disabled in private mode — fall through */
  }
  // Auto-detect from browser as a one-time default. Saudi/Gulf locales
  // get Arabic, everyone else gets English. Sticky after first explicit
  // toggle so the user's choice always wins.
  try {
    const browserLang = (navigator.language || "ar").toLowerCase();
    if (browserLang.startsWith("ar")) return "ar";
    return "en";
  } catch {
    return DEFAULT_LANG;
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readInitial);

  // Persist + sync <html lang> + dir on every change so the doc itself
  // tells crawlers and screen readers what they're looking at.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* swallow storage errors */
    }
  }, [lang]);

  const toggle = useCallback(() => setLang((l) => (l === "ar" ? "en" : "ar")), []);
  const set = useCallback((next) => {
    if (next === "ar" || next === "en") setLang(next);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, set, toggle, isAr: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
