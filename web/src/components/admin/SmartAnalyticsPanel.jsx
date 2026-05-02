import React from "react";
import { Clock, Eye, MapPin } from "lucide-react";
import { CATEGORIES } from "../feed/categoriesData";
import { FILMS } from "../films/filmsData";

const GOLD = "#C9A961";

const projectLookup = (() => {
  const entries = [];
  CATEGORIES.forEach((category) => {
    entries.push([category.id, category.title]);
    (category.items || []).forEach((item) => entries.push([item.id, item.title || item.alt]));
  });
  FILMS.forEach((film) => entries.push([film.id, film.title]));
  return Object.fromEntries(entries);
})();

function summarizeBy(events, keyGetter, valueGetter = () => 1) {
  return events.reduce((acc, event) => {
    const key = keyGetter(event);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + valueGetter(event);
    return acc;
  }, {});
}

function topEntries(summary, limit = 5) {
  return Object.entries(summary).sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function MetricList({ title, icon: Icon, items, suffix, emptyText }) {
  return (
    <div className="rounded-2xl border border-[#C9A961]/16 bg-[#F5F1E8] p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-noto text-sm font-medium text-[#1A1A1A]">{title}</h3>
        <Icon className="h-4 w-4 text-[#C9A961]" strokeWidth={1.4} />
      </div>
      {items.length ? (
        <div className="space-y-3">
          {items.map(([label, value], index) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-noto text-[#1A1A1A]/70">{projectLookup[label] || label}</span>
                <span className="font-cinzel text-[#C9A961]">{Math.round(value)}{suffix}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#E9E2D3]">
                <div className="h-full rounded-full bg-[#C9A961]" style={{ width: `${Math.min(100, (value / items[0][1]) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-noto text-xs leading-6 text-[#1A1A1A]/50">{emptyText}</p>
      )}
    </div>
  );
}

export default function SmartAnalyticsPanel({ events = [] }) {
  const visits = topEntries(summarizeBy(events.filter((event) => event.target_id), (event) => event.target_id));
  const timeByProject = topEntries(summarizeBy(events.filter((event) => event.target_id && event.session_duration), (event) => event.target_id, (event) => event.session_duration || 0));
  const timeByPage = topEntries(summarizeBy(events.filter((event) => event.page && event.session_duration), (event) => event.page, (event) => event.session_duration || 0));

  return (
    <div className="mb-6 rounded-[1.5rem] border border-[#C9A961]/18 bg-[#E9E2D3]/45 p-5">
      <div className="mb-5">
        <p className="font-cinzel text-[9px] tracking-[0.35em] uppercase" style={{ color: GOLD }}>Smart Analytics</p>
        <h2 className="mt-2 font-noto text-xl font-semibold text-[#1A1A1A]">أين يتفاعل الزوار أكثر؟</h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricList title="أكثر المشاريع زيارةً" icon={Eye} items={visits} suffix="" emptyText="ستظهر الزيارات هنا بعد تفاعل الزوار مع الأعمال." />
        <MetricList title="أطول وقت داخل المشاريع" icon={Clock} items={timeByProject} suffix="ث" emptyText="سيظهر وقت المشاهدة بعد تصفح الزوار للمشاريع." />
        <MetricList title="أكثر الصفحات احتفاظًا بالزوار" icon={MapPin} items={timeByPage} suffix="ث" emptyText="سيظهر وقت البقاء حسب الصفحة بعد بدء التتبع." />
      </div>
    </div>
  );
}