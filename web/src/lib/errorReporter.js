// Lightweight client-side error reporter.
// Pipes runtime errors to /api/site-errors so the admin dashboard's
// error log fills automatically. Best-effort: never throws, never
// crashes the page, and de-dupes within a session to avoid loops.

const API_BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');
const seen = new Set();
const MAX_PER_SESSION = 30;

let installed = false;

function detectDevice() {
  if (typeof navigator === 'undefined') return 'unknown';
  return /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
}

function detectBrowser() {
  if (typeof navigator === 'undefined') return null;
  return navigator.userAgent.slice(0, 500);
}

function classifyType(message = '') {
  const m = String(message).toLowerCase();
  if (m.includes('failed to fetch') || m.includes('networkerror')) return 'failed_request';
  if (m.includes('image') && m.includes('decode')) return 'image_loading';
  if (m.includes('media') || m.includes('video')) return 'video_loading';
  return 'javascript';
}

export function reportError(payload) {
  if (!API_BASE) return;
  if (seen.size > MAX_PER_SESSION) return;
  const key = `${payload.page}|${payload.message}`;
  if (seen.has(key)) return;
  seen.add(key);

  try {
    const body = JSON.stringify({
      page: payload.page || (typeof window !== 'undefined' ? window.location.pathname : '/'),
      error_type: payload.error_type || classifyType(payload.message),
      message: String(payload.message || 'unknown').slice(0, 4000),
      device: detectDevice(),
      browser: detectBrowser(),
      severity: payload.severity || 'medium',
    });

    // Use sendBeacon when possible — it survives page unloads.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/api/site-errors`, blob);
      return;
    }

    fetch(`${API_BASE}/api/site-errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'include',
    }).catch(() => {});
  } catch {
    /* never let the reporter take down the page */
  }
}

export function installGlobalErrorHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    const message = event?.error?.message || event?.message || 'unknown error';
    reportError({ message });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    let message = 'unhandled rejection';
    if (typeof reason === 'string') {
      message = reason;
    } else if (reason?.message) {
      message = reason.message;
    } else {
      // JSON.stringify on a circular object throws TypeError — guard it.
      try { message = JSON.stringify(reason)?.slice(0, 500) || message; } catch { /* circular */ }
    }
    reportError({ message });
  });

  // Image/video load failures are common — capture them at the document level
  document.addEventListener(
    'error',
    (event) => {
      const target = event.target;
      if (!target || !(target instanceof HTMLElement)) return;
      const tag = target.tagName?.toLowerCase();
      if (tag === 'img' || tag === 'video' || tag === 'source') {
        const src = target.getAttribute('src') || target.getAttribute('data-src') || '';
        if (!src) return;
        reportError({
          message: `media load failed: ${src.slice(0, 300)}`,
          error_type: tag === 'img' ? 'image_loading' : 'video_loading',
          severity: 'low',
        });
      }
    },
    true,
  );
}
