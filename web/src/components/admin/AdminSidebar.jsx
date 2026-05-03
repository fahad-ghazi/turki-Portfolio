import React from "react";
import { BarChart3, FileText, Film, Image, Inbox, KeyRound, LayoutDashboard, Search, Settings, ShieldCheck, Sparkles, Users } from "lucide-react";

const tabs = [
  { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
  { id: "content", label: "المحتوى", icon: FileText },
  { id: "projects", label: "المشاريع", icon: Image },
  { id: "films", label: "الأفلام", icon: Film },
  { id: "characters", label: "الشخصيات", icon: Sparkles },
  { id: "blog", label: "المقالات", icon: FileText },
  { id: "sources", label: "المصادر", icon: Search },
  { id: "seo", label: "SEO", icon: Search },
  { id: "analytics", label: "التحليلات", icon: BarChart3 },
  { id: "leads", label: "الطلبات", icon: Users },
  { id: "errors", label: "الأخطاء", icon: Settings },
  { id: "media", label: "الوسائط", icon: Inbox },
  { id: "audit", label: "سجل الإدارة", icon: ShieldCheck },
  { id: "settings", label: "الإعدادات", icon: KeyRound },
];

export default function AdminSidebar({ activeTab, onChange }) {
  return (
    <aside className="fixed right-0 top-0 z-30 hidden h-screen w-72 border-l border-slate-200 bg-white px-4 py-6 lg:block" dir="rtl">
      <div className="px-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Panel</p>
        <h2 className="mt-2 text-xl font-bold text-slate-950">لوحة الإدارة</h2>
      </div>

      <nav className="mt-8 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-sm font-medium transition ${isActive ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.8} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}