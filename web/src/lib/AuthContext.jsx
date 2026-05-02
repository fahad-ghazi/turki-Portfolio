import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient, ApiError, setAdminAuthState } from '@/api/client';

// Public site has no user accounts. Auth is admin-only.
// This context exposes the admin's identity (or null) plus loading state,
// and is used by the admin dashboard's ProtectedRoute.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refresh = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const me = await apiClient.auth.me();
      setAdmin(me);
      setAdminAuthState(true);
    } catch (err) {
      setAdmin(null);
      setAdminAuthState(false);
      // 401/403 are expected for any non-admin visitor — don't surface as an error.
      if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 403)) {
        setAuthError(err);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async ({ email, password }) => {
    const me = await apiClient.auth.login({ email, password });
    setAdmin(me);
    setAdminAuthState(true);
    return me;
  }, []);

  const logout = useCallback(async (redirect = '/') => {
    try {
      await apiClient.auth.logout();
    } finally {
      setAdmin(null);
      setAdminAuthState(false);
      if (typeof window !== 'undefined' && redirect) {
        window.location.assign(redirect);
      }
    }
  }, []);

  const navigateToLogin = useCallback(() => {
    if (typeof window === 'undefined') return;
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.assign(`/admin/login?next=${next}`);
  }, []);

  const value = {
    admin,
    isAuthenticated: !!admin,
    isLoadingAuth,
    isLoadingPublicSettings: false, // legacy field — kept so old code reading it doesn't crash
    authError,
    login,
    logout,
    refresh,
    // Legacy aliases for old call sites:
    user: admin,
    navigateToLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
