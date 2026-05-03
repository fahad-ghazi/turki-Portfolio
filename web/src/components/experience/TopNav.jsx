import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";

// Always-visible top navigation. Renders over the cinematic DualNav
// experience so users who don't realise the page is scroll-snapped
// (or who don't want the cinematic intro at all) still have an
// obvious path to: works, services, CV, booking.
//
// Visual treatment:
//   - Hero slide (currentSlide === 0): translucent black, gold accents
//   - Other slides: solid black for legibility over images
//
// On mobile we hide the secondary links and keep only the brand mark
// + the booking CTA — the primary cinematic experience still drives
// most of the viewport.

const ITEMS = [
  { to: "/services", label: { ar: "الخدمات", en: "Services" } },
  { to: "/films", label: { ar: "الأفلام", en: "Films" } },
  { to: "/cv", label: { ar: "السيرة", en: "CV" } },
];

export default function TopNav({ solid = false }) {
  const { isAr } = useLang();
  const [scrolled, setScrolled] = useState(solid);

  useEffect(() => {
    if (solid) return;
    setScrolled(false);
  }, [solid]);

  const surface = solid || scrolled
    ? "bg-[#1A1A1A]/92 backdrop-blur-md border-b border-[#C9A961]/22"
    : "bg-gradient-to-b from-[#1A1A1A]/55 via-[#1A1A1A]/22 to-transparent";

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 px-5 py-3 transition-colors duration-500 ${surface}`}
      aria-label={isAr ? "تنقل أساسي" : "Primary navigation"}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          to="/"
          className="font-cinzel text-[11px] tracking-[0.42em] text-[#F5F1E8] transition hover:text-[#C9A961]"
          aria-label="Turki Studio — home"
        >
          TURKI STUDIO
        </Link>

        <div className="hidden items-center gap-1.5 md:flex">
          {ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-3.5 py-1.5 font-noto text-sm font-medium text-[#F5F1E8]/85 transition hover:bg-[#C9A961]/14 hover:text-[#C9A961]"
            >
              {item.label[isAr ? "ar" : "en"]}
            </Link>
          ))}
        </div>

        <Link
          to="/booking"
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#C9A961] bg-[#C9A961] px-4 font-noto text-xs font-bold text-[#1A1A1A] transition hover:bg-[#F5F1E8] hover:text-[#1A1A1A] md:px-5 md:text-sm"
        >
          {isAr ? "احجز مشروع" : "Book project"}
        </Link>
      </div>
    </nav>
  );
}
