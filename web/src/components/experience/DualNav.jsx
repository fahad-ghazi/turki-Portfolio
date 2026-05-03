import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TikTokSection from "./TikTokSection";
import TinderMode from "./TinderMode";
import AllWorksMode from "./AllWorksMode";
import HeroFeedItem from "./HeroFeedItem";
import MicroContext from "./MicroContext";
import FinalSlide from "./FinalSlide";
import { CATEGORIES } from "../feed/categoriesData";

const SECTION_ORDER = { films: 0 };

// Sort categories with films first, then by their original order in CATEGORIES.
// Audit issue #2: the prior version pulled AnalyticsEvent.list straight from
// the homepage to weight ranking — that read uses the public path and would
// have either returned [] (since AnalyticsEvent isn't a public-list entity)
// or, if it ever became one, leaked analytics to anonymous visitors. Until
// we add a server-computed `/api/popular-projects` endpoint, sort is static.
const sortCategoriesStatic = () =>
  CATEGORIES.map((category, index) => ({ ...category, originalIndex: index })).sort(
    (a, b) =>
      ((SECTION_ORDER[a.id] ?? 10) - (SECTION_ORDER[b.id] ?? 10)) ||
      (a.originalIndex - b.originalIndex),
  );

export default function DualNav() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(null); // null = TikTok mode
  const [allWorksOpen, setAllWorksOpen] = useState(false);
  const orderedCategories = useMemo(() => sortCategoriesStatic(), []);
  const containerRef = useRef(null);
  const slides = 1 + 1 + orderedCategories.length + 1;

  // ── Scroll synchronisation ────────────────────────────────────────
  // Audit findings #1, #2, #3:
  //   - State used to lag behind scroll (no listener for native scroll).
  //   - The old wheel handler called preventDefault while scroll-snap
  //     was also active → trackpad rubberband + slide overshoot.
  //   - 750ms throttle dropped legitimate fast scrolls.
  // New design: pure CSS scroll-snap (browser does the right thing on
  // every input device), and an IntersectionObserver tells us which
  // slide is currently >50% visible so isActive is always truthful.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const slideEls = Array.from(container.children);
    if (slideEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with the highest intersection ratio currently in view.
        let best = null;
        for (const entry of entries) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
        if (best && best.intersectionRatio >= 0.55) {
          const idx = slideEls.indexOf(best.target);
          if (idx !== -1) setCurrentSlide(idx);
        }
      },
      {
        root: container,
        threshold: [0.2, 0.55, 0.85],
      },
    );

    slideEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [orderedCategories.length]);

  const goTo = useCallback(
    (index) => {
      const clamped = Math.max(0, Math.min(slides - 1, index));
      const el = containerRef.current?.children[clamped];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [slides],
  );

  // Keyboard navigation only — wheel + touch are handled natively
  // by scroll-snap, which behaves correctly on every input device.
  useEffect(() => {
    const onKey = (e) => {
      if (activeCategoryIndex !== null) {
        if (e.key === "Escape") setActiveCategoryIndex(null);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goTo(currentSlide + 1);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goTo(currentSlide - 1);
      }
      if (e.key === "Home") goTo(0);
      if (e.key === "End") goTo(slides - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSlide, goTo, activeCategoryIndex, slides]);

  const handleEnterCategory = (catIndex) => {
    const category = orderedCategories[catIndex];
    if (["films", "trained-models"].includes(category?.id)) {
      navigate(category.slug);
      return;
    }
    setActiveCategoryIndex(catIndex);
  };
  const handleExitCategory = () => setActiveCategoryIndex(null);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F5F1E8]">
      {/* SR-only indexable description for crawlers — the cinematic
          experience itself is JS-driven so search engines need this
          static block to understand what the page is about. Invisible
          to sighted users; kept after the TopNav was removed because
          it serves SEO, not UX. */}
      <div className="sr-only">
        <h1>تركي غازي — مصمم بصري بالذكاء الاصطناعي | Turki Studio</h1>
        <p>
          تركي استديو بقيادة تركي غازي يصمم محتوى بصري سينمائي للعلامات
          التجارية في السعودية والخليج باستخدام الذكاء الاصطناعي. نقدّم
          إعلانات تجارية، أزياء editorial، تصورات عقارية ومعمارية، محتوى
          تراثي سعودي، وأفلاماً قصيرة سينمائية، إضافة إلى شخصيات بصرية
          مدرّبة بهوية ثابتة عبر الحملات.
        </p>
        <ul>
          <li><a href="/services">قائمة الخدمات</a></li>
          <li><a href="/commercial-ads">إعلانات تجارية</a></li>
          <li><a href="/ai-fashion">أزياء بالذكاء الاصطناعي</a></li>
          <li><a href="/real-estate">تصورات عقارية</a></li>
          <li><a href="/heritage">تراث بصري</a></li>
          <li><a href="/films">أفلام قصيرة</a></li>
          <li><a href="/trained-models">شخصيات مدرّبة</a></li>
          <li><a href="/cv">السيرة الذاتية</a></li>
          <li><a href="/booking">احجز مشروع</a></li>
          <li><a href="/contact">تواصل</a></li>
        </ul>
      </div>

      {/* ── TikTok vertical feed ── */}
      <div
        ref={containerRef}
        data-scroll-container="dual-nav"
        className="w-full h-full"
        style={{
          overflowY: activeCategoryIndex !== null ? "hidden" : "scroll",
          // Audit #2: pure scroll-snap. No JS interception; the browser
          // handles trackpad inertia, touch flicks, and mouse wheel
          // correctly on its own.
          scrollSnapType: "y mandatory",
          // Audit #7: "always" forced a stop at every snap point, which
          // killed fast multi-slide flicks on mobile. "normal" lets a
          // strong gesture skip past intermediate snap points.
          scrollSnapStop: "normal",
          // iOS smooth momentum
          WebkitOverflowScrolling: "touch",
          // Disable elastic bounce at top/bottom on iOS so partial
          // scrolls don't leave the user mid-slide.
          overscrollBehaviorY: "contain",
        }}
      >
        {/* Hero slide — index 0 */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start" }}>
          <HeroFeedItem
            isActive={currentSlide === 0 && activeCategoryIndex === null}
            onEnter={() => setAllWorksOpen(true)}
            totalSlides={slides}
            currentSlide={currentSlide}
          />
        </div>

        {/* Micro context — index 1 */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start" }}>
          <MicroContext isActive={currentSlide === 1 && activeCategoryIndex === null} />
        </div>

        {/* Category slides — index 2..N+1 */}
        {orderedCategories.map((cat, i) => (
          <div key={cat.id} style={{ height: "100dvh", scrollSnapAlign: "start" }}>
            <TikTokSection
              category={cat}
              isActive={i + 2 === currentSlide && activeCategoryIndex === null}
              onEnter={() => handleEnterCategory(i)}
            />
          </div>
        ))}

        {/* Final slide — last index */}
        <div style={{ height: "100dvh", scrollSnapAlign: "start" }}>
          <FinalSlide isActive={currentSlide === slides - 1 && activeCategoryIndex === null} />
        </div>
      </div>

      {/* Vertical progress dots */}
      {activeCategoryIndex === null && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
          {Array.from({ length: slides }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 focus:outline-none"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className="rounded-full transition-all duration-300"
                style={{
                  width: "5px",
                  height: i === currentSlide ? "22px" : "5px",
                  backgroundColor: i === currentSlide ? "#C9A961" : "rgba(26,26,26,0.18)",
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* ── AllWorks overlay — hero "استعرض الأعمال" entry ── */}
      <AnimatePresence>
        {allWorksOpen && (
          <motion.div
            key="all-works"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40"
          >
            <AllWorksMode onExit={() => setAllWorksOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tinder overlay — per-category cinematic entry ── */}
      <AnimatePresence>
        {activeCategoryIndex !== null && (
          <motion.div
            key="tinder"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40"
          >
            <TinderMode
              category={orderedCategories[activeCategoryIndex]}
              onExit={handleExitCategory}
              onNextCategory={() => {
                const nextCatIndex = activeCategoryIndex + 1;
                if (nextCatIndex < orderedCategories.length) {
                  setActiveCategoryIndex(nextCatIndex);
                } else {
                  handleExitCategory();
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
