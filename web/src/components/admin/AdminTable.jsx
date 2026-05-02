import React from "react";

export default function AdminTable({ items, columns, emptyText = "لا توجد بيانات بعد" }) {
  if (!items?.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">{emptyText}</div>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-right">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => <th key={column.key} className="px-4 py-3 text-xs font-semibold text-slate-500">{column.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                {columns.map((column) => <td key={column.key} className="px-4 py-3 text-xs text-slate-700">{column.render ? column.render(item) : item[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}