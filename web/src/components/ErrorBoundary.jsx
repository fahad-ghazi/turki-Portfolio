import { Component } from 'react';
import { reportError } from '@/lib/errorReporter';

// React-level catch-all. Anything thrown during render lands here,
// gets reported to /api/site-errors, and the user sees a graceful
// fallback instead of a white page.

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    reportError({
      message: `${error?.name || 'Error'}: ${error?.message || 'unknown'}\n${info?.componentStack || ''}`.slice(
        0,
        4000,
      ),
      severity: 'high',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#F5F1E8] px-6 text-[#1A1A1A]"
      >
        <div className="max-w-md text-center space-y-5">
          <h1 className="font-cormorant text-5xl font-bold leading-tight">حدث خطأ غير متوقع</h1>
          <p className="font-noto text-base leading-8 text-[#1A1A1A]/70">
            نسخة من الخطأ وُصِلت تلقائياً إلى لوحة التحكم. حاول تحديث الصفحة، وإذا تكرّر المشكل
            تواصل معنا.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="rounded-full border-2 border-[#1A1A1A] bg-[#F5F1E8] px-7 py-3 font-noto text-base font-bold text-[#1A1A1A] transition hover:border-[#C9A961]"
            >
              تحديث الصفحة
            </button>
            <a
              href="/"
              className="rounded-full border-2 border-[#1A1A1A] bg-[#1A1A1A] px-7 py-3 font-noto text-base font-bold text-[#F5F1E8] transition hover:bg-[#0f0f0f]"
            >
              العودة للرئيسية
            </a>
          </div>
        </div>
      </div>
    );
  }
}
