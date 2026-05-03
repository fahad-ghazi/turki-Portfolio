import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";

// Stub page — copy is placeholder until the user provides final About text.
// noIndex stays on until real content lands so Google doesn't snapshot a draft.

const GOLD = "#C9A961";

export default function About() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="عن تركي"
        description="تعرّف على تركي غازي، مصمم بصري بالذكاء الاصطناعي ومؤسس تركي استديو."
        canonical="/about"
        noIndex={true}
      />
      <Link
        to="/"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        الرئيسية
      </Link>

      <div className="mx-auto max-w-3xl">
        <p className="font-cinzel text-[10px] tracking-[0.45em] uppercase" style={{ color: GOLD }}>
          About
        </p>
        <h1 className="mt-5 font-noto text-6xl font-bold leading-tight tracking-tight md:text-7xl">
          عن تركي
        </h1>

        <div className="mt-10 space-y-6 font-noto text-base leading-9 text-[#0B0B0B]">
          {/* PLACEHOLDER — replace with the user's actual story before launch */}
          <p>
            تركي غازي مصمم ومبدع بصري سعودي متخصص في صياغة العوالم السينمائية باستخدام الذكاء
            الاصطناعي. هذه الصفحة مسودّة، وسيتم استبدالها بنص شخصي يحكي الخلفية، الأسلوب،
            والمشاريع المختارة قبل الإطلاق العام.
          </p>
          <p className="rounded-2xl border border-[#C9A961]/20 bg-[#E9E2D3]/40 p-5 text-sm">
            <strong>ملاحظة للإدارة:</strong> هذه الصفحة محجوزة عن الفهرسة (noIndex) حتى يضاف
            محتوى نهائي. أرسل النص النهائي لتفعيل الصفحة.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/booking"
            className="rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 text-center font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]"
          >
            احجز مشروع
          </Link>
          <Link
            to="/cv"
            className="rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 text-center font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]"
          >
            عرض السيرة
          </Link>
        </div>
      </div>
    </div>
  );
}
