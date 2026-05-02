// COMPATIBILITY SHIM
//
// The project used to import `base44` from this path. We have replaced
// the @base44/sdk with our own backend, but the import path is kept so
// existing consumers (entities.X.list/.create, auth.me, analytics.track)
// keep working unchanged.
//
// New code should import from '@/api/client' directly.

import { apiClient } from './client.js';

export const base44 = apiClient;
export default apiClient;
