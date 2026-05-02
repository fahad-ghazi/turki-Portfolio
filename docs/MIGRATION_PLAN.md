# خطة الهجرة والمعالجة — turki-vision-flow

> **آخر تحديث:** 2026-05-03
> **الحالة:** انتظار قرارات استراتيجية من العميل قبل بدء التنفيذ
> **الفرع:** `claude/nervous-snyder-7ee5a3`

---

## 1. الوضع الحالي

### المشروع القديم (الذي سيُستبدل)
- **المسار:** `/Users/mac/Desktop/turki-Portfolio/` (الجذر)
- **التقنية:** Framer export ثابت — HTML/CSS/JS مع `nginx.conf` لـ MIME types
- **الميزات:** صفحات ثابتة، بدون باك-إند، بدون لوحة إدارة

### المشروع الجديد (الذي سيحلّ محله)
- **المسار:** `/Users/mac/Desktop/turki-Portfolio/turki-vision-flow/`
- **التقنية:** React 18 + Vite 6 + Tailwind + Radix + Framer Motion + react-router 6
- **الباك-إند الحالي:** Base44 SDK (`@base44/sdk`) — سيُلغى بالكامل
- **التبعيات الكبيرة:** Stripe (مستخدم؟)، react-leaflet، three.js، jspdf، quill، html2canvas، recharts
- **الكيانات (entities) في base44:**
  1. `AnalyticsEvent` — تتبع الأحداث
  2. `BlogPost` — مقالات
  3. `Film` — أفلام
  4. `LeadRequest` — طلبات تواصل/حجز
  5. `MediaAsset` — ملفات وسائط
  6. `PortfolioProject` — مشاريع المعرض
  7. `ProjectInteraction` — like/share
  8. `SeoIssue` — مشاكل SEO
  9. `SiteContent` — محتوى الموقع القابل للتعديل
  10. `SiteError` — سجل الأخطاء
  11. `SourceIdea` — مصادر/أفكار للمدوّنة

### الصفحات (Routes)
- `/` Home
- `/ai-fashion`, `/commercial-ads`, `/real-estate`, `/heritage` — أقسام أعمال
- `/films` — معرض الأفلام
- `/contact`, `/booking` — تواصل وحجز
- `/cv` — السيرة الذاتية
- `/admin` — لوحة الإدارة (غير محمية حالياً ⚠️)
- `/trained-models` — شخصيات مدرّبة

---

## 2. هدف هذه المرحلة

**فصل المشروع تماماً عن Base44** وبناء باك-إند مستقل على `http://204.168.178.180:3000` مع قاعدة بيانات خاصة، ثم معالجة الـ50 ملاحظة من تقرير التدقيق.

---

## 3. قيود حرجة (يجب مراعاتها)

### قيد السيرفر — مهم جداً
بحسب `~/.claude/CLAUDE.md`:
- **ممنوع SSH** إلى `204.168.178.180` من هذه المحادثة (الاستثناء الوحيد للـ SSH هو مشروع WhatsHub).
- **ممنوع docker / systemctl / Dokploy** مباشرة.
- **مسموح:** كتابة الكود، Dockerfile، الدفع لـ GitHub، اختبار خارجي عبر curl/HTTP فقط.

> **الاستنتاج:** سأبني الباك-إند كـ Node service جاهز مع Dockerfile ومخطط قاعدة بيانات وملف `.env.example` ومنشور deploy مفصّل، ثم **العميل ينشره يدوياً** أو يفتح محادثة "سيرفر-fahadghazi" للـ deploy. لن أحاول النشر بنفسي.

---

## 4. خطة الهجرة على مراحل

### Phase 0 — قرارات استراتيجية (انتظار العميل)
انظر القسم 7 أدناه. لا يبدأ أي تنفيذ قبل الإجابة على الأسئلة الحرجة.

### Phase 1 — فصل عن Base44 SDK
1. حذف `@base44/sdk` و `@base44/vite-plugin` من `package.json`.
2. حذف `src/api/base44Client.js` وإنشاء `src/api/client.js` (fetch wrapper موحّد).
3. كتابة عقد API (REST) موحّد لكل الكيانات الـ11 — JSON Schema → endpoints.
4. استبدال كل `base44.entities.X.list()` و `.create()` و `.update()` بـ `apiClient.X.*`.
5. مراجعة `AuthContext.jsx` — قد يكون مرتبطاً بـ base44 auth.
6. تنظيف import من `@/lib/app-params` (محدّد لـ base44).

### Phase 2 — بناء الباك-إند الجديد
**التقنية المقترحة (يحتاج موافقتك):**
- Node 22 + Fastify (أخفّ من Express وأسرع) أو Express
- PostgreSQL 16 + Prisma ORM (migrations + type safety)
- Auth: JWT + bcrypt للوحة الإدارة فقط (الموقع العام بدون حسابات)
- Storage: S3-compatible (Cloudflare R2 / MinIO على نفس السيرفر) للوسائط
- Validation: Zod (موجود أصلاً في الفرونت، نوحّد المخططات)

