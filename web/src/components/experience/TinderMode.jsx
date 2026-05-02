import React, { useState, useEffect } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform
} from "framer-motion";
import { X, Heart, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useLang } from "@/lib/LanguageContext";
import { sortByBehavior, trackContentInteraction } from "../../utils/behaviorTracking";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";

// ── Physics constants ────────────────────────────────────────────
const SWIPE_THRESHOLD = 90;
const SPRING = { type: "spring", stiffness: 280, damping: 28, mass: 0.8 };

// ── Parallax Image ───────────────────────────────────────────────
function CardImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <img
        src={src} alt={alt} draggable={false}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {/* Bottom gradient for text readability only */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.20) 55%, rgba(0,0,0,0.45) 100%)" }}
      />
    </div>
  );
}

// ── Swipe Label ──────────────────────────────────────────────────
function SwipeLabel({ dragX, direction }) {
  const opacity = useTransform(
    dragX,
    direction === "next" ? [-160, -50, 0] : [0, 50, 160],
    direction === "next" ? [1, 0.2, 0] : [0, 0.2, 1]
  );
  const rotate = direction === "next" ? "8deg" : "-8deg";
  const isNext = direction === "next";

  return (
    <motion.div
      style={{ opacity }}
      className={`absolute top-10 ${isNext ? "right-6" : "left-6"} z-20 pointer-events-none`}
    >
      <div
        className="rounded-2xl px-4 py-2 border-2"
        style={{
          borderColor: isNext ? "rgba(248,113,113,0.8)" : "hsl(40 45% 58%)",
          transform: `rotate(${rotate})`,
          backdropFilter: "blur(4px)",
          background: isNext ? "rgba(248,113,113,0.08)" : "hsl(40 45% 58% / 0.08)",
        }}
      >
        <span className="font-cinzel text-sm font-bold tracking-widest"
          style={{ color: isNext ? "rgb(248,113,113)" : "hsl(40 45% 68%)" }}>
          {isNext ? "NEXT →" : "← PREV"}
        </span>
      </div>
    </motion.div>
  );
}

// ── Floating Action Buttons ──────────────────────────────────────
function ActionBar({ item, categoryId }) {
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate(8);
    const next = !liked;
    setLiked(next);
    if (next) {
      await base44.entities.ProjectInteraction.create({
        project_id: item.id, category_id: categoryId,
        action: "like", user_identifier: "anonymous",
      });
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate([5, 5, 5]);
    await base44.entities.ProjectInteraction.create({
      project_id: item.id, category_id: categoryId,
      action: "share", user_identifier: "anonymous",
    });
    if (navigator.share) {
      navigator.share({ title: item.title, text: item.description, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="flex items-center gap-6">
      {/* Like */}
      <motion.button
        onClick={handleLike}
        className="action-icon"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.18 }}
      >
        <Heart style={{ fill: liked ? "#C9A961" : "transparent" }} />
      </motion.button>

      {/* Share */}
      <motion.button
        onClick={handleShare}
        className="action-icon"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.18 }}
      >
        <Share2 />
      </motion.button>
    </div>
  );
}

// ── Card Content (language-aware) ────────────────────────────────
function CardContent({ item, categoryId }) {
  const { isAr } = useLang();
  return (
    <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 z-10" dir={isAr ? "rtl" : "ltr"}>
      {/* Floating action icons — top right corner of content area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        className="absolute bottom-8 right-6"
      >
        <ActionBar item={item} categoryId={categoryId} />
      </motion.div>


    </div>
  );
}

// ── Draggable Card ───────────────────────────────────────────────
function DraggableCard({ item, categoryId, onSwipeLeft, onSwipeRight, zIndex }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-280, 280], [-18, 18]);
  const cardOpacity = useTransform(x, [-220, -70, 0, 70, 220], [0.3, 1, 1, 1, 0.3]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const handleDragEnd = (_, info) => {
    const vx = info.velocity.x;
    const ox = info.offset.x;
    if (ox < -SWIPE_THRESHOLD || vx < -500) {
      onSwipeLeft();
    } else if (ox > SWIPE_THRESHOLD || vx > 500) {
      onSwipeRight();
    }
  };

  return (
    <motion.div
      style={{ x, y, rotate, opacity: cardOpacity, scale: cardScale, zIndex, touchAction: "none", willChange: "transform" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className="absolute inset-3 rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      <CardImage src={item.src} alt={item.alt} />
      <SwipeLabel dragX={x} direction="next" />
      <SwipeLabel dragX={x} direction="prev" />

      {/* Content */}
      <CardContent item={item} categoryId={categoryId} />
    </motion.div>
  );
}

