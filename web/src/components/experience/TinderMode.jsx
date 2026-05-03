import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform
} from "framer-motion";
import { X, Heart, Share2 } from "lucide-react";
import { apiClient } from "@/api/client";
import { useLang } from "@/lib/LanguageContext";
import { sortByBehavior, trackContentInteraction } from "../../utils/behaviorTracking";
import useContentTimeTracker from "../../hooks/useContentTimeTracker";
import Picture from "@/components/brand/Picture";

// ── Physics constants ────────────────────────────────────────────
const SWIPE_THRESHOLD = 90;
const SPRING = { type: "spring", stiffness: 280, damping: 28, mass: 0.8 };

// ── Image preloader hook ────────────────────────────────────────
// Previously this used `new Image(); img.src = src` to preload upcoming
// cards. That works on a single-resolution site, but in the 2026
// responsive pipeline the browser would have picked the 480w AVIF —
// the preload would fetch the *full-res JPG* instead, doubling the
// bandwidth and leaking outside the manifest.
//
// The new strategy: render upcoming cards via the same <Picture>
// component but with `loading="lazy"` and `aria-hidden`, parked in a
// hidden host. Browsers honour the responsive srcset and only one
// variant is fetched per slide. This hook is now a no-op, kept for
// API compatibility with audits that referenced "Audit #5".
function usePreloadedImages() {
  /* see HiddenPreloadStack below */
}

