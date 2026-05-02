import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

// Admin-only gate. If not authenticated, redirects to /admin/login?next=...
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/admin/login?next=${next}`, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, location, navigate]);

  if (isLoadingAuth) return <Spinner />;
  if (!isAuthenticated) return <Spinner />; // about to redirect

  return children ?? <Outlet />;
}