**هيكل المستودع المقترح:**
```
turki-vision-flow/
├── apps/
│   ├── web/          ← الفرونت الحالي
│   └── api/          ← Node service الجديد
├── packages/
│   └── schemas/      ← Zod schemas مشتركة (frontend + backend)
└── infra/
    ├── Dockerfile.api
    ├── docker-compose.yml
    └── DEPLOY.md
```

> **بديل مبسّط (إذا أردت):** mono-repo بدون workspaces، مجرد فولدرَين متجاورَين `turki-vision-flow/` و `turki-api/`.

**الـ Endpoints الأساسية:**
```
POST   /api/leads                  ← public, rate-limited, captcha/honeypot
GET    /api/films                  ← public, published only
GET    /api/portfolio-projects     ← public, published only
POST   /api/analytics/events       ← public, batched, rate-limited
POST   /api/site-errors            ← public, batched
POST   /api/interactions           ← public, anonymous like/share
GET    /api/blog                   ← public, published only
GET    /api/blog/:slug             ← public

POST   /api/admin/login            ← admin only
GET    /api/admin/leads            ← admin only
PATCH  /api/admin/leads/:id        ← admin only
… (CRUD لكل entity للوحة)
```

### Phase 3 — توصيل الفرونت
1. متغيّر `VITE_API_URL` في `.env.local`.
2. اختبار محلي: backend على `localhost:3000`، frontend على `localhost:5173`.
3. parity check: كل الميزات تعمل بدون base44.
4. مراجعة `AdminDashboard.jsx` بعد توصيلها.

### Phase 4 — إصلاحات أمنية وUX حرجة (من التدقيق)
**أولوية فورية (نفس اليوم):**
- [ ] #1 — حماية `/admin` بـ JWT + redirect إلى `/admin/login`
- [ ] #2 — إزالة قراءة `AnalyticsEvent` من الصفحة الرئيسية، استبدالها بـ ranking مُحسوب server-side
- [ ] #3 — حماية نموذج الحجز: honeypot + rate limit (5/ساعة/IP) + email validation
- [ ] #4 — حالات loading/error لنموذج الحجز
- [ ] #5 — استبدال أو إخفاء روابط Instagram/LinkedIn حتى نأخذ الروابط الحقيقية
- [ ] #10 — تحديد tap zones دقيقة في `HorizontalSwiper`
- [ ] #11 — تفعيل أو إخفاء الأزرار غير العاملة في `FilmDetailScreen`
- [ ] #12 — مؤشر وقت الفيديو الحقيقي
- [ ] #26 — جعل CTA الأساسي في `/contact` يقود إلى `/booking`
- [ ] #48 — التخلّي عن mailto كقناة أساسية

### Phase 5 — أساسيات SEO
- [ ] #19 — محتوى HTML قابل للفهرسة في الصفحة الرئيسية (خدمات/أقسام/FAQ)
- [ ] #20 — Meta tags ديناميكية لكل route عبر `react-helmet-async`
- [ ] #21 — Canonical URL
- [ ] #22 — OG Image مخصّص + Twitter Card
- [ ] #23 — `html lang` ديناميكي حسب اللغة
- [ ] #24 — `sitemap.xml` و `robots.txt`
- [ ] #25 — Schema.org: Person, Service, CreativeWork, FAQ

### Phase 6 — الأداء
- [ ] #13 — pipeline صور: WebP/AVIF + responsive sizes + thumbnails
- [ ] #14 — lazy loading شامل (loading="lazy" + Intersection Observer)
- [ ] #15 — تقليل blur والأنيميشن، احترام `prefers-reduced-motion`
- [ ] #30 — تتبع فيديو 25/50/75/100% + play/pause/complete

### Phase 7 — تتبع وأخطاء وإشعارات
- [ ] #28 — events للتحويلات: submit_booking, download_cv, contact_click, social_click, project_view_complete
- [ ] #27 — إشعار Email (و/أو WhatsApp/Slack) عند Lead جديد
- [ ] #43 — Error Boundary + window.onerror → `POST /api/site-errors`

### Phase 8 — إضافات محتوى
- [ ] #34 — صفحة CV احترافية + PDF download
- [ ] #35 — صفحة About
- [ ] #36 — صفحة Services بباقات/مخرجات
- [ ] #37 — Privacy Policy + Terms
- [ ] #44 — Routes للمدوّنة `/blog` و `/blog/:slug`
- [ ] #46 — صفحات SEO landing لكل قسم
- [ ] #47 — CTA سياقي داخل كل مشروع
- [ ] #50 — testimonials/clients/process

### Phase 9 — استبدال البناء القديم
- نقل ملفات الجذر القديمة (Framer build) إلى `_legacy/` أو `archive/`.
- نشر `dist/` من المشروع الجديد كـ root.
- nginx.conf جديد يدعم SPA routing (fallback `/index.html`).
- `psi` فحص بعد كل deploy.

---