// ── Post-Experience CTA ──────────────────────────────────────────
function PostCTA({ isAr, onExit }) {
  return (
    <AnimatePresence>
      <motion.div
        key="postcta"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 bottom-32 z-20 flex flex-col items-center gap-5 pointer-events-none"
        dir={isAr ? "rtl" : "ltr"}
      >
        <p className="font-noto text-xs font-light text-center" style={{ color: "rgba(245,241,232,0.75)", letterSpacing: "0.04em", textShadow: "0 2px 14px rgba(0,0,0,0.45)" }}>
          {isAr ? "هل هذا الأسلوب يناسب مشروعك؟" : "Does this style fit your project?"}
        </p>
        <motion.a
          href="mailto:contact@turkighazi.com"
          onClick={(e) => e.stopPropagation()}
          whileTap={{ scale: 0.97 }}
          whileHover={{ boxShadow: "0 0 28px rgba(201,169,97,0.25)" }}
          className="pointer-events-auto flex items-center gap-3 font-cinzel text-[10px] tracking-[0.35em] transition-all duration-400"
          style={{
            border: "1px solid #C9A961",
            color: "#C9A961",
            background: "rgba(0,0,0,0.18)",
            borderRadius: "999px",
            padding: "12px 28px",
          }}
        >
          {isAr ? "تواصل معي" : "Get in Touch"}
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main TinderMode ──────────────────────────────────────────────
export default function TinderMode({ category, onExit, onNextCategory, closeOnComplete = false }) {
  const { isAr } = useLang();
  const { titleEn, id: categoryId } = category;
  const items = sortByBehavior(category.items || []);
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(-1); // -1 = left, 1 = right
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (items[index]) trackContentInteraction(items[index].id, 1);
  }, [index, items]);

  useContentTimeTracker(items[index]?.id, Boolean(items[index]), 2);

  const goNext = () => {
    if (index >= items.length - 1) {
      if (closeOnComplete) {
        onNextCategory();
        return;
      }
      setShowCTA(true);
      setTimeout(() => onNextCategory(), 3500);
      return;
    }
    setExitDir(-1);
    setIndex((p) => p + 1);
    if (navigator.vibrate) navigator.vibrate(6);
  };

  const goPrev = () => {
    if (index <= 0) {
      onExit();
      return;
    }
    setExitDir(1);
    setIndex((p) => p - 1);
    if (navigator.vibrate) navigator.vibrate(6);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#F5F1E8" }}
    >
      {/* Top bar — minimal */}
      <div className="flex items-center justify-between px-6 pt-14 pb-3 shrink-0">
        <motion.button
          onClick={onExit}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#1A1A1A]/25 bg-[#1A1A1A] text-[#F5F1E8] shadow-lg shadow-black/10 transition hover:border-[#C9A961] hover:text-[#C9A961]"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </motion.button>
        <span
          className="font-cinzel text-xs font-semibold"
          style={{ color: "rgba(15,15,15,0.78)" }}
        >{index + 1} / {items.length}</span>
      </div>

      {/* Card stack */}
      <div className="relative flex-1 mx-1">
        {showCTA && <PostCTA isAr={isAr} onExit={onExit} />}
        {/* Background card (next item preview) */}
        {index + 1 < items.length && (
          <motion.div
            className="absolute inset-3 rounded-3xl overflow-hidden pointer-events-none"
            initial={{ scale: 0.9, opacity: 0.25 }}
            animate={{ scale: 0.93, opacity: 0.3, y: 12 }}
            transition={SPRING}
          >
            <img src={items[index + 1].src} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/18" />
          </motion.div>
        )}

        {/* Active card */}
        <AnimatePresence mode="wait" custom={exitDir}>
          <motion.div
            key={index}
            className="absolute inset-0"
            custom={exitDir}
            initial={{ x: exitDir * -60, opacity: 0, scale: 0.94 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: exitDir * 340, opacity: 0, rotate: exitDir * 14, scale: 0.88 }}
            transition={SPRING}
          >
            <DraggableCard
              item={items[index]}
              categoryId={categoryId}
              onSwipeLeft={goNext}
              onSwipeRight={goPrev}
              zIndex={10}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls — minimal */}
      <div className="shrink-0 px-6 pb-8 pt-3">
        {/* Progress pills */}
        <div className="flex gap-2 justify-center">
          {items.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === index ? 26 : 6,
                backgroundColor: i === index ? "#C9A961" : "rgba(26,26,26,0.16)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: "2px", borderRadius: "1px" }}
            />
          ))}
        </div>

        {/* Hidden nav — keyboard/swipe only */}
        <div className="absolute left-0 right-0 bottom-0 flex h-20 pointer-events-auto">
          <button onClick={goPrev} className="flex-1" style={{ background: "none", border: "none" }} />
          <button onClick={goNext} className="flex-1" style={{ background: "none", border: "none" }} />
        </div>
      </div>
    </div>
  );
}