import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";

const GOLD = "#C9A961";

// First-pass terms — kept short and reasonable. Should be reviewed
// with legal counsel and adjusted to actual project-engagement scope.

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="الشروط والأحكام"
        description="شروط استخدام موقع تركي استديو."
        canonical="/terms"
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
          Terms
        </p>
        <h1 className="mt-5 font-noto text-5xl font-bold leading-tight md:text-6xl">
          الشروط والأحكام
        </h1>
        <p className="mt-3 font-noto text-xs text-[#1A1A1A]/60">آخر تحديث: مايو 2026</p>

        <div className="mt-10 space-y-7 font-noto text-base leading-9 text-[#0B0B0B]">
          <section>
            <h2 className="font-noto text-2xl font-bold">1. ملكية المحتوى</h2>
            <p className="mt-3">
              جميع الأعمال المعروضة على الموقع، بما فيها الصور والفيديوهات والنصوص، ملك لتركي
              غازي / تركي استديو ومحفوظة الحقوق. لا يُسمح بإعادة نشرها أو استخدامها تجارياً
              دون إذن مكتوب.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">2. طلبات المشاريع</h2>
            <p className="mt-3">
              ملء نموذج الحجز هو طلب أوّلي للتواصل، ولا يشكّل عقداً ملزماً. يبدأ التعاقد عند
              تبادل عرض رسمي وتأكيد الموافقة كتابياً.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">3. خدمات الذكاء الاصطناعي</h2>
            <p className="mt-3">
              الأعمال تنفذ باستخدام أدوات الذكاء الاصطناعي. نلتزم بأن تكون المخرجات مناسبة
              للاستخدام التجاري وفق الترخيص المتاح من المزوّدين، ونحرص على عدم تضمين عناصر
              محمية قانونياً دون إذن.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">4. حدود المسؤولية</h2>
            <p className="mt-3">
              نوفّر الموقع كما هو. لا نتحمّل مسؤولية عن انقطاع الخدمة، تأخر التحميل، أو نتائج
              قرارات تعتمد على المحتوى المعروض دون تواصل مباشر معنا.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">5. القانون المعمول به</h2>
            <p className="mt-3">
              تخضع هذه الشروط لأنظمة المملكة العربية السعودية، وتختصّ المحاكم السعودية في أي
              نزاع ينشأ عنها.
            </p>
          </section>

          <div className="rounded-2xl border border-[#C9A961]/20 bg-[#E9E2D3]/40 p-5 text-sm">
            <strong>ملاحظة للإدارة:</strong> هذه نسخة أولى. تحتاج مراجعة قانونية قبل الإطلاق
            العام.
          </div>
        </div>
      </div>
    </div>
  );
}
