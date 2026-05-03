import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Download, Globe, Mail, Sparkles, User } from "lucide-react";
import Seo from "@/components/seo/Seo";
import Eyebrow from "@/components/brand/Eyebrow";
import Button from "@/components/brand/Button";

const GOLD = "#C9A961";

// Audit #34: previous CV was a 3-card business-card. This expanded
// version covers what a hiring/contracting reviewer actually needs:
// summary, services, tooling, recent work, and contact paths. Real
// dates / case studies still need to come from the user — slots are
// marked with comments where they'll plug in.

const HIGHLIGHTS = [
  { icon: Sparkles, title: "ست مسارات", text: "إعلانات، أزياء، عقار، تراث، أفلام قصيرة، شخصيات مدرّبة" },
  { icon: Globe, title: "السوق", text: "السعودية والخليج، مع تعاون دولي عن بعد" },
  { icon: User, title: "الجمهور", text: "علامات فاخرة، شركات عقارية، مؤسسات ثقافية، مخرجو أفلام" },
];

const SERVICES = [
  { title: "إعلانات تجارية", body: "حملات بصرية لمنتجات وعلامات فاخرة. الفكرة، اللوحة، التنفيذ، والتسليم." },
  { title: "أزياء سينمائية", body: "افتتاحيات editorial وحملات أزياء ومجوهرات بأسلوب مجلات عالمية." },
  { title: "تصورات عقارية ومعمارية", body: "جولات بصرية ولقطات داخلية/خارجية بجودة سينمائية." },
  { title: "محتوى تراث بصري", body: "محتوى للتراث السعودي والخليجي بطابع سينمائي معاصر." },
  { title: "أفلام قصيرة", body: "من الفكرة حتى التسليم، أفلام كاملة بالذكاء الاصطناعي." },
  { title: "شخصيات بصرية مدرّبة", body: "شخصيات ثابتة الهوية عبر الحملات، مدرّبة على بياناتك." },
];

const TOOLS = [
  "Midjourney",
  "Runway",
  "Flux",
  "Stable Diffusion",
  "After Effects",
  "Photoshop",
  "Premiere Pro",
  "DaVinci Resolve",
  "Blender",
];

const PROCESS = [
  { step: "01", title: "الإيجاز", text: "لقاء قصير لفهم المشروع، الجمهور، والمزاج المطلوب." },
  { step: "02", title: "اللوحة البصرية", text: "اتجاهان بصريان قبل التنفيذ، تختار بينهما." },
  { step: "03", title: "الإنتاج", text: "تنفيذ المخرجات بأسلوب ثابت عبر شخصيات/نماذج مدرّبة." },
  { step: "04", title: "ضبط الجودة", text: "تدقيق كل صورة وكل لقطة قبل التسليم." },
  { step: "05", title: "التسليم", text: "ملفات بدقّة عالية + نسخ مهيّأة لكل منصّة." },
];

