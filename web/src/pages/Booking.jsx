import React, { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/api/client";
import { Calendar, Mail } from "lucide-react";
import Seo from "@/components/seo/Seo";

export default function Booking() {
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", request_type: "meeting", project_type: "", approx_budget: "", preferred_time: "", message: "", website: "" });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.website) return;
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    const lastSubmit = Number(localStorage.getItem("last_lead_submit") || 0);
    if (Date.now() - lastSubmit < 60000) {
      setError("تم إرسال طلب مؤخرًا. يرجى المحاولة بعد دقيقة.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { website, ...payload } = form;
      await apiClient.entities.LeadRequest.create({ ...payload, source: document.referrer || "direct", source_page: window.location.pathname });
      apiClient.analytics.track({ eventName: "booking_form_submitted", properties: { request_type: form.request_type, source_page: window.location.pathname } });
      localStorage.setItem("last_lead_submit", String(Date.now()));
      setSaved(true);
    } catch {
      setError("تعذر إرسال الطلب الآن. حاول مرة أخرى بعد قليل.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] px-6 py-10 text-[#1A1A1A]" dir="rtl">
      <Seo
        title="احجز مشروع"
        description="نموذج طلب مشروع أو حجز اجتماع مع تركي غازي. شارك التفاصيل ونتواصل معك."
        canonical="/booking"
        noIndex={true}
      />
      <Link to="/" className="fixed right-6 top-6 z-30 flex min-h-[44px] items-center rounded-full border border-[#C9A961]/45 bg-[#1A1A1A] px-5 py-2 font-noto text-sm font-bold text-[#F5F1E8] transition hover:text-[#C9A961]">الرئيسية</Link>
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#C9A961]/16 bg-[#F5F1E8] p-7 md:p-12">
        <Calendar className="h-6 w-6 text-[#C9A961]" strokeWidth={1.4} />
        <h1 className="mt-5 font-noto text-5xl font-bold leading-tight md:text-6xl">احجز مكالمة أو اطلب مشروع</h1>
        <p className="mt-4 max-w-2xl font-noto text-base leading-9 text-[#0B0B0B]">شارك تفاصيل مشروعك وسنراجع الطلب للتواصل معك بالطريقة المناسبة.</p>
        {saved ? (
          <div className="mt-8 rounded-2xl border border-[#C9A961]/20 bg-[#E9E2D3]/40 p-6 font-noto text-sm text-[#1A1A1A]/70">تم إرسال الطلب بنجاح.</div>
        ) : (
          <form onSubmit={submit} className="mt-8 grid gap-3 md:grid-cols-2">
            <input tabIndex="-1" autoComplete="off" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="hidden" aria-hidden="true" />
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-noto text-sm text-red-700 md:col-span-2">{error}</div>}
            {["name", "email", "phone", "company", "project_type", "approx_budget", "preferred_time"].map((field) => (
              <input key={field} required={field === "name" || field === "email"} placeholder={{ name: "الاسم", email: "البريد", phone: "الجوال", company: "الشركة", project_type: "نوع المشروع", approx_budget: "الميزانية التقريبية", preferred_time: "الموعد المقترح" }[field]} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="rounded-xl border border-[#1A1A1A]/22 bg-[#E9E2D3]/55 px-4 py-3.5 font-noto text-base text-[#0F0F0F] outline-none focus:border-[#C9A961]" />
            ))}
            <select value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })} className="rounded-xl border border-[#1A1A1A]/22 bg-[#E9E2D3]/55 px-4 py-3.5 font-noto text-base text-[#0F0F0F] outline-none focus:border-[#C9A961]">
              <option value="meeting">حجز اجتماع</option><option value="call">طلب مكالمة</option><option value="quote">طلب عرض سعر</option><option value="collaboration">طلب تعاون</option><option value="job_opportunity">فرصة عمل</option>
            </select>
            <textarea placeholder="الرسالة" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-36 rounded-xl border border-[#1A1A1A]/22 bg-[#E9E2D3]/55 px-4 py-3.5 font-noto text-base text-[#0F0F0F] outline-none focus:border-[#C9A961] md:col-span-2" />
            <button disabled={isSubmitting} className="flex items-center justify-center gap-3 rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-8 py-3.5 font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961] disabled:cursor-not-allowed disabled:opacity-60 md:w-fit"><Mail className="h-5 w-5" /> {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}</button>
          </form>
        )}
      </div>
    </div>
  );
}