## 5. أولوية الإصلاحات (من التدقيق المعطى)

### 🚨 يوم 1 (أمان وفقدان عملاء)
1. حماية `/admin`
2. إصلاح روابط social
3. حالات loading/error في Booking
4. منع spam في Booking
5. CTA من Contact → Booking
6. تفعيل/إخفاء أزرار Films غير العاملة
7. meta/canonical/og:image أساسية
8. `html lang` صحيح
9. تتبع submit/download/contact_click
10. تنظيف tap zones

### 📅 أسبوع 1
- pipeline صور كامل
- صفحات Services + About
- محتوى قابل للفهرسة في Home
- صفحات SEO أقوى لكل قسم
- توحيد تجربة Films
- إشعار Email عند Lead
- Error Boundary
- Privacy/Terms
- توحيد الأزرار

### 📆 لاحقاً
- Blog كامل
- Case Studies
- ربط الواجهة بـ CMS (SiteContent + PortfolioProject)
- إدارة وسائط حقيقية
- توصيات آمنة
- FAQ Schema
- Testimonials
- Consent banner (إن لزم)
- Pricing/Packages
- لوحة Leads متقدمة

---

## 6. الميزات الناقصة (checklist موحّد)

- [ ] صفحة About
- [ ] صفحة Services
- [ ] Case Studies
- [ ] Blog فعلي
- [ ] FAQ
- [ ] Privacy Policy
- [ ] Terms
- [ ] Consent banner
- [ ] WhatsApp CTA
- [ ] Testimonials / Clients
- [ ] صفحة Landing لكل خدمة (SEO)
- [ ] صفحة تفاصيل لكل مشروع
- [ ] CMS متصل بالواجهة
- [ ] إدارة وسائط من اللوحة
- [ ] تتبع أخطاء تلقائي
- [ ] تتبع تحويلات كامل
- [ ] إشعارات وصول طلب
- [ ] حماية spam قوية
- [ ] Sitemap + Robots
- [ ] Dynamic meta لكل صفحة
- [ ] OG image مخصّص
- [ ] Video analytics
- [ ] لوحة Leads عملية
- [ ] CV PDF احترافي

---

## 7. أسئلة قرار حرجة (انتظار العميل)

ستُطرح بطريقة منظمة عبر `AskUserQuestion`. التصنيف:

### مجموعة A — قرارات تعطّل البدء (لا يمكن المضي بدونها)
1. **Stack الباك-إند:** Node + Fastify + Postgres + Prisma (موصى به) | Node + Express + Postgres | غير ذلك
2. **Auth Scope:** لوحة الإدارة فقط (موصى به) | حسابات مستخدمين كاملة | بدون لوحة (CMS خارجي)
3. **مسار الـ Deploy للسيرفر:** هل أكتب الكود + Dockerfile + DEPLOY.md وأنت/محادثة السيرفر تنشر؟ (موصى به) | ثمة طريقة أخرى؟
4. **استبدال البناء القديم:** هل يكون فوراً بمجرد الانتهاء، أم تجربة موازية على subdomain أولاً؟

### مجموعة B — قرارات الهوية والمحتوى
5. لغة الموقع: عربي فقط | عربي/إنجليزي بتبديل | إنجليزي مع ترجمة عربية
6. الدومين الرسمي للـ canonical
7. روابط Instagram و LinkedIn الحقيقية
8. هل عندك حساب WhatsApp Business؟ نضيف زر؟
9. وجهة التواصل الأساسية: Booking form | Email | WhatsApp | جدولة موعد (Calendly-like)
10. هل تعرض أسماء عملاء/مشاريع حقيقية؟
11. أسعار/باقات تقريبية: نعم | لا | "اطلب عرض"
12. Privacy/Terms: لديك جاهز | أكتب نسخة أولية باسمك

### مجموعة C — قرارات الاستراتيجية
13. الجمهور الأساسي: السعودية/الخليج | عالمي | مزدوج
14. الهدف الأول: عملاء | توظيف | بناء هوية | بيع خدمات (متعدد مسموح)
15. تجربة الـ Hero: نُبقي السحب السينمائي | نسرّعها ونجعلها مباشرة | نخلط (Hero مباشر + قسم سينمائي اختياري)
16. CMS: نربط الواجهة بـ DB من اللوحة (الأفضل) | نُبقي بعض المحتوى ثابتاً
17. إشعارات Lead: Email فقط | Email + WhatsApp | Email + Slack

---

## 8. سجل القرارات (يُحدَّث مع التقدّم)

| التاريخ | القرار | المبرّر |
|--------|--------|---------|
| 2026-05-03 | فتح الخطة | بداية التدقيق |

---

## 9. اللواحق (يُكتب فيها التفصيل لاحقاً)

- A — Schema قاعدة البيانات الكاملة (Prisma)
- B — مخطّط API (OpenAPI/REST)
- C — DEPLOY.md للسيرفر
- D — قائمة `psi` baseline + targets
- E — مصفوفة قبل/بعد لكل ملاحظة من الـ50
