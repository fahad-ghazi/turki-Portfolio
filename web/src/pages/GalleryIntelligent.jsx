import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Seo from "@/components/seo/Seo";
import GalleryHeader from "@/components/gallery/GalleryHeader";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryViewer from "@/components/gallery/GalleryViewer";
import {
  arrangeForView,
  filterByCollection,
  VIEW_MODES,
  COLLECTIONS,
} from "@/components/gallery/galleryAlgorithm";
import {
  TOKENS,
  styleFromTokens,
  resolveInitialTheme,
  persistTheme,
} from "@/components/gallery/galleryTheme";

/**
 * /gallery-intelligent — Arabic-first editorial gallery.
 *
 * What this page is:
 *   - RTL by default. Title is "عوالم تركي".
 *   - Two themes: warm cinematic light + true black dark. Toggle in
 *     header, persisted to localStorage, falls back to OS preference.
 *   - Reads only public/gallery-manifest.json (built by
 *     scripts/build-gallery-index.js) — no client-side analysis.
 *   - Curated view assigns items to Visual Chapters with Arabic
 *     headings (شخصيات / أزياء / سينمائي / إعلانات / تراث / معمار /
 *     أحمر / صحراء / ليل / هدوء / تجارب). Other views show a flat
 *     editorial masonry.
 *   - Typography: IBM Plex Sans Arabic, loaded via Helmet so it only
 *     ships on this route.
 *
 * URL params (shareable on WhatsApp, etc.):
 *   ?view=curated|by-color|by-brightness|by-mood|random
 *   ?collection=characters|fashion|ads|films|heritage|realestate|luxury|dark|red
 *   ?seed=<int>   for the random view
 *   ?item=<id>    opens the fullscreen viewer
 */
export default function GalleryIntelligent() {
  const [params, setParams] = useSearchParams();
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [openItem, setOpenItem] = useState(null);
  const [theme, setTheme] = useState(() => resolveInitialTheme());

  const view = validateOption(params.get("view"), VIEW_MODES, "curated");
  const collection = validateOption(params.get("collection"), COLLECTIONS, "all");
  const seed = Number(params.get("seed")) || 1729;

  useEffect(() => {
    let cancelled = false;
    fetch("/gallery-manifest.json", { cache: "force-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`gallery-manifest ${r.status}`);
        return r.json();
      })
      .then((m) => { if (!cancelled) setManifest(m); })
      .catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);

  const items = useMemo(() => {
    if (!manifest) return [];
    const filtered = filterByCollection(manifest.items, collection);
    return arrangeForView(filtered, view, seed);
  }, [manifest, collection, view, seed]);

  useEffect(() => {
    if (!manifest) return;
    const id = params.get("item");
    if (!id) { setOpenItem(null); return; }
    const found = manifest.items.find((x) => x.id === id);
    setOpenItem(found || null);
  }, [manifest, params]);

  const updateParam = useCallback((key, value) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all" || (key === "view" && value === "curated")) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setParams(next, { replace: false });
  }, [params, setParams]);

  const openIndex = useMemo(
    () => (openItem ? items.findIndex((x) => x.id === openItem.id) : -1),
    [openItem, items],
  );

  const onPrev = useCallback(() => {
    if (openIndex < 0) return;
    const next = items[(openIndex - 1 + items.length) % items.length];
    updateParam("item", next.id);
  }, [openIndex, items, updateParam]);

  const onNext = useCallback(() => {
    if (openIndex < 0) return;
    const next = items[(openIndex + 1) % items.length];
    updateParam("item", next.id);
  }, [openIndex, items, updateParam]);

  const onClose = useCallback(() => updateParam("item", null), [updateParam]);

  const onChangeTheme = useCallback((t) => {
    setTheme(t);
    persistTheme(t);
  }, []);

  const wrapperStyle = useMemo(() => ({
    ...styleFromTokens(theme),
    fontFamily:
      "'IBM Plex Sans Arabic', 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    transition: "background-color 320ms ease, color 320ms ease",
  }), [theme]);

  return (
    <div dir="rtl" data-theme={theme} className="min-h-screen" style={wrapperStyle}>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap"
        />
        <meta name="theme-color" content={TOKENS[theme].bg} />
      </Helmet>

      <Seo
        title="عوالم تركي"
        description="تجارب بصرية مولَّدة بالذكاء الاصطناعي — مُرتَّبة حسب اللون والضوء والمزاج."
        canonical="/gallery-intelligent"
        lang="ar"
      />

      <GalleryHeader
        view={view}
        collection={collection}
        count={items.length}
        theme={theme}
        onChangeTheme={onChangeTheme}
        onChangeView={(v) => updateParam("view", v)}
        onChangeCollection={(c) => updateParam("collection", c)}
      />

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-32 md:px-8">
        {error && (
          <p
            className="px-4 py-12 text-center text-sm"
            style={{ color: "var(--gi-text-muted)" }}
          >
            تعذّر تحميل بيانات المعرض.
          </p>
        )}

        {!error && !manifest && <GridSkeleton />}

        {manifest && items.length === 0 && (
          <p
            className="px-4 py-16 text-center text-sm"
            style={{ color: "var(--gi-text-muted)" }}
          >
            لا توجد أعمال تطابق هذا التصنيف بعد.
          </p>
        )}

        {manifest && items.length > 0 && (
          <GalleryGrid
            items={items}
            view={view}
            onOpen={(it) => updateParam("item", it.id)}
          />
        )}
      </main>

      {/* Footer — minimal, Arabic, brand-anchored */}
      <footer
        className="border-t px-6 py-12 text-center text-[12px] tracking-[0.22em]"
        style={{ borderColor: "var(--gi-border)", color: "var(--gi-text-subtle)" }}
      >
        تركي غازي · عوالم بصرية بالذكاء الاصطناعي
      </footer>

      {openItem && (
        <GalleryViewer
          item={openItem}
          onClose={onClose}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 px-2 md:grid-cols-6 md:gap-5">
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] animate-pulse rounded-[14px]"
          style={{ backgroundColor: "var(--gi-skeleton)" }}
        />
      ))}
    </div>
  );
}

function validateOption(value, options, fallback) {
  if (!value) return fallback;
  return options.some((o) => o.id === value) ? value : fallback;
}
