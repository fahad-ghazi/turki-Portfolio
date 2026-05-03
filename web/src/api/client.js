// turki-vision-flow API client.
// Replaces @base44/sdk. Exposes the same shape as the old `base44`
// object so consumer code (entities.X.list/.create/.update/.delete,
// auth.me/.logout, analytics.track) works without rewrites.

const API_BASE = (import.meta.env?.VITE_API_URL || '').replace(/\/$/, '');

class ApiError extends Error {
  constructor(status, body, message) {
    super(message || `HTTP ${status}`);
    this.status = status;
    this.data = body;
  }
}

async function request(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const init = {
    method: opts.method || 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  };
  if (opts.body !== undefined) {
    init.body = typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new ApiError(0, null, `Network error: ${err.message}`);
  }

  if (res.status === 204) return null;

  let body = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    body = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const msg = body?.error?.message || res.statusText || `HTTP ${res.status}`;
    throw new ApiError(res.status, body, msg);
  }
  return body;
}

// ─────────────────────────────────────────────────────────
// Public-write entity routes — these are how anonymous
// visitors create rows (lead, analytics, error, like).
// ─────────────────────────────────────────────────────────
const PUBLIC_CREATE_ROUTES = {
  LeadRequest: '/api/leads',
  AnalyticsEvent: '/api/analytics/events',
  ProjectInteraction: '/api/interactions',
  SiteError: '/api/site-errors',
};

// Public-read entity routes — used when no admin is logged in.
// Admin requests use the admin/entities endpoint instead.
const PUBLIC_LIST_ROUTES = {
  Film: '/api/films',
  PortfolioProject: '/api/portfolio-projects',
  BlogPost: '/api/blog',
  SiteContent: '/api/site-content',
};

// Frontend entity name → admin URL slug
const ADMIN_ENTITY_SLUG = {
  PortfolioProject: 'portfolio_projects',
  Film: 'films',
  BlogPost: 'blog_posts',
  MediaAsset: 'media_assets',
  SiteContent: 'site_content',
  LeadRequest: 'lead_requests',
  ProjectInteraction: 'project_interactions',
  AnalyticsEvent: 'analytics_events',
  SiteError: 'site_errors',
  SeoIssue: 'seo_issues',
  SourceIdea: 'source_ideas',
};

// Auth state — best-effort tracking so list() chooses public vs admin.
// Cookie is httpOnly so we can't inspect it; we set this flag from
// AuthContext after a successful /admin/me check.
let isAdminAuthed = false;
export function setAdminAuthState(value) {
  isAdminAuthed = !!value;
}

function buildEntity(name) {
  return {
    /**
     * list(orderBy, limit) — preserves the base44 SDK signature.
     * Admin reads include drafts; public reads return only published rows.
     */
    async list(orderBy = '-created_date', limit = 50) {
      if (isAdminAuthed) {
        const slug = ADMIN_ENTITY_SLUG[name];
        if (!slug) throw new ApiError(0, null, `Unknown entity: ${name}`);
        const qs = new URLSearchParams({ order_by: String(orderBy), limit: String(limit) });
        const res = await request(`/api/admin/entities/${slug}?${qs}`);
        return res?.items ?? res;
      }
      const publicPath = PUBLIC_LIST_ROUTES[name];
      if (publicPath) {
        const qs = new URLSearchParams({ limit: String(limit) });
        return request(`${publicPath}?${qs}`);
      }
      // Public consumer asking for a non-public entity → empty (avoid leaking data)
      return [];
    },

    async get(id) {
      if (isAdminAuthed) {
        const slug = ADMIN_ENTITY_SLUG[name];
        return request(`/api/admin/entities/${slug}/${encodeURIComponent(id)}`);
      }
      const publicPath = PUBLIC_LIST_ROUTES[name];
      if (publicPath && name === 'PortfolioProject') {
        return request(`${publicPath}/${encodeURIComponent(id)}`);
      }
      if (publicPath && name === 'BlogPost') {
        return request(`/api/blog/${encodeURIComponent(id)}`);
      }
      throw new ApiError(403, null, `Cannot read ${name} without admin auth`);
    },

    async create(payload) {
      // Public-write path takes precedence — anonymous visitors must be able to submit
      const publicPath = PUBLIC_CREATE_ROUTES[name];
      if (publicPath) {
        return request(publicPath, { method: 'POST', body: payload });
      }
      const slug = ADMIN_ENTITY_SLUG[name];
      if (!slug) throw new ApiError(0, null, `Unknown entity: ${name}`);
      return request(`/api/admin/entities/${slug}`, { method: 'POST', body: payload });
    },

    async update(id, payload) {
      const slug = ADMIN_ENTITY_SLUG[name];
      if (!slug) throw new ApiError(0, null, `Unknown entity: ${name}`);
      return request(`/api/admin/entities/${slug}/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: payload,
      });
    },

    async delete(id) {
      const slug = ADMIN_ENTITY_SLUG[name];
      if (!slug) throw new ApiError(0, null, `Unknown entity: ${name}`);
      return request(`/api/admin/entities/${slug}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    },
  };
}

const entities = new Proxy(
  {},
  {
    get(target, prop) {
      if (typeof prop !== 'string') return undefined;
      if (!target[prop]) target[prop] = buildEntity(prop);
      return target[prop];
    },
  },
);

// ─────────────────────────────────────────────────────────
// Auth (admin only)
// ─────────────────────────────────────────────────────────
const auth = {
  async me() {
    return request('/api/admin/me');
  },
  async login({ email, password }) {
    const result = await request('/api/admin/login', {
      method: 'POST',
      body: { email, password },
    });
    isAdminAuthed = true;
    return result;
  },
  async logout(redirect) {
    try {
      await request('/api/admin/logout', { method: 'POST' });
    } finally {
      isAdminAuthed = false;
      if (redirect && typeof window !== 'undefined') {
        window.location.assign(redirect);
      }
    }
  },
  async changePassword({ currentPassword, newPassword }) {
    return request('/api/admin/me/password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    });
  },
  // Compat shim: old base44 SDK had redirectToLogin. We just go to /admin/login.
  redirectToLogin(returnTo) {
    if (typeof window === 'undefined') return;
    const next = returnTo ? `?next=${encodeURIComponent(returnTo)}` : '';
    window.location.assign(`/admin/login${next}`);
  },
};

// ─────────────────────────────────────────────────────────
// Analytics — best-effort fire-and-forget
// ─────────────────────────────────────────────────────────
const analytics = {
  async track({ eventName, properties = {} } = {}) {
    if (!eventName) return;
    const event = {
      event_name: eventName,
      event_type: properties.event_type || 'button_click',
      page: properties.page ?? (typeof window !== 'undefined' ? window.location.pathname : null),
      section: properties.section,
      target_id: properties.target_id,
      referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : null,
      device:
        typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
          ? 'mobile'
          : 'desktop',
      browser: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
      privacy_consent: false,
    };
    try {
      await request('/api/analytics/events', { method: 'POST', body: event });
    } catch (err) {
      // Analytics failures should never crash the UI
      if (import.meta.env?.DEV) console.warn('[analytics] track failed', err);
    }
  },
};

export const apiClient = { entities, auth, analytics };
export { ApiError };
export default apiClient;
