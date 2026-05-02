import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("ar"); // "ar" | "en"
  const toggle = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  return (
    <LanguageContext.Provider value={{ lang, toggle, isAr: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}