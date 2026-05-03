import React from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Eyebrow from "@/components/brand/Eyebrow";

// First-pass privacy policy — covers what the site actually does today:
// 1) booking-form lead capture
// 2) anonymous analytics events (no consent gate yet)
// 3) anonymous error reporting
// User should review with legal counsel before public launch and
// adjust the contact / company name fields below.

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-12 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="سياسة الخصوصية"
        description="كيف يجمع موقع تركي استديو البيانات ويستخدمها."
        canonical="/privacy"
        noIndex={true}
      />
      <Link
        to="/"
        className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]"
      >
        الرئيسية
      </Link>

      <div className="mx-auto max-w-3xl">
        <Eyebrow ar="الخصوصية" en="Privacy" />
        <h1 className="mt-5 font-noto text-5xl font-bold leading-tight md:text-6xl">
          سياسة الخصوصية
        </h1>
        <p className="mt-3 font-noto text-xs text-[#1A1A1A]/60">آخر تحديث: مايو 2026</p>

        <div className="mt-10 space-y-7 font-noto text-base leading-9 text-[#0B0B0B]">
          <section>
            <h2 className="font-noto text-2xl font-bold">1. ما الذي نجمعه</h2>
            <p className="mt-3">
              عند ملء نموذج الحجز نجمع: الاسم، البريد الإلكتروني، رقم الجوال (اختياري)، اسم
              الشركة (اختياري)، نوع المشروع، الميزانية التقريبية، والوقت المفضّل. نحفظ كذلك
              مصدر الزيارة وعنوان الصفحة لأغراض إحصائية.
            </p>
            <p className="mt-3">
              نسجّل أحداث استخدام مجهولة الهوية (مشاهدة صفحة، نقرة، إعجاب على عمل) دون أي
              معرّف شخصي. نسجّل أيضاً تجزئة (hash) آمنة لعنوان IP لمنع الإرسال المتكرر فقط،
              ولا نخزّن العنوان نفسه.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">2. لماذا نجمعها</h2>
            <ul className="mt-3 list-inside list-disc space-y-2">
              <li>الرد على طلبات المشاريع وحجز الاجتماعات.</li>
              <li>تحسين تجربة الموقع بناءً على إحصائيات مجهولة الهوية.</li>
              <li>اكتشاف الأخطاء التقنية وإصلاحها.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">3. مع من نشاركها</h2>
            <p className="mt-3">
              لا نبيع البيانات ولا نشاركها لأغراض تسويق. قد نستخدم مزوّدي خدمات تقنية
              (استضافة، بريد) ضمن حدود الأغراض أعلاه فقط.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">4. حقوقك</h2>
            <p className="mt-3">
              يحق لك طلب نسخة من بياناتك المسجّلة، أو حذفها، عبر مراسلتنا على البريد المذكور
              في صفحة <Link to="/contact" className="underline">التواصل</Link>.
            </p>
          </section>

          <section>
            <h2 className="font-noto text-2xl font-bold">5. الكوكيز</h2>
            <p className="mt-3">
              نستخدم كوكي تقنية واحدة لتسجيل دخول لوحة الإدارة فقط. لا نستخدم كوكيز إعلانية أو
              تتبّع طرف ثالث.
            </p>
          </section>

          <div className="rounded-2xl border border-[#C9A961]/20 bg-[#E9E2D3]/40 p-5 text-sm">
            <strong>ملاحظة للإدارة:</strong> هذه نسخة أولى. تحتاج مراجعة قانونية قبل الإطلاق
            العام، وإضافة بيانات الجهة المسؤولة (الاسم التجاري الرسمي + جهة التواصل
            المسجّلة).
          </div>
        </div>
      </div>
    </div>
  );
}
