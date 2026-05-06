import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

/**
 * /gallery-intelligent — additive page. Reads only
 * public/gallery-manifest.json (built by web/scripts/build-gallery-index.js)
 * and renders an editorial, colour-aware view of every image already on
 * the site. The existing gallery routes are untouched.
 *
 * URL params (all shareable):
 *   ?view=curated|by-color|by-brightness|by-faces|by-mood|random
 *   ?collection=fashion|characters|ads|films|heritage|realestate|luxury|dark|warm|red|high-contrast
 *   ?seed=<int>   — random-mode seed, so a copied URL renders identically
 *   ?item=<id>    — opens the fullscreen viewer focused on that item
 */
export default function GalleryIntelligent() {
  const [params, setParams] = useSearchParams();
  const [manifest, setManifest] = useState(null);
  const [error, setError] = useState(null);
  const [openItem, setOpenItem] = useState(null);

  const view = validateOption(params.get("view"), VIEW_MODES, "curated");
  const collection = validateOption(params.get("collection"), COLLECTIONS, "all");
  const seed = Number(params.get("seed")) || 1729;

  // Load manifest once. We deliberately fetch from /gallery-manifest.json
  // (public/) instead of importing it so the JSON stays out of the JS
  // bundle and ships gzipped from the static host.
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

  // Deep-link to a specific item via ?item=…
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

  return (
    <div
      className="min-h-screen bg-[#0a0a0b] text-white selection:bg-white selection:text-black"
      style={{ fontFeatureSettings: "'ss01', 'ss02'" }}
    >
      <Seo
        title="AI Visual Worlds"
        description="An intelligent, colour-aware gallery of AI-generated visuals — sorted by light, contrast and mood."
        canonical="/gallery-intelligent"
        noIndex={true}
      />

      <GalleryHeader
        view={view}
        collection={collection}
        count={items.length}
        onChangeView={(v) => updateParam("view", v)}
        onChangeCollection={(c) => updateParam("collection", c)}
      />

      <main className="mx-auto w-full max-w-[1600px] px-3 pb-24 md:px-6">
        {error && (
          <p className="px-4 py-12 text-center text-sm text-white/50">
            Couldn’t load the gallery manifest. Run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5">
              node scripts/build-gallery-index.js
            </code>{" "}
            and reload.
          </p>
        )}

        {!error && !manifest && (
          <div className="grid grid-cols-2 gap-3 px-2 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-xl bg-white/5"
              />
            ))}
          </div>
        )}

        {manifest && items.length === 0 && (
          <p className="px-4 py-16 text-center text-sm text-white/45">
            No images match this collection yet.
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

function validateOption(value, options, fallback) {
  if (!value) return fallback;
  return options.some((o) => o.id === value) ? value : fallback;
}
