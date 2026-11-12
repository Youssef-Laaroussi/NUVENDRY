import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RequireAuth({ roles }: { roles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status" className="p-8">Loading your workspace…</p>;
  if (!user) return <Navigate to="/sign-in" state={{ from: location.pathname + location.search }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === 'instructor' ? '/merchant/overview' : '/app/overview'} replace />;
  return <Outlet />;
}
