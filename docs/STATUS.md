# STATUS — turki-vision-flow

> **Branch:** `claude/nervous-snyder-7ee5a3` (will become `main` once merged)
> **Last update:** 2026-05-03

---

## ما أُنجز (22 commit)

### المرحلة الأولى — البنية التحتية (commits `9adb5cc` → `7702863`)
- فصل كامل عن base44 → Fastify + Prisma + Postgres على api.turkistudio.ai
- 11 كيان في DB، seed تلقائي على الإقلاع، generic admin CRUD + auth JWT
- 4 صفحات أقسام تقرأ من DB مع fallback للـstatic
- Films + Blog + Site content public read endpoints
- Lead form بحماية honeypot + rate limit
- ErrorBoundary + auto error reporter في web → /api/site-errors
- 12 route لها SEO ديناميكي (Helmet + JSON-LD: Person + ProfessionalService + FAQ)
- 6 صفحات stub جاهزة (About, Services, Privacy, Terms, Blog index, Blog post)

### الأصول الفعلية (commit `e34ea3a`)
- 207 رابط `media.base44.com` → مسارات محلية في `web/public/works/`
- 9 فيديو MDN dummy → 9 أفلام تركي الفعلية في `web/public/videos/`
- 378 صورة + 11 فيديو منقولة (66M + 84M)

### الإصلاحات الحرجة لـscroll/UX (commit `c65620f`)
- DualNav: scroll-snap نقي + IntersectionObserver لمزامنة currentSlide مع المعروض فعلياً
- إزالة wheel/touch handlers + 750ms throttle (يصارع iOS و trackpad)
- TinderMode: حذف tap zones خفية + preload صور + cleanup setTimeout
- HeroFeedItem: dot indicator dynamic
- HorizontalSwiper: useCallback + memoization + deps صحيحة
- CSS: hover effects خلف `(hover: hover)` فقط (لا تلتصق على iOS)
- 10 من 23 مشكلة scroll/animation معالجة

### الشعار (commit `397fcd6`)
- استبدال logo-coin.png بـ`brand/turki-logo.svg` (الشعار المفرغ المقصوص)
- favicon + apple-touch-icon + Hero + FinalBrandSection

### Stage-1 cleanup (commit `20a7ada`)
- حذف 16 ملف orphan (1573 سطر) — portfolio/*, FeedScroller, MainFeed,
  RecommendedWorks, إلخ
- حذف 8 تبعيات npm غير مستخدمة (Stripe, three, leaflet, quill,
  html2canvas, jspdf, canvas-confetti) → 64 → 56 dep
- LanguageContext يحفظ في localStorage + يحدّث `<html lang>` و `dir`
- LanguageToggle component مدمج في قائمة Hero (AR · EN segmented pill)

### Stage-2 — DB-first content (commits `9de94c6` + `5b0f14c`)
- Character entity جديد في Prisma + seed من 6 شخصيات
- TrainedModels.jsx يقرأ من /api/characters مع fallback static
- Per-entity Zod validation في admin CRUD (portfolio_projects, films,
  characters, blog_posts, media_assets, site_content) → 400 نظيف بدل 500
- AdminAction audit log: كل create/update/delete + login/logout/password_change
- AdminSidebar: tabs جديدة "الشخصيات" و "سجل الإدارة"
- audit_actions كـread-only في الـallowlist (mutating → 405)

### Stage-3 — security hardening + CI (commit جاري)
- nginx CSP صارم + HSTS + COOP + COEP + Permissions-Policy
- GitHub Actions workflow `.github/workflows/ci.yml`:
  - api typecheck + build (TypeScript strict)
  - web build (Vite production)
  - lint (continue-on-error مؤقتاً)

---

## الحالة الحية (2026-05-03)

| Service | الحالة | URL |
|---------|--------|-----|
| `turki-postgres` | ✅ شغّال (host داخلي `turki-postgres-fec6as`) | داخلي |
| `turki-api` | ✅ صحّي | https://api.turkistudio.ai/health |
| `turki-web-staging` | ✅ شغّال | https://staging.turkistudio.ai |
| `Frontend` (الإنتاج القديم) | ⏸️ Framer كما هو، انتظار cutover | https://turkistudio.ai |

---

## أرصدة تتبع التقدم

| Metric | القيمة |
|--------|--------|
| Commits على الفرع | 22 |
| ملفات جديدة | ~210 |
| أصول مرفوعة | 378 صورة + 11 فيديو |
| Audit issues معالجة (من الـ50) | ~38 |
| ملفات orphan متبقّية | 0 |
| تبعيات غير مستخدمة | 0 |
| اختبارات | 0 (CI أُنشئ، tests TBD) |

---

## ما يحتاج إجراء منك

### عاجل (يفتح الإطلاق)
1. **اختبر staging** بصرياً واطلب fixes إن وُجدت
2. **ادخل /admin** وغيّر كلمة المرور من تبويب الإعدادات
3. **محتوى About نهائي** + قرار Services (باقات أم لا)
4. **روابط social حقيقية:** LinkedIn URL (Instagram + email + WhatsApp جاهزة)
5. **Privacy/Terms** — مراجعة قانونية قبل launch

### متوسط
6. **اطلب من وكيل السيرفر:**
   - حذف `ADMIN_PASSWORD` من Dokploy env بعد تغييرها
   - إضافة `SMTP_HOST/PORT/USER/PASS/FROM/LEAD_NOTIFY_TO` لإشعارات Lead
7. **تجهيز شعارات/شهادات عملاء** للـtrust block (audit #50)

### لاحقاً (مؤجّل بطلبك)
8. **Phase 6 — تحسين الصور:** WebP/AVIF + lazy + responsive srcset
9. **Cutover:** عدّل خدمة `Frontend` في Dokploy لتشير إلى `web/Dockerfile`، أو أنشئ DNS swap

---

## كيف تتحقق محلياً

```bash
# Postgres + API
docker compose up -d postgres api

# Web (في تيرمنال ثاني)
cd web
cp .env.example .env.local
npm install
npm run dev

# افتح:
#   http://localhost:5173
#   http://localhost:5173/admin/login
```

---

## ملاحظات معمارية

- **DB schema:** snake_case في الـDB columns (`@map`), camelCase في Prisma JS,
  snake_case في JSON API. Translation طبقة في `lib/serialize.ts`.
- **Seed strategy:** auto-seed-if-empty على الإقلاع. لإعادة seed يدوياً:
  `POST /api/admin/seed/content` (admin auth).
- **Audit log:** read-only من /admin، لا يُحذف. يستوعب 100,000+ rows
  بدون مشكلة قبل الحاجة لـpartitioning.
- **Image storage:** ملفات في `web/public/works/` و `web/public/videos/`،
  تخدم من nginx مباشرة. لو احتجت إدارة من /admin مع رفع جديد، سأضيف
  upload endpoint مع R2/S3 لاحقاً.
- **CI:** GitHub Actions يبني api + web على كل push. Dokploy ينشر
  مباشرة عند نجاح الـbuild.
