import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { ApiError } from '@/api/client';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(next, { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError && err.status === 401
          ? 'البريد أو كلمة المرور غير صحيحة'
          : 'تعذّر تسجيل الدخول. حاول مرّة أخرى.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        dir="rtl"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-medium text-slate-800">لوحة التحكّم</h1>
          <p className="text-sm text-slate-500">دخول المسؤول فقط</p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="block mb-1 text-slate-700">البريد الإلكتروني</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              dir="ltr"
            />
          </label>
          <label className="block text-sm">
            <span className="block mb-1 text-slate-700">كلمة المرور</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              dir="ltr"
            />
          </label>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !email || !password}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'جارٍ التحقق...' : 'دخول'}
        </button>
      </form>
    </div>
  );
}
