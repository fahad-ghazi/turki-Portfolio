import React, {
  useState, useRef, useCallback, useEffect, useMemo,
} from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
} from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Picture from "@/components/brand/Picture";
import { useLang } from "@/lib/LanguageContext";
import { CATEGORIES } from "../feed/categoriesData";

// ── Physics ────────────────────────────────────────────────────────
const SWIPE_THRESHOLD = 90;
const SPRING = { type: "spring", stiffness: 280, damping: 28, mass: 0.8 };
const TRANSITION_MS = 420;
const MYSTERY_EVERY = 7;          // inject 1 mystery card after every N work cards
const MAX_PER_CAT_ALL = 10;       // max items per category in "all works" mode

// ── Filter config ──────────────────────────────────────────────────
const FILTERS = [
  { id: "all",            ar: "كل الأعمال",       en: "All Works"          },
  { id: "commercial-ads", ar: "إعلانات تجارية",   en: "Commercial Ads"     },
  { id: "ai-fashion",     ar: "أزياء وافتتاحيات", en: "Fashion Editorials" },
  { id: "heritage",       ar: "تراث وذاكرة",       en: "Heritage"           },
  { id: "real-estate",    ar: "عقار",              en: "Real Estate"        },
];

// ── Deck builder ───────────────────────────────────────────────────
// Produces a flat array of card objects, with mystery cards injected
// every MYSTERY_EVERY positions. Mystery pool = items that don't
// appear in the main deck (overflow from matched category or items
// from non-matched categories).
function buildDeck(filterId) {
  const mainItems  = [];
  const mysteryPool = [];

  for (const cat of CATEGORIES) {
    if (!cat.items?.length) continue;
    const isMatch = filterId === "all" || cat.id === filterId;
    const tagged  = cat.items.map((item) => ({
      ...item,
      cardType: "work",
      catId: cat.id,
      catAr: cat.title,
      catEn: cat.titleEn,
    }));

    if (isMatch) {
      const take = filterId === "all" ? MAX_PER_CAT_ALL : tagged.length;
      mainItems.push(...tagged.slice(0, take));
      // overflow → mystery pool
      mysteryPool.push(
        ...tagged.slice(take).map((i) => ({ ...i, cardType: "mystery" })),
      );
    } else {
      // non-matching categories → mystery pool (up to 3 each)
      mysteryPool.push(
        ...tagged.slice(0, 3).map((i) => ({ ...i, cardType: "mystery" })),
      );
    }
  }

  // Shuffle mystery pool so repeated visits feel different
  const pool = [...mysteryPool].sort(() => Math.random() - 0.5);
  let mIdx = 0;

  const deck = [];
  for (let i = 0; i < mainItems.length; i++) {
    deck.push(mainItems[i]);
    const isBreakpoint = (i + 1) % MYSTERY_EVERY === 0;
    const notLast      = i < mainItems.length - 1;
    if (isBreakpoint && notLast && mIdx < pool.length) {
      deck.push({ ...pool[mIdx++], id: `mystery-${i}`, cardType: "mystery" });
    }
  }
  return deck;
}

