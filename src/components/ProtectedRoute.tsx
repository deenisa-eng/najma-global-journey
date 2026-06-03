import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  const redirectPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/auth";

  if (loading) return null;

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  if (location.pathname.startsWith("/admin") && !isAdmin) {
    return <Navigate to="/portal" replace />;
  }

  if (location.pathname === "/portal" && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
