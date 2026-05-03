import React, { useState } from "react";
import { apiClient, ApiError } from "@/api/client";
import { KeyRound, CheckCircle2 } from "lucide-react";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.");
      return;
    }
    if (newPassword !== confirm) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    if (newPassword === currentPassword) {
      setError("كلمة المرور الجديدة يجب أن تختلف عن الحالية.");
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.auth.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("كلمة المرور الحالية غير صحيحة.");
      } else if (err instanceof ApiError && err.data?.error?.code === "SAME_PASSWORD") {
        setError("كلمة المرور الجديدة يجب أن تختلف عن الحالية.");
      } else {
        setError("تعذّر تغيير الكلمة الآن. حاول مرّة أخرى.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" dir="rtl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <KeyRound className="h-5 w-5 text-slate-700" strokeWidth={1.7} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950">تغيير كلمة المرور</h2>
          <p className="mt-1 text-xs text-slate-500">
            بعد التغيير، اطلب من مدير السيرفر حذف <code className="rounded bg-slate-100 px-1">ADMIN_PASSWORD</code> من Dokploy env.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="block mb-1.5 font-medium text-slate-700">كلمة المرور الحالية</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            dir="ltr"
          />
        </label>

        <label className="block text-sm">
          <span className="block mb-1.5 font-medium text-slate-700">كلمة المرور الجديدة</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            dir="ltr"
          />
        </label>

        <label className="block text-sm">
          <span className="block mb-1.5 font-medium text-slate-700">تأكيد كلمة المرور الجديدة</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            dir="ltr"
          />
        </label>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            تم تغيير كلمة المرور بنجاح.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !currentPassword || !newPassword || !confirm}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {submitting ? "جارٍ الحفظ..." : "تغيير الكلمة"}
        </button>
      </form>
    </div>
  );
}
