import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Linkedin, Mail } from "lucide-react";
import { trackEvent } from "@/utils/trackEvent";
import Picture from "@/components/brand/Picture";

const LINKEDIN_URL = import.meta.env?.VITE_LINKEDIN_URL || "";
const INSTAGRAM_URL = import.meta.env?.VITE_INSTAGRAM_URL || "";
const CONTACT_EMAIL = import.meta.env?.VITE_CONTACT_EMAIL || "contact@turkighazi.com";
import { Link } from "react-router-dom";
import { useLang } from "@/lib/LanguageContext";
import TGLogo from "@/components/brand/TGLogo";
import LanguageToggle from "@/components/brand/LanguageToggle";

const GOLD = "#C9A961";

export default function HeroFeedItem({ isActive, onEnter, totalSlides = 5, currentSlide = 0 }) {
  // Audit #6: dot count used to be hard-coded to 5, but the page actually
  // has 8-9 slides. DualNav now passes the real total + which slide is
  // current so the indicator stays honest.
  const TOTAL = totalSlides;
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAr } = useLang();

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F5F1E8]" dir={isAr ? "rtl" : "ltr"}>
      <div className="sr-only">
        <h1>{isAr ? "تركي غازي — مصمم ومبدع بصري بالذكاء الاصطناعي" : "Turki Ghazi — AI Visual Designer & Creative"}</h1>
        <p>{isAr ? "نصنع عوالم بصرية بالذكاء الاصطناعي تتجاوز الخيال." : "We craft AI visual worlds that transcend imagination."}</p>
      </div>

      {/* Background — Picture routes through R2 CDN + blurhash placeholder.
          Use w-full h-full (not absolute inset-0) on Picture so the <span>
          wrapper doesn't fight its own hardcoded `relative` class in Tailwind's
          cascade — `absolute` sorts before `relative` in the generated sheet
          so `relative` always wins, collapsing the span to 0px height on mobile. */}
      <div className="absolute inset-0 overflow-hidden">
        <Picture
          src="/works/hero-poster.jpg"
          alt="Turki Ghazi — AI Visual Designer"
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="w-full h-full object-cover object-top"
        />
      </div>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.34) 52%, rgba(0,0,0,0.62) 100%)" }}
      />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-7 pt-8">
        {/* Menu icon */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 0.78 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.25 }}
          onClick={() => setMenuOpen((open) => !open)}
          className="menu-icon absolute left-7 top-8 flex-col gap-[5px]"
          aria-label="القائمة"
        >
          <span className="icon-line w-5" />
          <span className="icon-line w-4" />
          <span className="icon-line w-5" />
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-7 top-20 z-30 min-w-48 rounded-2xl border border-[#C9A961]/35 bg-black/28 p-3 text-[#F5F1E8] backdrop-blur-md"
            >
              {/* Language toggle pinned at the top of the menu so it's
                  reachable from the hero without adding extra chrome. */}
              <div className="flex justify-center pb-2 pt-1">
                <LanguageToggle />
              </div>
              <div className="my-1 h-px bg-[#C9A961]/22" />
              {[
                ["/films", isAr ? "الأفلام" : "Films"],
                ["/ai-fashion", isAr ? "الأزياء" : "AI Fashion"],
                ["/commercial-ads", isAr ? "الإعلانات" : "Ads"],
                ["/trained-models", isAr ? "الشخصيات" : "Characters"],
                ["/booking", isAr ? "حجز مشروع" : "Booking"],
                ["/contact", isAr ? "تواصل" : "Contact"],
              ].map(([href, label]) => (
                <Link key={href} to={href} className="block rounded-xl px-4 py-3 font-noto text-sm text-[#F5F1E8] transition hover:bg-[#C9A961]/18 hover:text-[#C9A961]">
                  {label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* TG Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute right-6 top-7 flex flex-col items-end"
        >
          <TGLogo size="sm" />
        </motion.div>
      </div>

      {/* Social icons — only render real links; placeholders are hidden via env */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 0.65 }}
        className="absolute left-6 bottom-[31%] z-20 flex flex-col gap-4"
      >
        {LINKEDIN_URL && (
          <a
            className="social-icon"
            href={LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            onClick={() => trackEvent("social_click", { event_type: "share", target_id: "linkedin", section: "hero" })}
          >
            <Linkedin />
          </a>
        )}
        <Link
          className="social-icon"
          to="/booking"
          aria-label={isAr ? "احجز مشروع" : "Book a project"}
          onClick={() => trackEvent("booking_open_clicked", { event_type: "button_click", target_id: "hero_calendar", section: "hero" })}
        >
          <Calendar />
        </Link>
        <a
          className="social-icon"
          href={`mailto:${CONTACT_EMAIL}`}
          aria-label="Email"
          onClick={() => trackEvent("contact_email_clicked", { event_type: "button_click", target_id: "hero_email", section: "hero" })}
        >
          <Mail />
        </a>
      </motion.div>

      {/* Main Content — pb accounts for iOS safe-area-inset-bottom (notch/home bar) */}
      <div className="absolute bottom-0 left-0 right-0 px-8" style={{ paddingBottom: "calc(8rem + env(safe-area-inset-bottom, 0px))" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 12 : -12 }}
            animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: isAr ? 12 : -12 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-px w-8" style={{ background: GOLD }} />
            <span className="font-cinzel text-xs tracking-[0.36em] uppercase" style={{ color: GOLD }}>
              TURKI STUDIO
            </span>
          </motion.div>

          {/* Name */}
          <h1
            className="font-cormorant font-semibold leading-[0.92] mb-6"
            style={{
              fontSize: "clamp(3rem, 13vw, 5.5rem)",
              color: "#F5F1E8",
              letterSpacing: "-0.01em",
              textShadow: "0 4px 32px rgba(26,26,26,0.28)",
            }}
          >
            {isAr ? <>تركي<br />غازي</> : <>Turki<br />Ghazi</>}
          </h1>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px max-w-[3rem]" style={{ background: `linear-gradient(to ${isAr ? "left" : "right"}, ${GOLD}, transparent)` }} />
            <span className="font-noto text-xs font-light tracking-[0.2em]" style={{ color: "#F5F1E8" }}>
              {isAr ? "صانع أفكار" : "Idea Maker"}
            </span>
          </div>

          {/* Supporting tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-noto text-base font-normal mb-8 leading-8"
            style={{ color: "#F5F1E8", letterSpacing: "0.02em", textShadow: "0 3px 18px rgba(0,0,0,0.55)" }}
          >
            {isAr ? "أحول الأفكار إلى عوالم بصرية مدهشة بالذكاء الإصطناعي" : "I turn ideas into stunning visual worlds with AI"}
          </motion.p>


          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              onClick={onEnter}
              whileHover={{ boxShadow: `0 0 32px rgba(201,169,97,0.2)` }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-4 px-7 py-3.5 transition-all duration-500 font-cinzel text-xs tracking-[0.3em]"
              style={{
                border: "none",
                color: "#1A1A1A",
                background: "#F5F1E8",
                borderRadius: "999px",
              }}
            >
              <span>{isAr ? "استعرض الأعمال" : "View Work"}</span>
              <span style={{ color: "#1A1A1A", fontSize: "10px" }}>→</span>
            </motion.button>
            <Link to="/booking" className="rounded-full border border-[#F5F1E8]/55 bg-black/22 px-6 py-3.5 font-noto text-sm font-bold text-[#F5F1E8] backdrop-blur-sm transition hover:border-[#C9A961] hover:text-[#C9A961]">
              {isAr ? "احجز مشروع" : "Book Project"}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Side dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.8 }}
        className={`absolute ${isAr ? "right-5" : "left-5"} top-1/2 -translate-y-1/2 flex flex-col gap-2.5`}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div key={i} className="rounded-full transition-all duration-500" style={{
            width: "3px",
            height: i === currentSlide ? "20px" : "3px",
            backgroundColor: i === currentSlide ? GOLD : "rgba(255,255,255,0.38)",
          }} />
        ))}
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
      >
        <span className="font-noto text-[11px] font-light" style={{ color: "rgba(245,241,232,0.78)" }}>
          {isAr ? "اسحب للأسفل" : "Scroll Down"}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-12 w-px"
          style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }}
        >
          <span
            className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full"
            style={{ background: GOLD, boxShadow: "0 0 0 2px rgba(10,8,5,0.8), 0 0 0 3px rgba(201,169,97,0.55)" }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}