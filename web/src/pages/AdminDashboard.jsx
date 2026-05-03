import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BarChart3, FileText, Image, Search, Settings, ShieldAlert, Users } from "lucide-react";
import AdminTable from "../components/admin/AdminTable";
import AdminQuickForm from "../components/admin/AdminQuickForm";
import SmartAnalyticsPanel from "../components/admin/SmartAnalyticsPanel";
import AdminSidebar from "../components/admin/AdminSidebar";
import ChangePasswordForm from "../components/admin/ChangePasswordForm";
import Seo from "@/components/seo/Seo";

const queries = {
  content: () => base44.entities.SiteContent.list("-updated_date", 50),
  projects: () => base44.entities.PortfolioProject.list("display_order", 50),
  films: () => base44.entities.Film.list("display_order", 50),
  blog: () => base44.entities.BlogPost.list("-updated_date", 50),
  sources: () => base44.entities.SourceIdea.list("-updated_date", 50),
  seo: () => base44.entities.SeoIssue.list("-created_date", 50),
  analytics: () => base44.entities.AnalyticsEvent.list("-created_date", 100),
  leads: () => base44.entities.LeadRequest.list("-created_date", 50),
  errors: () => base44.entities.SiteError.list("-created_date", 50),
  media: () => base44.entities.MediaAsset.list("-updated_date", 50),
};

