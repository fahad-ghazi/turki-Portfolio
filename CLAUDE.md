# CLAUDE.md — turki-Portfolio (turkistudio.ai)

> **اقرأ هذا الملف كاملاً قبل أي عملية نشر أو تعديل على البنية التحتية.**
> هذا الملف موجّه لأي وكيل Claude يعمل على هذا المشروع.

---

## 1. هيكل المشروع

```
turki-Portfolio/
├── web/                    ← Vite + React (الواجهة الأمامية)
│   ├── src/
│   ├── public/             ← ملفات ثابتة (بدون صور — موجودة على R2)
│   ├── tools/
│   │   ├── build-images.mjs    ← يولّد AVIF+WebP+JPG srcset لكل صورة
│   │   └── upload-to-r2.mjs    ← يرفع الصور لـ Cloudflare R2
│   ├── .env.production     ← VITE_R2_BASE=https://r2.turkistudio.ai
│   └── Dockerfile
├── api/                    ← Fastify + Prisma + Postgres (الـ backend)
│   └── Dockerfile
├── docs/
│   ├── DEPLOY.md           ← تعليمات النشر التفصيلية
│   └── STATUS.md           ← آخر حالة للمشروع
└── CLAUDE.md               ← هذا الملف
```

---

## 2. طريقة النشر

### البنية التحتية
- **السيرفر:** `204.168.178.180` — Dokploy
- **الـ repo:** `github.com/fahad-ghazi/turki-Portfolio`
- **Remote الصحيح:** `fahad` (SSH) — ليس `origin` (HTTPS)
- **SSH remote:** `git@github.com:fahad-ghazi/turki-Portfolio.git`

### الـ Services على Dokploy

| الـ Service | الـ Branch | الـ Domain |
|---|---|---|
| `turkistudio-frontend` | `main` (أو claude branch للاختبار) | `turkistudio.ai` |
| `turki-api` | `main` | `api.turkistudio.ai` |
| `turki-web-staging` | `claude/*` | (staging) |

### خطوات النشر الصحيحة

```
1. git add <files>
2. git commit -m "..."
3. git push fahad <branch>          ← SSH، لا HTTPS
4. Dokploy UI → الـ Service → Deploy يدوي
```

**⚠️ لا تستخدم `origin` للـ push** — هذا repo مختلف (turkig1101999-hue) وليس للنشر.

---

## 3. autoDeploy — القاعدة الذهبية

### الحالة الراهنة
**autoDeploy = OFF** على كل الـ services (16 app + 2 compose).
مدير السيرفر عطّلها يدوياً. **جميع النشرات يدوية من Dokploy UI.**

### متى يكون autoDeploy خطراً
- عند **force-push** على أي branch مربوط بـ Dokploy
- عند **git filter-repo** (يعيد كتابة التاريخ كله ويغيّر الـ SHAs)
- عند **push لـ commit ضخم** (صور، فيديو) — يملأ القرص

### القاعدة
```
قبل أي force-push أو filter-repo:
  1. تأكد أن autoDeploy = OFF في Dokploy
  2. لا تفعّل autoDeploy إلا بعد انتهاء كل العمليات
```

---

## 4. استراتيجية الصور — Cloudflare R2

### الملخص
**الصور ليست في git.** كل الصور تُخزّن في:
- **Bucket:** `turkistudio-works`
- **CDN:** `https://r2.turkistudio.ai`
- **Zone:** `turkistudio.ai` (zone ID: `20d7f931732e0b340fd052dd108134a2`)

### `.gitignore` — مسارات الصور محجوبة
```
public/works/    ← مُضاف للـ .gitignore
public/brand/    ← مُضاف للـ .gitignore
```
**لا تضف صور إلى git أبداً.** أي صورة جديدة تذهب مباشرة لـ R2.

### pipeline الصور (عند إضافة صور جديدة)
```bash
# 1. ضع الصور الأصلية في web/public/works/<category>/
# 2. ولّد النسخ المتعددة (AVIF + WebP + JPG × 3 أحجام)
cd web && npm run build:images

# 3. ارفع إلى R2
source ~/.claude/.env
node tools/upload-to-r2.mjs

# 4. commit الـ imageManifest.json فقط (ليس الصور)
git add src/lib/imageManifest.json
git commit -m "chore(images): update manifest for new works"
```

### كيف يعمل `<Picture>` في production
```jsx
// VITE_R2_BASE مُحقن وقت الـ build
// Picture.jsx يحوّل: /works/ads/a_001.jpg
// إلى: https://r2.turkistudio.ai/works/ads/a_001.jpg
// مع srcset AVIF → WebP → JPG × 480w/960w/1200w
// + blurhash placeholder يمنع مستطيل رمادي فارغ
```

### رفع صور جديدة إلى R2
```bash
source ~/.claude/.env
# متغيرات مطلوبة: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID
node web/tools/upload-to-r2.mjs
```
الـ script يرفع `web/public/works/` و `web/public/brand/` فقط.
CONCURRENCY=12 (لا ترفعه فوق 15 — الـ CF API يُعطي ECONNRESET).

---

## 5. تنظيف تاريخ git (filter-repo) — إجراء مرة واحدة

### السياق
الصور كانت في git قبل R2. تاريخ الـ repo لا يزال يحتوي على بلوبات الصور القديمة.
لتنظيف التاريخ نهائياً:

### الخطوات (مرتّبة — لا تتجاوز الترتيب)

