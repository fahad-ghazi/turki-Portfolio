#!/usr/bin/env node
/**
 * Delete the 27 retired base images and ALL their generated variants
 * from the Cloudflare R2 `turkistudio-works` bucket.
 *
 * For every base path (e.g. `/works/fashion/f_043.jpg`) we delete:
 *   - the original                                    f_043.jpg
 *   - 3 formats × 4 widths = 12 variants:
 *       f_043-480w.{avif,webp,jpg}
 *       f_043-960w.{avif,webp,jpg}
 *       f_043-1200w.{avif,webp,jpg} *
 *       f_043-1920w.{avif,webp,jpg} *
 *   * not every variant exists for every image — the build pipeline
 *     skips widths above the source width. We try them all and ignore
 *     "not found" errors.
 *
 * No R2 credentials live in this script. Source the user's env:
 *     source ~/.claude/.env  &&  node web/tools/delete-from-r2.mjs
 *
 * Required env vars:
 *     CLOUDFLARE_API_TOKEN   (R2 Object Read+Write scope)
 *     CLOUDFLARE_ACCOUNT_ID
 *
 * Dry-run (default): logs what WOULD be deleted, deletes nothing.
 * Real run:          add `--apply`.
 */
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const BUCKET = "turkistudio-works";

if (!ACCOUNT_ID || !TOKEN) {
  console.error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN.");
  console.error("Try:  source ~/.claude/.env  &&  node web/tools/delete-from-r2.mjs");
  process.exit(1);
}

const APPLY = process.argv.includes("--apply");

// Same widths the build:images pipeline produces. The script tries each
// — non-existent variants come back as 404 from R2, which we ignore.
const WIDTHS = [480, 960, 1200, 1440, 1920];
const FORMATS = ["avif", "webp", "jpg"];

// 47 base images to retire (27 from the user's first list + 20 flagged
// as low-quality / panoramic-low-res / overexposed). Paths are
// RELATIVE to the bucket root — R2 keys are `works/...` (no leading
// slash).
const BASES = [
  // --- Round 1: user-provided list (27) ---
  "works/fashion/f_043.jpg",
  "works/fashion/f_042.jpg",
  "works/hero-poster.jpg",
  "works/poster_01_saudi_joker.jpg",
  "works/poster_05_disorders.jpg",
  "works/fashion/f_044.jpg",
  "works/fashion/f_045.jpg",
  "works/banners/films.jpg",
  "works/poster_09_generations.jpg",
  "works/ads/a_053.jpg",
  "works/fashion/f_100.jpg",
  "works/fashion/f_098.jpg",
  "works/banners/ads.jpg",
  "works/ads/a_068.jpg",
  "works/realestate/r_009.jpg",
  "works/ads/a_015.jpg",
  "works/fashion/f_099.jpg",
  "works/realestate/r_028.jpg",
  "works/realestate/r_023.jpg",
  "works/realestate/r_018.jpg",
  "works/fashion/f_105.jpg",
  "works/fashion/f_102.jpg",
  "works/fashion/f_015.jpg",
  "works/banners/trained.jpg",
  "works/realestate/r_025.jpg",
  "works/fashion/f_040.jpg",
  "works/banners/studies.jpg",
  // --- Round 2: low-quality detection (20) ---
  // Panoramic 1200x510 (severity-3): 6 heritage + 9 realestate + 2 ads
  "works/heritage/h_010.jpg",
  "works/heritage/h_011.jpg",
  "works/heritage/h_014.jpg",
  "works/heritage/h_015.jpg",
  "works/heritage/h_016.jpg",
  "works/heritage/h_017.jpg",
  "works/realestate/r_003.jpg",
  "works/realestate/r_006.jpg",
  "works/realestate/r_021.jpg",
  "works/realestate/r_022.jpg",
  "works/realestate/r_024.jpg",
  "works/realestate/r_026.jpg",
  "works/realestate/r_027.jpg",
  "works/realestate/r_029.jpg",
  "works/realestate/r_030.jpg",
  "works/ads/a_059.jpg",
  "works/ads/a_060.jpg",
  // Overexposed
  "works/fashion/f_156.jpg",
  // Posters: low-res or washed-out
  "works/poster_06_saudi_harley.jpg",
  "works/poster_07_glasses_cinematic.jpg",
];

function variantKeysFor(basePath) {
  // basePath: "works/fashion/f_043.jpg"
  const ext = basePath.match(/\.(jpe?g|png)$/i)?.[0];
  if (!ext) return [basePath];
  const stem = basePath.slice(0, -ext.length);
  const keys = [basePath];
  for (const w of WIDTHS) {
    for (const f of FORMATS) {
      keys.push(`${stem}-${w}w.${f === "jpg" ? "jpg" : f}`);
    }
  }
  return keys;
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    // Cloudflare R2 accepts API token for both AccessKeyId and SecretAccessKey
    // when using the S3-compatible endpoint.
    accessKeyId: TOKEN,
    secretAccessKey: TOKEN,
  },
});

async function deleteOne(key) {
  if (!APPLY) return { key, status: "DRY" };
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return { key, status: "OK" };
  } catch (e) {
    // Treat 404 as success — nothing to delete is a perfectly fine outcome.
    if (e.$metadata?.httpStatusCode === 404 || e.name === "NoSuchKey") {
      return { key, status: "404" };
    }
    return { key, status: "ERR", error: e.message };
  }
}

async function run() {
  const allKeys = BASES.flatMap(variantKeysFor);
  console.log(
    `${APPLY ? "DELETING" : "DRY-RUN"}: ${BASES.length} base images, ${allKeys.length} total objects`,
  );
  if (!APPLY) {
    console.log("Add --apply to actually delete.\n");
  }

  let ok = 0, missing = 0, err = 0;
  // Modest concurrency — R2 handles it fine but no need to hammer.
  const CONCURRENCY = 8;
  for (let i = 0; i < allKeys.length; i += CONCURRENCY) {
    const batch = allKeys.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(deleteOne));
    for (const r of results) {
      if (r.status === "OK") ok++;
      else if (r.status === "404") missing++;
      else if (r.status === "ERR") {
        err++;
        console.error(`  ERR ${r.key}: ${r.error}`);
      }
      if (!APPLY) console.log(`  would delete: ${r.key}`);
    }
  }

  console.log(
    `\nDone. ${APPLY ? `deleted=${ok} already_gone=${missing} errors=${err}` : `would_attempt=${allKeys.length}`}`,
  );
}

run().catch((e) => { console.error(e); process.exit(1); });
