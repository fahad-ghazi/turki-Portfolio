import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";

const GOLD = "#C9A961";

// Stub Services page — packages and prices are placeholders. Replace
// with the real offering once the user confirms scope and pricing model.

const services = [
  {
    title: "إعلانات تجارية بالذكاء الاصطناعي",
    description:
      "حملات بصرية عالية الجودة لمنتجات وعلامات فاخرة. تشمل الفكرة، اللوحة، التنفيذ، والتسليم.",
    href: "/commercial-ads",
  },
  {
    title: "أزياء سينمائية بالذكاء الاصطناعي",
    description: "حملات أزياء بأسلوب editorial، ملاءمة للعلامات الفاخرة والمجلات.",
    href: "/ai-fashion",
  },
  {
    title: "تصورات عقارية ومعمارية",
    description: "جولات بصرية وعروض داخلية/خارجية بجودة سينمائية للمشاريع العقارية.",
    href: "/real-estate",
  },
  {
    title: "محتوى تراث بصري",
    description: "محتوى مرئي للتراث السعودي والخليجي بطابع سينمائي معاصر.",
    href: "/heritage",
  },
  {
    title: "أفلام قصيرة سينمائية",
    description: "أفلام قصيرة كاملة من الفكرة حتى التسليم، مصنوعة بالذكاء الاصطناعي.",
    href: "/films",
  },
  {
    title: "شخصيات بصرية مدرّبة",
    description: "شخصيات ثابتة الهوية عبر حملات متعددة، مدرّبة على بياناتك.",
    href: "/trained-models",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="الخدمات"
        description="خدمات تركي استديو: إعلانات، أزياء، عقار، تراث، أفلام قصيرة، وشخصيات بصرية مدرّبة بالذكاء الاصطناعي."
        canonical="/services"
        noIndex={true}
      />
      <Link
        to="/"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        الرئيسية
      </Link>

      <div className="mx-auto max-w-5xl">
        <p className="font-cinzel text-[10px] tracking-[0.45em] uppercase" style={{ color: GOLD }}>
          Services
        </p>
        <h1 className="mt-5 font-noto text-6xl font-bold leading-tight tracking-tight md:text-7xl">
          الخدمات
        </h1>
        <p className="mt-5 max-w-2xl font-noto text-base leading-9 text-[#0B0B0B]">
          ست مسارات عمل أساسية. كل مسار يمكن طلبه كمشروع مستقل أو ضمن باقة. تواصل عبر نموذج
          الحجز للحصول على عرض مخصص.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {services.map((s) => (
            <Link
              key={s.href}
              to={s.href}
              className="group rounded-2xl border border-[#C9A961]/16 bg-[#E9E2D3]/38 p-6 transition hover:border-[#C9A961]/45"
            >
              <h2 className="font-noto text-2xl font-bold leading-tight">{s.title}</h2>
              <p className="mt-3 font-noto text-sm leading-7 text-[#1A1A1A]/72">{s.description}</p>
              <span
                className="mt-5 inline-block font-cinzel text-[11px] tracking-[0.35em]"
                style={{ color: GOLD }}
              >
                استعرض ←
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-[#C9A961]/20 bg-[#E9E2D3]/40 p-6 text-sm">
          <strong>ملاحظة للإدارة:</strong> هذه الصفحة بدون باقات/أسعار محددة بعد. أرسل بنية
          الباقات (نطاقات الأسعار، المخرجات، المدد) لإكمال الصفحة وإزالة noIndex.
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/booking"
            className="rounded-full border-2 border-[#1A1A1A] bg-[#1A1A1A] px-10 py-4 text-center font-noto text-base font-bold text-[#F5F1E8] transition hover:border-[#C9A961] hover:text-[#C9A961]"
          >
            ابدأ مشروعك
          </Link>
        </div>
      </div>
    </div>
  );
}