```bash
# 0. تأكد أن autoDeploy = OFF في Dokploy (MANDATORY)

# 1. تأكد أن النسخة الجديدة تعمل في production أولاً
#    (اختبر الموقع — الصور تظهر من r2.turkistudio.ai)

# 2. شغّل filter-repo على المشروع الرئيسي
cd /Users/mac/Desktop/turki-Portfolio
git filter-repo \
  --path web/public/works \
  --path web/public/brand \
  --invert-paths

# 3. أعد إضافة الـ remote (filter-repo يحذفه)
git remote add fahad git@github.com:fahad-ghazi/turki-Portfolio.git

# 4. force-push كل الـ branches
git push fahad --force --all
git push fahad --force --tags

# 5. GC لتنظيف الـ pack محلياً
git gc --aggressive --prune=now

# 6. أبلّغ أي شخص آخر يعمل على الـ repo أن يعيد clone
```

### ما يحدث للـ pack size
```
قبل filter-repo:  ~142MB  (تاريخ يحتوي صور)
بعد filter-repo:  ~10MB   (code فقط)
```

### لماذا هذا مهم
Dokploy يعمل `git clone` في كل build. بدون filter-repo:
- كل build يحمّل 142MB+ من الـ repo
- مخاطرة امتلاء القرص مع مرور الوقت

---

## 6. التحديات الشائعة وكيفية التعامل معها

### التحدي 1: push بطيء أو HTTP 408
```
السبب:  استخدام HTTPS remote (origin) مع pack كبير
الحل:   git push fahad ...  ← دائماً SSH
```

### التحدي 2: الموقع يعمل لكن الصور لا تظهر
```
الأسباب المحتملة:
  أ) VITE_R2_BASE لم يُضبط كـ Build Arg في Dokploy
  ب) .env.production لم يُدرج في الـ build
  ج) الصور غير موجودة في R2 bucket

خطوات التشخيص:
  1. افتح DevTools → Network → فلتر Images
  2. تحقق أن الـ URLs تبدأ بـ https://r2.turkistudio.ai
  3. لو الـ URL محلي (/works/...) → VITE_R2_BASE مفقود
  4. لو 404 → الملف غير موجود على R2 → شغّل upload-to-r2.mjs
```

### التحدي 3: build يفشل بسبب imageManifest.json مفقود
```
الحل: شغّل npm run build:images أولاً
      الملف يُولَّد في web/src/lib/imageManifest.json
      commit الملف → push → deploy
```

### التحدي 4: صورة جديدة تظهر بالـ fallback (img بدون srcset)
```
السبب:  الصورة غير موجودة في imageManifest.json
الحل:   npm run build:images → node tools/upload-to-r2.mjs
        ثم commit الـ manifest الجديد
```

### التحدي 5: force-push يطلق builds تلقائية
```
السبب:  autoDeploy = ON
الحل:   عطّل autoDeploy في Dokploy UI قبل أي force-push
        إن حدث بالخطأ، ألغِ الـ build من Dokploy UI فوراً
```

### التحدي 6: الـ build بطيء (15+ دقيقة)
```
السبب المحتمل:
  أ) تاريخ git لا يزال ضخم (filter-repo لم يُشغَّل بعد)
  ب) node_modules cache مفقود في Docker
الحل:   شغّل filter-repo (راجع القسم 5)
        تأكد أن Dockerfile يستخدم multi-stage + layer caching
```

---

## 7. Build Args في Dokploy (مهم جداً)

Vite يدمج متغيرات `VITE_*` في الـ bundle وقت الـ build — **ليست runtime**.
يجب ضبطها كـ **Build Args** في Dokploy، ليس Environment Variables.

### Build Args الإلزامية لـ `turkistudio-frontend`

```
VITE_API_URL=https://api.turkistudio.ai
VITE_PUBLIC_SITE_URL=https://turkistudio.ai
VITE_R2_BASE=https://r2.turkistudio.ai
```

**⚠️ لو وضعتها كـ Environment بدل Build Args → الموقع يعمل لكن الصور تظهر محلياً.**

---

## 8. Cloudflare — معلومات الـ Zones والتوكن

```
Token:       CLOUDFLARE_API_TOKEN  (في ~/.claude/.env)
Account ID:  CLOUDFLARE_ACCOUNT_ID (في ~/.claude/.env)
Zone ID:     20d7f931732e0b340fd052dd108134a2  (turkistudio.ai)
R2 Bucket:   turkistudio-works
R2 CDN:      https://r2.turkistudio.ai
```

**لتحميل المتغيرات:**
```bash
source ~/.claude/.env
```

---

## 9. سرعة مرجعية — ما يستغرق وقتاً

| العملية | الوقت المتوقع |
|---|---|
| `git push fahad` (code only) | < 10 ثوانٍ |
| `npm run build:images` (379 صورة) | 3-8 دقائق |
| `node tools/upload-to-r2.mjs` (4131 ملف) | 5-10 دقائق |
| Dokploy build (بعد filter-repo) | 3-5 دقائق |
| Dokploy build (قبل filter-repo) | 8-15 دقيقة |

---

## 10. ملخص قواعد أي وكيل

```
✅ دائماً:
  - git push fahad ...             (SSH، ليس origin)
  - تأكد autoDeploy = OFF قبل force-push
  - صور جديدة → R2 فقط، لا git
  - VITE_* vars → Build Args في Dokploy

❌ لا تفعل أبداً:
  - git add web/public/works/*     (صور في git)
  - git push origin ...            (remote خاطئ)
  - force-push بدون تأكيد autoDeploy = OFF
  - وضع VITE_* vars كـ Environment بدل Build Args
  - تغيير CLOUDFLARE_API_TOKEN scope أو إنشاء token جديد
```
