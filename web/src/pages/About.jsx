import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { Sparkles, Palette, Briefcase, Camera, Building2, Sparkle } from "lucide-react";

const GOLD = "#C9A961";

// First-pass About — drafted from what's already on the site (services,
// brand voice, audience). Replace any paragraph below as you refine
// your personal story; lift noIndex once it reflects the real you.

const pillars = [
  {
    icon: Sparkles,
    title: "الفكرة قبل الصورة",
    body:
      "نبدأ كل مشروع من الفكرة والمزاج البصري قبل أن نلمس أي أداة. القصة تقود التنفيذ، وليس العكس.",
  },
  {
    icon: Palette,
    title: "هوية بصرية ثابتة",
    body:
      "نستخدم نماذج وشخصيات مدرّبة للحفاظ على ملامح متماسكة عبر الحملة كاملةً، حتى لو امتدّت لشهور أو لمنصّات متعدّدة.",
  },
  {
    icon: Sparkle,
    title: "Light luxury، editorial",
    body:
      "أسلوبنا هادئ، عالي الجودة، ومناسب للعلامات الفاخرة. لا ضوضاء بصرية ولا فلاتر صارخة — نحن أقرب لمجلات الموضة منه إلى مولّدات الصور العامة.",
  },
];

const offerings = [
  { icon: Briefcase, title: "إعلانات تجارية", href: "/commercial-ads" },
  { icon: Camera, title: "أفلام قصيرة", href: "/films" },
  { icon: Sparkles, title: "أزياء سينمائية", href: "/ai-fashion" },
  { icon: Building2, title: "تصورات عقارية", href: "/real-estate" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-14 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="عن تركي استديو"
        description="تعرّف على تركي غازي ومنهج تركي استديو في صناعة محتوى بصري سينمائي بالذكاء الاصطناعي."
        canonical="/about"
        noIndex={true}
      />
      <Link
        to="/"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        الرئيسية
      </Link>

      <article className="mx-auto max-w-4xl">
        {/* Heading */}
        <Eyebrow ar="عن تركي" en="About" />
        <h1 className="mt-5 font-noto text-6xl font-bold leading-tight tracking-tight md:text-7xl">
          عن تركي استديو
        </h1>
        <p className="mt-6 max-w-2xl font-noto text-lg leading-9 text-[#0B0B0B]">
          تركي استديو بقيادة <strong>تركي غازي</strong> — مصمم ومبدع بصري سعودي يستخدم الذكاء
          الاصطناعي لصناعة عوالم سينمائية للعلامات التجارية في السعودية والخليج. نشتغل على ست
          مسارات أساسية: الإعلانات التجارية، الأزياء، التصورات العقارية، التراث البصري، الأفلام
          القصيرة، والشخصيات المدرّبة. كل مسار له لغة بصرية مختلفة، لكن يوحدها أسلوب واحد.
        </p>

        {/* Pillars */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#C9A961]/16 bg-[#E9E2D3]/40 p-6"
            >
              <Icon className="h-6 w-6 text-[#C9A961]" strokeWidth={1.4} />
              <h2 className="mt-5 font-noto text-xl font-bold">{title}</h2>
              <p className="mt-3 font-noto text-sm leading-7 text-[#1A1A1A]/72">{body}</p>
            </div>
          ))}
        </div>

        {/* What we do */}
        <section className="mt-16">
          <Eyebrow ar="ماذا نقدّم" en="What we do" />
          <h2 className="mt-3 font-noto text-4xl font-bold leading-tight md:text-5xl">
            ست مسارات. أسلوب واحد.
          </h2>
          <p className="mt-4 max-w-2xl font-noto text-base leading-9 text-[#0B0B0B]">
            من الفكرة الأولى حتى التسليم، نتولّى المسار البصري كاملاً — الإخراج، اللوحة، التنفيذ
            بالذكاء الاصطناعي، وضبط الجودة قبل التسليم. نعمل مع علامات فاخرة، شركات عقارية،
            مؤسسات ثقافية، ومخرجي أفلام.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {offerings.map(({ icon: Icon, title, href }) => (
              <Link
                key={href}
                to={href}
                className="group flex items-center gap-4 rounded-2xl border border-[#C9A961]/16 bg-[#E9E2D3]/40 p-5 transition hover:border-[#C9A961]/45"
              >
                <Icon className="h-6 w-6 text-[#C9A961]" strokeWidth={1.4} />
                <span className="font-noto text-lg font-bold">{title}</span>
                <span className="ms-auto font-cinzel text-[11px] tracking-[0.35em]" style={{ color: GOLD }}>
                  ←
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* How we work */}
        <section className="mt-16">
          <Eyebrow ar="كيف نعمل" en="How we work" />
          <h2 className="mt-3 font-noto text-4xl font-bold leading-tight md:text-5xl">
            كيف نعمل
          </h2>
          <ol className="mt-6 space-y-4 font-noto text-base leading-9 text-[#0B0B0B]">
            <li>
              <strong>1. الإيجاز.</strong> نلتقي للقاء قصير لفهم المشروع، الجمهور، والمزاج
              المطلوب.
            </li>
            <li>
              <strong>2. اللوحة البصرية.</strong> نقدّم لوحة مزاج واتجاهين بصريين قبل التنفيذ
              لتختار بينهما.
            </li>
            <li>
              <strong>3. الإنتاج.</strong> ننتج المخرجات بأسلوب ثابت عبر شخصيات/نماذج مدرّبة على
              المشروع.
            </li>
            <li>
              <strong>4. ضبط الجودة.</strong> ندقّق كل صورة وكل لقطة، ونعدّل حتى تحقّق المعيار.
            </li>
            <li>
              <strong>5. التسليم.</strong> ملفات بدقّة عالية + نسخ مهيّأة للنشر على المنصّات
              التي تطلبها.
            </li>
          </ol>
        </section>

        {/* CTA */}
        <section className="mt-16 rounded-[2rem] border border-[#C9A961]/22 bg-[#1A1A1A] p-10 text-center text-[#F5F1E8]">
          <h2 className="font-noto text-3xl font-bold leading-tight md:text-4xl">
            عندك مشروع في ذهنك؟
          </h2>
          <p className="mt-3 font-noto text-base leading-8 text-[#F5F1E8]/72">
            ابدأ بنموذج مختصر، نتواصل معك خلال 48 ساعة عمل.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/booking"
              className="rounded-full border-2 border-[#C9A961] bg-[#C9A961] px-8 py-3.5 font-noto text-base font-bold text-[#1A1A1A] transition hover:bg-[#F5F1E8]"
            >
              احجز مشروع
            </Link>
            <Link
              to="/services"
              className="rounded-full border-2 border-[#F5F1E8]/35 bg-transparent px-8 py-3.5 font-noto text-base font-bold text-[#F5F1E8] transition hover:border-[#C9A961] hover:text-[#C9A961]"
            >
              تصفح الخدمات
            </Link>
          </div>
        </section>

        <p className="mt-12 rounded-2xl border border-[#C9A961]/20 bg-[#E9E2D3]/40 p-5 text-center font-noto text-xs text-[#1A1A1A]/60">
          ملاحظة: هذه مسوّدة أولى استناداً إلى محتوى الموقع. عدّل/أرسل لي النص النهائي
          لإزالة noIndex وتفعيل الصفحة بالكامل.
        </p>
      </article>
    </div>
  );
}