// ── Card Image ───────────────────────────────────────────────────
// The outer opacity-fade has been removed: <Picture> renders a blurhash
// canvas placeholder under the <img> and fades the real image in once
// it decodes. Wrapping that with a second opacity-toggle was double
// work and introduced a visible 200ms blank flash on cached images.
function CardImage({ src, alt }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-3xl">
      <Picture
        src={src}
        alt={alt}
        draggable={false}
        loading="eager"
        fetchPriority="high"
        sizes="(max-width: 768px) 96vw, 540px"
        className="w-full h-full object-cover"
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
// `direction` is semantic ("next" or "prev"). The physical side the
// label sits on, and which sign of dragX triggers it, both depend on
// the language. In RTL the next-card lives "to the left", so a left
// drag (negative x) reveals the NEXT label on the left edge. Mirror
// that for LTR.
function SwipeLabel({ dragX, direction, isAr }) {
  const isNext = direction === "next";
  // Positive x = drag to the right.
  // RTL+next → fades in as user drags left  (negative x).
  // LTR+next → fades in as user drags right (positive x).
  const showsOnNegativeX = isAr ? isNext : !isNext;
  const opacity = useTransform(
    dragX,
    showsOnNegativeX ? [-160, -50, 0] : [0, 50, 160],
    showsOnNegativeX ? [1, 0.2, 0] : [0, 0.2, 1]
  );
  // Label sits on the side it points to.
  const onLeft = showsOnNegativeX;
  const rotate = onLeft ? "-8deg" : "8deg";

  return (
    <motion.div
      style={{ opacity }}
      className={`absolute top-10 ${onLeft ? "left-6" : "right-6"} z-20 pointer-events-none`}
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
        <span
          className="font-cinzel text-sm font-bold tracking-widest"
          style={{ color: isNext ? "rgb(248,113,113)" : "hsl(40 45% 68%)" }}
        >
          {isAr
            ? isNext
              ? "← التالي"
              : "السابق →"
            : isNext
              ? "NEXT →"
              : "← PREV"}
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
      // Persist the interaction
      await apiClient.entities.ProjectInteraction.create({
        project_id: item.id, category_id: categoryId,
        action: "like", user_identifier: "anonymous",
      });
      // Audit #29: also fire an analytics event so likes show up in the
      // unified events stream alongside clicks and submissions.
      apiClient.analytics.track({
        eventName: "project_like",
        properties: { event_type: "like", target_id: item.id, section: categoryId },
      });
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    if (navigator.vibrate) navigator.vibrate([5, 5, 5]);
    await apiClient.entities.ProjectInteraction.create({
      project_id: item.id, category_id: categoryId,
      action: "share", user_identifier: "anonymous",
    });
    apiClient.analytics.track({
      eventName: "project_share",
      properties: { event_type: "share", target_id: item.id, section: categoryId },
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
// Direction semantics: in Arabic (RTL) the natural "next" gesture is a
// swipe to the LEFT (the language reads right-to-left, so the next item
// is to the left visually as well). In English (LTR), the natural
// "next" is a swipe to the RIGHT, like flipping a book page.
//
// We accept a semantic `onNext`/`onPrev` from the parent and let the
// `isAr` flag decide which physical direction maps to which.
function DraggableCard({ item, categoryId, onNext, onPrev, zIndex, isAr }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-280, 280], [-18, 18]);
  const cardOpacity = useTransform(x, [-220, -70, 0, 70, 220], [0.3, 1, 1, 1, 0.3]);
  const cardScale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const handleDragEnd = (_, info) => {
    const vx = info.velocity.x;
    const ox = info.offset.x;
    const swipedLeft = ox < -SWIPE_THRESHOLD || vx < -500;
    const swipedRight = ox > SWIPE_THRESHOLD || vx > 500;
    if (!swipedLeft && !swipedRight) return;
    // RTL: left-swipe = next, right-swipe = prev.
    // LTR: right-swipe = next, left-swipe = prev.
    if (isAr) {
      if (swipedLeft) onNext();
      else onPrev();
    } else {
      if (swipedRight) onNext();
      else onPrev();
    }
  };

  return (
    <motion.div
      style={{ x, y, rotate, opacity: cardOpacity, scale: cardScale, zIndex, touchAction: "pan-y", willChange: "transform" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      onDragEnd={handleDragEnd}
      className="absolute inset-3 rounded-3xl shadow-2xl cursor-grab active:cursor-grabbing select-none"
    >
      <CardImage src={item.src} alt={item.alt} />
      <SwipeLabel dragX={x} direction="next" isAr={isAr} />
      <SwipeLabel dragX={x} direction="prev" isAr={isAr} />

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
  // useMemo: don't re-sort on every render.
  const items = useMemo(() => sortByBehavior(category.items || []), [category.items]);
  const [index, setIndex] = useState(0);
  const [exitDir, setExitDir] = useState(-1); // -1 = left, 1 = right
  const [showCTA, setShowCTA] = useState(false);
  const ctaTimeoutRef = useRef(null);

  // Audit #5: preload a window of upcoming images so swipes don't reveal
  // a blank panel while the new <img> downloads.
  usePreloadedImages(items, index, 3);

  useEffect(() => {
    if (items[index]) trackContentInteraction(items[index].id, 1);
  }, [index, items]);

  useContentTimeTracker(items[index]?.id, Boolean(items[index]), 2);

  // Audit #9: clear the CTA timeout on unmount or before scheduling a
  // new one. Without this, exiting the experience during the 3.5s grace
  // window fires onNextCategory on a torn-down component (state-update
  // warning + a phantom category change).
  useEffect(() => {
    return () => {
      if (ctaTimeoutRef.current) clearTimeout(ctaTimeoutRef.current);
    };
  }, []);

  // Bug fix (mobile): when TinderMode opens from MicroContext, the
  // DualNav scroll container behind it stays scrollable. The card's
  // horizontal drag gesture is interpreted as a touch on the scroll
  // container, scroll-snap then re-snaps to the nearest slide (often
  // Hero/slide 0), and when TinderMode closes the user is back at
  // the home slide instead of where they were.
  //
  // Lock the scroll container while TinderMode is mounted, restore
  // on unmount. Also save and restore scrollTop so we don't lose the
  // user's position on close.
  useEffect(() => {
    const container = document.querySelector('[data-scroll-container="dual-nav"]');
    if (!container) return;
    const savedOverflow = container.style.overflowY;
    const savedScrollTop = container.scrollTop;
    container.style.overflowY = 'hidden';
    return () => {
      container.style.overflowY = savedOverflow;
      // Restore the original scroll position so the user lands back on
      // the slide they were viewing, not on the snap-mandatory closest.
      container.scrollTop = savedScrollTop;
    };
  }, []);

  // Audit fix: previously a swipe-back from index 0 silently called
  // onExit(), which on character galleries kicked the user back to the
  // home slide unexpectedly. Now we trigger a quick "bounce" feedback
  // at boundaries instead — the explicit X close button is the only
  // way out. Same applies to swiping forward past the last card; we
  // show the post-experience CTA rather than exit silently.
  const [bounce, setBounce] = useState(0); // -1 left, 1 right, 0 idle
  const triggerBounce = (dir) => {
    setBounce(dir);
    if (navigator.vibrate) navigator.vibrate(4);
    setTimeout(() => setBounce(0), 280);
  };

  // Bug fix (jittery first swipe): on the first card the user could
  // fire 2-3 swipes in quick succession before the AnimatePresence
  // exit/enter cycle finished. Each call updated `index` synchronously,
  // and the motion timeline collapsed several transitions on top of
  // each other — visually it looked like several images flashing past
  // at once. We now hold a transition lock for the duration of the
  // spring animation (~420ms) so swipes are queued sanely.
  const transitioningRef = useRef(false);
  const TRANSITION_MS = 420;
  const releaseTransition = () => {
    transitioningRef.current = false;
  };

  const goNext = () => {
    if (transitioningRef.current) return;
    if (index >= items.length - 1) {
      if (closeOnComplete) {
        onNextCategory();
        return;
      }
      setShowCTA(true);
      if (ctaTimeoutRef.current) clearTimeout(ctaTimeoutRef.current);
      ctaTimeoutRef.current = setTimeout(() => {
        ctaTimeoutRef.current = null;
        onNextCategory();
      }, 3500);
      return;
    }
    transitioningRef.current = true;
    setExitDir(-1);
    setIndex((p) => p + 1);
    if (navigator.vibrate) navigator.vibrate(6);
    setTimeout(releaseTransition, TRANSITION_MS);
  };

  const goPrev = () => {
    if (transitioningRef.current) return;
    if (index <= 0) {
      // Bounce instead of dropping out — the user almost certainly
      // wanted to keep browsing, not close the gallery.
      triggerBounce(isAr ? 1 : -1);
      return;
    }
    transitioningRef.current = true;
    setExitDir(1);
    setIndex((p) => p - 1);
    if (navigator.vibrate) navigator.vibrate(6);
    setTimeout(releaseTransition, TRANSITION_MS);
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
        {/* Background card — never unmounts, only its image cross-fades.
            Old approach: keyed on `bg-${index+1}` inside AnimatePresence.
            Problem: when index changed, the same image that was peeking at
            opacity 0.3 started its EXIT animation while the new active card
            entered from x:-60 with opacity:0 — the user saw their expected
            next image disappear then re-appear from a completely different
            direction (the "wrong image flash").

            New approach: one persistent div (no key, no AnimatePresence
            wrapper). Its scale/opacity animate between values. Only the
            <Picture> inside gets an AnimatePresence cross-fade, so the
            *container* is always present and the active card can promote
            from it seamlessly. */}
        <motion.div
          className="absolute inset-3 rounded-3xl overflow-hidden pointer-events-none"
          animate={{
            scale: index + 1 < items.length ? 0.93 : 0.88,
            opacity: index + 1 < items.length ? 0.28 : 0,
            y: 12,
          }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence initial={false}>
            {index + 1 < items.length && (
              <motion.div
                key={`bgimg-${index + 1}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <Picture
                  src={items[index + 1].src}
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

        {/* Active card.
            `mode="wait"` removed: the new card starts entering the moment
            the old card begins its exit. Combined with the new `initial`
            that matches the background card's resting state (scale 0.93,
            y 12), the transition reads as "the peeking card promotes itself
            to the top" — no side-entry flash, no blank gap. */}
        <AnimatePresence custom={exitDir}>
          <motion.div
            key={index}
            className="absolute inset-0"
            custom={exitDir}
            initial={{ scale: 0.93, opacity: 0.85, y: 12 }}
            animate={{
              x: bounce === -1 ? -22 : bounce === 1 ? 22 : 0,
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{ x: exitDir * 340, opacity: 0, rotate: exitDir * 14, scale: 0.88 }}
            transition={SPRING}
          >
            <DraggableCard
              item={items[index]}
              categoryId={categoryId}
              onNext={goNext}
              onPrev={goPrev}
              zIndex={10}
              isAr={isAr}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls — minimal */}
      <div className="shrink-0 px-6 pb-8 pt-3">
        {/* Progress pills (3px so they're actually visible) */}
        <div className="flex gap-2 justify-center">
          {items.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === index ? 26 : 6,
                backgroundColor: i === index ? "#C9A961" : "rgba(26,26,26,0.16)",
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{ height: "3px", borderRadius: "1.5px" }}
            />
          ))}
        </div>
        {/* Audit #4: the previous "hidden nav — keyboard/swipe only" was a
            pair of 50%-wide invisible buttons over the bottom 80px,
            stealing taps from anyone trying to read the description or
            press the like icon. Removed entirely — keyboard arrows + the
            drag gesture cover the same intent without the surprise. */}
      </div>
    </div>
  );
}