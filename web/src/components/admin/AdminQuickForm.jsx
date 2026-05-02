import React, { useState } from "react";

export default function AdminQuickForm({ title, fields, onSubmit, submitLabel = "حفظ" }) {
  const initial = fields.reduce((acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }), {});
  const [form, setForm] = useState(initial);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(initial);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          field.type === "textarea" ? (
            <textarea key={field.name} placeholder={field.label} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="min-h-28 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950 md:col-span-2" />
          ) : (
            <input key={field.name} type={field.type || "text"} placeholder={field.label} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none focus:border-slate-950" />
          )
        ))}
      </div>
      <button className="mt-5 rounded-xl bg-slate-950 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">{submitLabel}</button>
    </form>
  );
}