// ── Intent Filter ──────────────────────────────────────────────────
// Layer 1: user picks a direction before any card is shown.
// Dark cinematic screen so the transition to the light swipe UI
// feels like "opening a door".
function IntentFilter({ isAr, onSelect, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ background: "#0C0C0C" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
    >
      {/* Close */}
      <div className="px-6 pt-14 pb-4">
        <motion.button
          onClick={onClose}
          whileTap={{ scale: 0.95 }}
          className="h-11 w-11 flex items-center justify-center rounded-full"
          style={{
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(245,241,232,0.55)",
          }}
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 pb-16"
        dir={isAr ? "rtl" : "ltr"}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="font-cinzel text-[10px] tracking-[0.35em] mb-4"
          style={{ color: "#C9A961" }}
        >
          {isAr ? "استعرض الأعمال" : "BROWSE WORKS"}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="font-noto text-center mb-10"
          style={{
            color: "#F5F1E8",
            fontSize: "clamp(1.35rem, 4.5vw, 2rem)",
            lineHeight: 1.55,
          }}
        >
          {isAr ? "ماذا تبحث عن؟" : "What are you looking for?"}
        </motion.h2>

        <div className="flex flex-col gap-3 w-full max-w-[280px]">
          {FILTERS.map((f, i) => (
            <motion.button
              key={f.id}
              onClick={() => onSelect(f.id)}
              initial={{ opacity: 0, x: isAr ? 28 : -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.07, duration: 0.38 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full px-7 py-4 font-noto text-base text-right transition-all duration-200"
              style={
                f.id === "all"
                  ? {
                      background: "#C9A961",
                      color: "#0C0C0C",
                      fontWeight: 700,
                      border: "1px solid #C9A961",
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(245,241,232,0.76)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              {isAr ? f.ar : f.en}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ── Draggable wrapper ──────────────────────────────────────────────
// Handles the swipe gesture and calls onPhysicalSwipe(-1 | 1).
// Separating gesture from semantic direction lets the parent decide
// what "left" and "right" mean in the current language.
function DraggableWrapper({ onPhysicalSwipe, children }) {
  const x      = useMotionValue(0);
  const rotate  = useTransform(x, [-280, 280], [-18, 18]);
  const opacity = useTransform(x, [-220, -70, 0, 70, 220], [0.3, 1, 1, 1, 0.3]);
  const scale   = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const handleDragEnd = (_, info) => {
    const swipedLeft  = info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500;
    const swipedRight = info.offset.x >  SWIPE_THRESHOLD || info.velocity.x >  500;
    if (!swipedLeft && !swipedRight) return;
    onPhysicalSwipe(swipedLeft ? -1 : 1);
  };

  return (
    <motion.div
      style={{
        x, rotate, opacity, scale,
        touchAction: "pan-y",
        willChange: "transform",
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className="absolute inset-3 rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      {children}
    </motion.div>
  );
}

// ── Work Card — Layer 2 ────────────────────────────────────────────
// "النافذة + المشكلة أولاً":
//   • Card starts dark — description text centred on a dark overlay.
//   • A spotlight (radial-gradient) follows cursor/finger, revealing
//     the image beneath. Text fades once the user starts exploring.
//   • After reveal, title + category label appear at the bottom.
function WorkCard({ item, spotPos, spotTouched, isAr, onPhysicalSwipe }) {
  const text = isAr ? item.description : item.descriptionEn;

  const spotStyle = spotTouched
    ? {
        background: `radial-gradient(circle 140px at ${spotPos.x}% ${spotPos.y}%,
          rgba(0,0,0,0) 0%,
          rgba(0,0,0,0.52) 52%,
          rgba(0,0,0,0.88) 100%)`,
      }
    : { background: "rgba(0,0,0,0.72)" };

  return (
    <DraggableWrapper onPhysicalSwipe={onPhysicalSwipe}>
      {/* Full-res image behind everything */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <Picture
          src={item.src}
          alt={item.alt || ""}
          draggable={false}
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 768px) 96vw, 540px"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Spotlight overlay — pointer-events: none so drag still works */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{
          ...spotStyle,
          transition: "background 80ms linear",
        }}
      />

      {/* Description text — visible before first exploration */}
      <AnimatePresence>
        {!spotTouched && (
          <motion.div
            key="desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-9 pointer-events-none"
            dir={isAr ? "rtl" : "ltr"}
          >
            <p
              className="font-noto text-center text-[15px] leading-[1.85]"
              style={{
                color: "rgba(245,241,232,0.92)",
                textShadow: "0 2px 20px rgba(0,0,0,0.7)",
              }}
            >
              {text}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="font-cinzel text-[9px] tracking-[0.32em] mt-6"
              style={{ color: "rgba(201,169,97,0.6)" }}
            >
              {isAr ? "حرّك لتكتشف" : "EXPLORE"}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title + category — revealed after first touch/hover */}
      <AnimatePresence>
        {spotTouched && (
          <motion.div
            key="meta"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 right-0 px-6 pb-7 pointer-events-none rounded-b-3xl"
            dir={isAr ? "rtl" : "ltr"}
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
            }}
          >
            <p
              className="font-cinzel text-[9px] tracking-widest mb-1"
              style={{ color: "#C9A961" }}
            >
              {isAr ? item.catAr : item.catEn}
            </p>
            <p
              className="font-noto text-sm font-semibold"
              style={{ color: "#F5F1E8" }}
            >
              {item.title}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </DraggableWrapper>
  );
}

// ── Mystery Card — Layer 3 ─────────────────────────────────────────
// "الصندوق الأعمى": every MYSTERY_EVERY cards, a dark card teases a
// hidden work. The image is blurred behind a near-opaque overlay.
// Swiping reveals that the next card is the full-quality work.
function MysteryCard({ item, isAr, onPhysicalSwipe }) {
  return (
    <DraggableWrapper onPhysicalSwipe={onPhysicalSwipe}>
      {/* Blurred image — intentionally un-readable */}
      <div
        className="absolute inset-0 overflow-hidden rounded-3xl"
        style={{ filter: "blur(24px)", transform: "scale(1.1)" }}
      >
        <Picture
          src={item.src}
          alt=""
          draggable={false}
          loading="lazy"
          sizes="(max-width: 768px) 92vw, 512px"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 rounded-3xl" style={{ background: "rgba(12,12,12,0.80)" }} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-8 w-8 mb-5" style={{ color: "#C9A961" }} />
        </motion.div>

        <p
          className="font-cinzel text-sm tracking-[0.28em] mb-3"
          style={{ color: "#C9A961" }}
        >
          {isAr ? "عمل نادر" : "RARE WORK"}
        </p>
        <p
          className="font-noto text-xs"
          style={{ color: "rgba(245,241,232,0.38)" }}
        >
          {isAr ? "اسحب لتكتشف" : "Swipe to reveal"}
        </p>
      </div>
    </DraggableWrapper>
  );
}

// ── Main AllWorksMode ──────────────────────────────────────────────
export default function AllWorksMode({ onExit }) {
  const { isAr } = useLang();

  // ── State ──────────────────────────────────────────────────────
  const [phase, setPhase]           = useState("filter"); // "filter" | "swipe"
  const [filterId, setFilterId]     = useState("all");
  const [deck, setDeck]             = useState([]);
  const [index, setIndex]           = useState(0);
  const [exitDir, setExitDir]       = useState(-1);
  const [bounce, setBounce]         = useState(0);
  const [spotPos, setSpotPos]       = useState({ x: 50, y: 46 });
  const [spotTouched, setSpotTouched] = useState(false);

  const transitioningRef = useRef(false);
  const cardAreaRef      = useRef(null);

  // Lock the DualNav scroll container (same pattern as TinderMode)
  useEffect(() => {
    const container = document.querySelector('[data-scroll-container="dual-nav"]');
    if (!container) return;
    const savedOverflow  = container.style.overflowY;
    const savedScrollTop = container.scrollTop;
    container.style.overflowY = "hidden";
    return () => {
      container.style.overflowY = savedOverflow;
      container.scrollTop       = savedScrollTop;
    };
  }, []);

  // ── Filter selection ───────────────────────────────────────────
  const handleFilterSelect = useCallback((id) => {
    setFilterId(id);
    setDeck(buildDeck(id));
    setIndex(0);
    setSpotTouched(false);
    setPhase("swipe");
  }, []);

  // ── Bounce at boundaries ───────────────────────────────────────
  const triggerBounce = (dir) => {
    setBounce(dir);
    if (navigator.vibrate) navigator.vibrate(4);
    setTimeout(() => setBounce(0), 280);
  };

  // ── Swipe handler ──────────────────────────────────────────────
  // physicalDir: -1 = swiped left, 1 = swiped right.
  // In Arabic the "next" gesture is a left swipe; in English it's right.
  const handleSwipe = useCallback(
    (physicalDir) => {
      if (transitioningRef.current) return;
      const isNext = isAr ? physicalDir === -1 : physicalDir === 1;

      if (isNext) {
        if (index >= deck.length - 1) {
          onExit();
          return;
        }
        transitioningRef.current = true;
        setExitDir(physicalDir);
        setIndex((p) => p + 1);
        setSpotTouched(false);
      } else {
        if (index <= 0) {
          triggerBounce(-physicalDir);
          return;
        }
        transitioningRef.current = true;
        setExitDir(physicalDir);
        setIndex((p) => p - 1);
        setSpotTouched(false);
      }

      if (navigator.vibrate) navigator.vibrate(6);
      setTimeout(() => {
        transitioningRef.current = false;
      }, TRANSITION_MS);
    },
    [isAr, index, deck.length, onExit],
  );

  // ── Spotlight tracking (Layer 2 — النافذة) ───────────────────
  const handlePointerMove = useCallback(
    (e) => {
      if (phase !== "swipe" || !cardAreaRef.current) return;
      const rect = cardAreaRef.current.getBoundingClientRect();
      setSpotPos({
        x: ((e.clientX - rect.left)  / rect.width)  * 100,
        y: ((e.clientY - rect.top)   / rect.height) * 100,
      });
      if (!spotTouched) setSpotTouched(true);
    },
    [phase, spotTouched],
  );

  // ── Derived values ─────────────────────────────────────────────
  const currentCard  = deck[index];
  const nextCard     = deck[index + 1];
  const filterLabel  = useMemo(
    () => FILTERS.find((f) => f.id === filterId),
    [filterId],
  );

  // ── Render: intent filter ──────────────────────────────────────
  if (phase === "filter") {
    return (
      <AnimatePresence>
        <IntentFilter isAr={isAr} onSelect={handleFilterSelect} onClose={onExit} />
      </AnimatePresence>
    );
  }

  const isMystery = currentCard?.cardType === "mystery";

  // ── Render: swipe stage ────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#F5F1E8" }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 pt-14 pb-3 shrink-0">
        {/* Close */}
        <motion.button
          onClick={onExit}
          whileTap={{ scale: 0.95 }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1A1A1A]/25 bg-[#1A1A1A] text-[#F5F1E8] shadow-lg shadow-black/10 transition hover:border-[#C9A961] hover:text-[#C9A961]"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </motion.button>

        {/* Counter + active filter */}
        <div className="flex flex-col items-center gap-0.5">
          <span
            className="font-cinzel text-xs font-semibold"
            style={{ color: "rgba(15,15,15,0.78)" }}
          >
            {index + 1} / {deck.length}
          </span>
          {isMystery ? (
            <span className="font-cinzel text-[9px] tracking-widest" style={{ color: "#C9A961" }}>
              ✦
            </span>
          ) : (
            <span className="font-cinzel text-[9px] tracking-widest" style={{ color: "#C9A961" }}>
              {isAr ? filterLabel?.ar : filterLabel?.en}
            </span>
          )}
        </div>

        {/* Re-filter button */}
        <motion.button
          onClick={() => { setPhase("filter"); setSpotTouched(false); }}
          whileTap={{ scale: 0.95 }}
          className="font-cinzel text-[9px] tracking-widest px-4 py-2.5 rounded-full transition-all duration-200"
          style={{
            border: "1px solid rgba(201,169,97,0.35)",
            color: "rgba(201,169,97,0.78)",
          }}
        >
          {isAr ? "تغيير" : "FILTER"}
        </motion.button>
      </div>

      {/* ── Card area ── */}
      <div
        ref={cardAreaRef}
        className="relative flex-1 mx-1"
        onPointerMove={handlePointerMove}
      >
        {/* Background card — persistent mount, only the image cross-fades */}
        <motion.div
          className="absolute inset-3 rounded-3xl overflow-hidden pointer-events-none"
          animate={{
            scale:   nextCard ? 0.93 : 0.88,
            opacity: nextCard ? 0.28 : 0,
            y: 12,
          }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence initial={false}>
            {nextCard && (
              <motion.div
                key={`bg-${index + 1}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <Picture
                  src={nextCard.src}
                  alt=""
                  loading="lazy"
                  sizes="(max-width: 768px) 92vw, 512px"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/18" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Active card — AnimatePresence handles enter/exit */}
        <AnimatePresence custom={exitDir}>
          <motion.div
            key={index}
            className="absolute inset-0"
            custom={exitDir}
            initial={{ scale: 0.93, opacity: 0.85, y: 12 }}
            animate={{
              x:       bounce === -1 ? -22 : bounce === 1 ? 22 : 0,
              opacity: 1,
              scale:   1,
              y:       0,
            }}
            exit={{ x: exitDir * 340, opacity: 0, rotate: exitDir * 14, scale: 0.88 }}
            transition={SPRING}
          >
            {isMystery ? (
              <MysteryCard
                item={currentCard}
                isAr={isAr}
                onPhysicalSwipe={handleSwipe}
              />
            ) : (
              <WorkCard
                item={currentCard}
                spotPos={spotPos}
                spotTouched={spotTouched}
                isAr={isAr}
                onPhysicalSwipe={handleSwipe}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Progress pills ── */}
      {/* Mystery cards shown as slightly larger gold-tinted pills so
          the user can see the "surprise" rhythm in the timeline. */}
      <div className="shrink-0 px-6 pb-8 pt-3">
        <div className="flex gap-1.5 justify-center flex-wrap max-w-xs mx-auto">
          {deck.map((card, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === index
                  ? 26
                  : card.cardType === "mystery" ? 8 : 5,
                backgroundColor: i === index
                  ? "#C9A961"
                  : card.cardType === "mystery"
                    ? "rgba(201,169,97,0.38)"
                    : "rgba(26,26,26,0.14)",
              }}
              transition={{ duration: 0.35 }}
              style={{ height: "3px", borderRadius: "1.5px", flexShrink: 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
