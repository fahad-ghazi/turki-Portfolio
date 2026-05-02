import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Briefcase, Download, Mail, Palette, Sparkles } from "lucide-react";
import Seo from "@/components/seo/Seo";

const GOLD = "#C9A961";

const sections = [
  { title: "المجال", icon: Sparkles, text: "مصمم ومبدع بصري متخصص في بناء العوالم السينمائية باستخدام الذكاء الاصطناعي." },
  { title: "الخدمات", icon: Briefcase, text: "إعلانات تجارية، أزياء ذكاء اصطناعي، عقارات، تراث بصري، وأفلام قصيرة." },
  { title: "الأسلوب", icon: Palette, text: "Light luxury، editorial، هادئ، عالي الجودة، ومناسب للعلامات الفاخرة." },
];

export default function CV() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="السيرة الذاتية"
        description="سيرة تركي غازي — مصمم بصري بالذكاء الاصطناعي. خبرات، أسلوب، خدمات، وروابط أعمال مختارة."
        canonical="/cv"
      />
      <Link to="/" className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]">الرئيسية</Link>
      <div className="mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-[#C9A961]/16 bg-[#F5F1E8] p-7 md:p-12">
          <p className="font-cinzel text-[10px] tracking-[0.45em] uppercase" style={{ color: GOLD }}>Curriculum Vitae</p>
          <h1 className="mt-5 font-noto text-6xl font-bold leading-tight tracking-tight md:text-7xl">تركي غازي</h1>
          <p className="mt-4 max-w-xl font-noto text-base font-normal leading-9 text-[#0B0B0B]">AI Visual Designer & Creative — أصمم محتوى بصري سينمائي للعلامات والمشاريع باستخدام الذكاء الاصطناعي.</p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.title} className="rounded-2xl border border-[#C9A961]/16 bg-[#E9E2D3]/38 p-5">
                  <Icon className="h-5 w-5 text-[#C9A961]" strokeWidth={1.35} />
                  <h2 className="mt-5 font-noto text-lg font-bold text-[#0F0F0F]">{section.title}</h2>
                  <p className="mt-3 font-noto text-sm font-normal leading-7 text-[#0B0B0B]">{section.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href="/Turki-Ghazi-CV.txt" download onClick={() => base44.analytics.track({ eventName: "cv_download_clicked", properties: { page: "cv" } })} className="flex items-center justify-center gap-3 rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]">
              <Download className="h-4 w-4" /> تحميل السيرة
            </a>
            <Link to="/booking" className="flex items-center justify-center gap-3 rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]">
              <Mail className="h-4 w-4" /> احجز مشروع
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}