#!/usr/bin/env node
/**
 * Fast R2 upload — uses CF REST API directly (no wrangler per file).
 *
 * PUT /accounts/{id}/r2/buckets/{bucket}/objects/{key}
 * Auth: Bearer CF_API_TOKEN   (same token as Cloudflare API, no S3 creds needed)
 *
 * Run:  CF_API_TOKEN=xxx CF_ACCOUNT_ID=yyy node tools/upload-to-r2.mjs
 */
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, "..", "public");
const ENV_PROD_PATH = path.resolve(__dirname, "..", ".env.production");

const BUCKET = "turkistudio-works";
const R2_PUBLIC_BASE = "https://r2.turkistudio.ai";
const CF_API = "https://api.cloudflare.com/client/v4";
const CONCURRENCY = 12;  // CF API stable limit; 40 caused ECONNRESET
const MAX_RETRIES = 3;
const RASTER_RE = /\.(jpe?g|png|avif|webp)$/i;

const MIME = {
  jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", avif: "image/avif", webp: "image/webp",
};

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN || !ACCOUNT) {
  console.error("❌  Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID");
  process.exit(1);
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && RASTER_RE.test(e.name)) yield full;
  }
}

function publicKey(filePath) {
  return path.relative(PUBLIC_ROOT, filePath).split(path.sep).join("/");
}

async function uploadOne(filePath, attempt = 0) {
  const key = publicKey(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const ct = MIME[ext] || "application/octet-stream";
  const body = await fs.readFile(filePath);
  const url = `${CF_API}/accounts/${ACCOUNT}/r2/buckets/${BUCKET}/objects/${encodeURIComponent(key).replace(/%2F/g, "/")}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": ct,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        return uploadOne(filePath, attempt + 1);
      }
      return { key, ok: false, err: `HTTP ${res.status} ${txt.slice(0, 80)}` };
    }
    return { key, ok: true };
  } catch (e) {
    if (attempt < MAX_RETRIES) {
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
      return uploadOne(filePath, attempt + 1);
    }
    return { key, ok: false, err: e.code || e.message?.slice(0, 80) };
  }
}

async function runPool(files) {
  let done = 0, failed = 0;
  let i = 0;

  async function worker() {
    while (i < files.length) {
      const file = files[i++];
      const result = await uploadOne(file);
      if (result.ok) {
        done++;
      } else {
        failed++;
        console.warn(`\n  ✗ ${result.key}: ${result.err}`);
      }
      process.stdout.write(
        `  ↑ ${done + failed}/${files.length} (${done} ok, ${failed} fail)\r`
      );
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return { done, failed };
}

async function main() {
  const files = [];
  for (const root of ["works", "brand"]) {
    const dir = path.join(PUBLIC_ROOT, root);
    try { await fs.access(dir); } catch { continue; }
    for await (const f of walk(dir)) files.push(f);
  }

  console.log(`\n📦 ${files.length} files → R2:${BUCKET}  (concurrency ${CONCURRENCY})\n`);
  const t0 = Date.now();
  const { done, failed } = await runPool(files);
  const sec = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\n✓ ${done} uploaded, ${failed} failed  in ${sec}s`);

  // Write VITE_R2_BASE to .env.production
  let envContent = "";
  try { envContent = await fs.readFile(ENV_PROD_PATH, "utf8"); } catch { /* new */ }
  if (!envContent.includes("VITE_R2_BASE")) {
    envContent += `\nVITE_R2_BASE=${R2_PUBLIC_BASE}\n`;
  } else {
    envContent = envContent.replace(/VITE_R2_BASE=.*/g, `VITE_R2_BASE=${R2_PUBLIC_BASE}`);
  }
  await fs.writeFile(ENV_PROD_PATH, envContent.trim() + "\n");
  console.log(`✓ .env.production → VITE_R2_BASE=${R2_PUBLIC_BASE}`);
  console.log(`\n🌐 CDN: ${R2_PUBLIC_BASE}\n`);
}

main().catch((e) => { console.error("✗", e); process.exit(1); });