const columns = {
  content: [{ key: "label", label: "العنصر" }, { key: "page", label: "الصفحة" }, { key: "type", label: "النوع" }, { key: "status", label: "الحالة" }],
  projects: [{ key: "title", label: "المشروع" }, { key: "work_type", label: "النوع" }, { key: "year", label: "السنة" }, { key: "publish_status", label: "النشر" }],
  films: [{ key: "title", label: "الفيلم" }, { key: "duration", label: "المدة" }, { key: "year", label: "السنة" }, { key: "video_url", label: "رابط الفيديو" }],
  blog: [{ key: "title", label: "المقال" }, { key: "slug", label: "Slug" }, { key: "publish_status", label: "الحالة" }, { key: "cta_text", label: "CTA" }],
  sources: [{ key: "source_title", label: "المصدر" }, { key: "source_type", label: "النوع" }, { key: "credibility", label: "الثقة" }, { key: "workflow_status", label: "المرحلة" }],
  seo: [{ key: "page_url", label: "الصفحة" }, { key: "issue_type", label: "المشكلة" }, { key: "severity", label: "الأهمية" }, { key: "status", label: "الحالة" }],
  analytics: [{ key: "event_name", label: "الحدث" }, { key: "event_type", label: "النوع" }, { key: "page", label: "الصفحة" }, { key: "device", label: "الجهاز" }],
  leads: [{ key: "name", label: "الاسم" }, { key: "request_type", label: "الطلب" }, { key: "company", label: "الشركة" }, { key: "status", label: "الحالة" }],
  errors: [{ key: "page", label: "الصفحة" }, { key: "error_type", label: "الخطأ" }, { key: "severity", label: "الأهمية" }, { key: "count", label: "التكرار" }],
  media: [{ key: "title", label: "الملف" }, { key: "media_type", label: "النوع" }, { key: "category", label: "القسم" }, { key: "optimization_status", label: "التحسين" }],
};

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["admin-user"],
    queryFn: () => base44.auth.me(),
  });

  // The /api/admin/me endpoint is itself gated by requireAdmin, so any
  // successful response means we're authenticated. The legacy "role"
  // field came from base44 and isn't part of our schema.
  const isAdmin = Boolean(user?.id);

  const { data = {}, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    enabled: isAdmin,
    queryFn: async () => {
      const entries = await Promise.all(Object.entries(queries).map(async ([key, fn]) => [key, await fn()]));
      return Object.fromEntries(entries);
    }
  });

  const createMutation = useMutation({ mutationFn: ({ entity, payload }) => base44.entities[entity].create(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] }) });

  const stats = [
    ["المحتوى", data.content?.length || 0, FileText],
    ["الأعمال", data.projects?.length || 0, Image],
    ["الأفلام", data.films?.length || 0, Image],
    ["المقالات", data.blog?.length || 0, Search],
    ["العملاء المحتملون", data.leads?.length || 0, Users],
    ["الأحداث", data.analytics?.length || 0, BarChart3],
    ["مشاكل SEO", data.seo?.filter((x) => x.status !== "resolved")?.length || 0, Settings],
  ];

  const renderForm = () => {
    if (tab === "projects") return <AdminQuickForm title="إضافة مشروع" fields={[{ name: "title", label: "العنوان" }, { name: "work_type", label: "نوع العمل" }, { name: "year", label: "السنة" }, { name: "short_description", label: "وصف مختصر", type: "textarea" }]} onSubmit={(payload) => createMutation.mutateAsync({ entity: "PortfolioProject", payload })} />;
    if (tab === "films") return <AdminQuickForm title="إضافة فيلم أو رابط فيديو" fields={[{ name: "title", label: "اسم الفيلم" }, { name: "video_url", label: "رابط الفيديو" }, { name: "thumbnail", label: "رابط صورة البوستر" }, { name: "duration", label: "المدة" }, { name: "year", label: "السنة" }, { name: "display_order", label: "الترتيب", type: "number" }, { name: "description", label: "وصف الفيلم", type: "textarea" }]} onSubmit={(payload) => createMutation.mutateAsync({ entity: "Film", payload: { ...payload, display_order: Number(payload.display_order || 0) } })} />;
    if (tab === "blog") return <AdminQuickForm title="إنشاء مقال" fields={[{ name: "title", label: "العنوان" }, { name: "slug", label: "Slug" }, { name: "meta_description", label: "Meta description" }, { name: "executive_summary", label: "ملخص تنفيذي", type: "textarea" }]} onSubmit={(payload) => createMutation.mutateAsync({ entity: "BlogPost", payload })} />;
    if (tab === "sources") return <AdminQuickForm title="إضافة مصدر" fields={[{ name: "source_title", label: "عنوان المصدر" }, { name: "source_url", label: "الرابط" }, { name: "summary", label: "ملخص", type: "textarea" }]} onSubmit={(payload) => createMutation.mutateAsync({ entity: "SourceIdea", payload })} />;
    if (tab === "media") return <AdminQuickForm title="إضافة ملف وسائط" fields={[{ name: "title", label: "العنوان" }, { name: "file_url", label: "رابط الملف" }, { name: "category", label: "القسم" }, { name: "alt_text", label: "ALT text" }]} onSubmit={(payload) => createMutation.mutateAsync({ entity: "MediaAsset", payload })} />;
    return null;
  };

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white" dir="rtl">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6" dir="rtl">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-slate-500" strokeWidth={1.6} />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">غير مصرح بالدخول</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">هذه الصفحة مخصصة للمسؤول فقط ولا يمكن عرض بيانات الإدارة لغير المخولين.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-950" dir="rtl">
      <Seo title="لوحة الإدارة" canonical="/admin" noIndex={true} />
      <AdminSidebar activeTab={tab} onChange={setTab} />

      <main className="min-h-screen px-5 py-6 lg:mr-72 lg:px-8">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">لوحة الإدارة</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">إدارة المحتوى، المشاريع، الأفلام، الطلبات، التحليلات، ومتابعة حالة الموقع من مكان واحد.</p>
        </header>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([title, value, Icon]) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">{title}</p>
                <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.7} />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 lg:hidden">
          <select value={tab} onChange={(event) => setTab(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950">
            {Object.keys(columns).concat("overview").filter((value, index, array) => array.indexOf(value) === index).map((key) => (
              <option key={key} value={key}>{key === "overview" ? "نظرة عامة" : key}</option>
            ))}
          </select>
        </div>

        {tab === "settings" ? (
          <section className="mt-6 max-w-2xl">
            <ChangePasswordForm />
          </section>
        ) : (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            {isLoading ? (
              <div className="py-16 text-center text-sm text-slate-500">جاري تحميل بيانات الإدارة...</div>
            ) : (
              <>
                {tab === "overview" && <SmartAnalyticsPanel events={data.analytics || []} />}
                <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                  <div>{renderForm() || <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm leading-8 text-slate-600">اختر قسمًا قابلًا للإضافة لإدارة المحتوى مباشرة. تعرض الأقسام الأخرى مؤشرات الأداء، المشاكل، والطلبات.</div>}</div>
                  <AdminTable items={tab === "overview" ? data.analytics || [] : data[tab] || []} columns={tab === "overview" ? columns.analytics : columns[tab]} />
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}