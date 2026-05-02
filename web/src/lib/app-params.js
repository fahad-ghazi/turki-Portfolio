// Legacy compatibility stub.
// The original file read base44 app params from URL/localStorage.
// We no longer use base44; this file exists only so any stale import
// (e.g. `import { appParams } from '@/lib/app-params'`) doesn't break
// the build. New code should not depend on this.

export const appParams = {
  appId: null,
  token: null,
  fromUrl: null,
  functionsVersion: null,
  appBaseUrl: import.meta.env?.VITE_API_URL || '',
};