export default function CV() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="السيرة الذاتية"
        description="سيرة تركي غازي — مصمم بصري بالذكاء الاصطناعي. خبرات، أدوات، خدمات، ومنهج عمل."
        canonical="/cv"
      />

      <Link
        to="/"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        الرئيسية
      </Link>

      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-[#C9A961]/16 bg-[#F5F1E8] p-7 md:p-12"
        >
          {/* Header */}
          <Eyebrow ar="السيرة الذاتية" en="Curriculum Vitae" />
          <h1 className="mt-5 font-noto text-6xl font-bold leading-tight tracking-tight md:text-7xl">
            تركي غازي
          </h1>
          <p className="mt-4 max-w-2xl font-noto text-base font-medium leading-9 text-[#0B0B0B]">
            مصمم ومبدع بصري سعودي. أصمم محتوى بصري سينمائي للعلامات والمشاريع باستخدام الذكاء
            الاصطناعي. أساس عمل تركي استديو منذ <span className="font-bold">2024</span> —
            ست مسارات، أسلوب واحد، تركيز على الـlight luxury والـeditorial.
          </p>

          {/* Highlights */}
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="rounded-2xl border border-[#C9A961]/16 bg-[#E9E2D3]/38 p-5"
                >
                  <Icon className="h-5 w-5 text-[#C9A961]" strokeWidth={1.4} />
                  <h2 className="mt-4 font-noto text-base font-bold text-[#0F0F0F]">{h.title}</h2>
                  <p className="mt-2 font-noto text-sm leading-7 text-[#1A1A1A]/72">{h.text}</p>
                </div>
              );
            })}
          </div>

          {/* Services */}
          <section className="mt-14">
            <Eyebrow ar="الخدمات" en="Services" />
            <h2 className="mt-3 font-noto text-3xl font-bold leading-tight md:text-4xl">
              ما الذي تقدمه تركي استديو
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-[#C9A961]/14 bg-[#E9E2D3]/30 p-5"
                >
                  <h3 className="font-noto text-base font-bold">{s.title}</h3>
                  <p className="mt-2 font-noto text-sm leading-7 text-[#1A1A1A]/72">{s.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tools */}
          <section className="mt-14">
            <Eyebrow ar="الأدوات" en="Tools" />
            <h2 className="mt-3 font-noto text-3xl font-bold leading-tight md:text-4xl">
              الأدوات الأساسية
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {TOOLS.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full border border-[#C9A961]/30 bg-[#E9E2D3]/45 px-4 py-1.5 font-noto text-sm text-[#0F0F0F]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </section>

          {/* Process */}
          <section className="mt-14">
            <Eyebrow ar="منهج العمل" en="Process" />
            <h2 className="mt-3 font-noto text-3xl font-bold leading-tight md:text-4xl">
              من الفكرة للتسليم
            </h2>
            <ol className="mt-6 space-y-3">
              {PROCESS.map((p) => (
                <li
                  key={p.step}
                  className="flex gap-4 rounded-2xl border border-[#C9A961]/14 bg-[#E9E2D3]/30 p-5"
                >
                  <span
                    className="font-cinzel text-sm font-bold tracking-[0.2em]"
                    style={{ color: GOLD }}
                  >
                    {p.step}
                  </span>
                  <div>
                    <h3 className="font-noto text-base font-bold">{p.title}</h3>
                    <p className="mt-1 font-noto text-sm leading-7 text-[#1A1A1A]/72">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Selected work */}
          <section className="mt-14">
            <Eyebrow ar="أعمال مختارة" en="Selected Work" />
            <h2 className="mt-3 font-noto text-3xl font-bold leading-tight md:text-4xl">
              تصفّح المعرض
            </h2>
            <p className="mt-4 max-w-2xl font-noto text-sm leading-8 text-[#1A1A1A]/72">
              المعرض الكامل بـ89 عملاً موزّع على ستة أقسام أساسية. كل قسم له أسلوبه ومخرجاته الخاصة.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/films" variant="secondary" size="sm">الأفلام</Button>
              <Button to="/ai-fashion" variant="secondary" size="sm">الأزياء</Button>
              <Button to="/commercial-ads" variant="secondary" size="sm">الإعلانات</Button>
              <Button to="/real-estate" variant="secondary" size="sm">العقارات</Button>
              <Button to="/heritage" variant="secondary" size="sm">التراث</Button>
              <Button to="/trained-models" variant="secondary" size="sm">الشخصيات</Button>
            </div>
          </section>

          {/* CTAs */}
          <section className="mt-14 flex flex-col gap-3 sm:flex-row">
            <Button
              href="/Turki-Ghazi-CV.txt"
              download
              variant="secondary"
              size="lg"
              icon={Download}
              onClick={() =>
                base44.analytics.track({
                  eventName: "cv_download_clicked",
                  properties: { page: "cv" },
                })
              }
            >
              تحميل السيرة
            </Button>
            <Button to="/booking" variant="primary" size="lg" icon={Mail}>
              احجز مشروع
            </Button>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
