# STATUS — turki-vision-flow migration

> **Branch:** `claude/nervous-snyder-7ee5a3`
> **Last update:** 2026-05-03

---

## ما أُنجز (4 commits)

### Phase 1-3 — فصل عن base44 + بناء الباك-إند (commit `9adb5cc`)
- استيراد `turki-vision-flow/` كـ `web/`
- إنشاء `api/` (Node + Fastify + Prisma + Postgres)
- إزالة كل تبعيات base44، استبدالها بـ shim عبر `web/src/api/client.js`
- AuthContext جديد admin-only، JWT في httpOnly cookie
- صفحة `/admin/login` + `ProtectedRoute` يحرس `/admin`
- 11 entity في Prisma بمسماة snake_case للحفاظ على parity
- routes عامة: `/api/leads` (rate-limited + honeypot), analytics events,
  interactions, site-errors، films، portfolio-projects، blog، site-content
- routes إدارة: `/api/admin/login|logout|me` و generic CRUD
  `/api/admin/entities/:entity[/:id]` على allowlist 11 كياناً
- Dockerfile multi-stage يشغّل `prisma migrate deploy` عند الإقلاع
- `docker-compose.yml` للتطوير المحلي
- `docs/DEPLOY.md` بإرشادات Dokploy التفصيلية

### Phase 4 — إصلاحات UX حرجة (commit `e98e1ce`)
- إزالة رابط LinkedIn الوهمي من Hero — يُقرأ من `VITE_LINKEDIN_URL`
  وإذا فاضي يختفي تماماً
- مؤشر وقت الفيديو الحقيقي `MM:SS / MM:SS` بدل القيمة الثابتة
- أحداث تتبع تحويل: `booking_open_clicked`, `contact_email_clicked`,
  `social_click`

### Phase 5 — أساسيات SEO (commit `b3fc449`)
- `<Seo />` موحّد عبر `react-helmet-async`
- 12 route لها title/description/canonical/og/twitter:
  - عامة: Home (مع Person JSON-LD), Films, AiFashion, CommercialAds,
    RealEstate, Heritage, TrainedModels, Contact, CV
  - مخفية عن الفهرسة: Booking, AdminLogin, AdminDashboard
- يقرأ `VITE_PUBLIC_SITE_URL` لبناء canonical/og:url

### Phase 7 — تتبع أخطاء تلقائي (commit `0219192`)
- `lib/errorReporter.js`: window.error + unhandledrejection +
  document capture على img/video failures
- يستخدم `sendBeacon` ليصل قبل unload، de-dup حتى لا يولّد infinite loops
- `<ErrorBoundary />` يلتقط أخطاء React مع UI fallback عربي وإعادة تشغيل
- يصبّ كل شيء في `/api/site-errors` فيظهر تلقائياً في لوحة الإدارة

---

## ما يحتاج إجراء منك / محادثة "مدير سيرفر"

### Deploy (محادثة مدير سيرفر)
انظر `docs/DEPLOY.md` الكامل. الخطوات الجوهرية:
1. **DB:** أنشئ خدمة Postgres جديدة في Dokploy `turki-postgres` (لا تلمس DB أخرى)
2. **API service:** Dockerfile من `api/`، يبني نفسه ويشغّل migrate تلقائياً
3. **Web service:** Dockerfile من `web/` (staging مؤقت أو مباشر بحسب رغبتك)
4. **DNS:** في Cloudflare (zone `turkistudio.ai`):
   ```
   api.turkistudio.ai      A → Dokploy IP   (Proxied)
   ```
5. **Env vars الحرجة للـ API:**
   - `DATABASE_URL` — connection string من Postgres الجديد
   - `JWT_SECRET` — `openssl rand -hex 32`
   - `COOKIE_SECRET` — `openssl rand -hex 32`
   - `CORS_ORIGINS` — `https://turkistudio.ai,https://staging.turkistudio.ai`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` — أول مرة فقط لإنشاء حسابك
   - `LEAD_NOTIFY_TO`, `SMTP_*` — اختياري للإشعارات

### قرارات محتوى مطلوبة قبل ما أكمل Phase 8
1. **روابط social الحقيقية** — Instagram, LinkedIn, WhatsApp Business (إن وجد)
2. **بريد التواصل الرسمي** — حالياً `contact@turkighazi.com`؛ هل تغير؟
3. **الدومين الرسمي للـ canonical** — `turkistudio.ai` أم `turkighazi.com`؟
   (index.html يستخدم turkighazi.com حالياً، لكن Dokploy عندك turkistudio.ai)
4. **محتوى صفحات Phase 8:**
   - About: 3-5 فقرات عن خلفيتك ومنهجك
   - Services: قائمة الخدمات بمخرجات وباقات/نطاقات تقريبية
   - Privacy / Terms: نسخة أولية أم تكتبها أنت؟

---

## Phases المؤجلة

### Phase 8 — صفحات محتوى (في انتظار الإجابات أعلاه)
- `/about` — صفحة About
- `/services` — Services بباقات
- `/privacy` — Privacy Policy
- `/terms` — Terms

### Phase 6 — أداء وصور (آخر شيء، حسب طلبك)
- pipeline صور WebP/AVIF + responsive
- lazy loading شامل
- video analytics 25/50/75/100%

### Phase 9 — cutover إلى الجذر
- نقل ملفات Framer إلى `_archive/`
- جعل `web/dist` يخدم على turkistudio.ai
- تحديث Cloudflare DNS النهائي

---

## كيف تتحقق محلياً (اختياري)

```bash
# 1) Postgres + API
docker compose up -d postgres api

# 2) Web (في تيرمنال ثاني)
cd web
cp .env.example .env.local        # عدّل VITE_API_URL إذا لزم
npm install
npm run dev

# 3) افتح:
#    http://localhost:5173
#    http://localhost:5173/admin/login (admin@turki.local / ChangeMeOnFirstBoot!)
```

---

## أرقام صريحة

- **Commits:** 4
- **ملفات جديدة:** 181
- **أسطر جديدة:** ~24,400
- **مكوّنات React محذوفة من base44 SDK:** 0 (shim يحتفظ بكل surface)
- **Endpoints API:** 8 عامة + 5 admin auth + generic CRUD لـ11 كياناً
- **Audit issues addressed:** 11 من 50 (الباقي في Phase 6/8/9 أو يحتاج deploy)
