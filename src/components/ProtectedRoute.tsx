import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const redirectPath = location.pathname.startsWith("/admin") ? "/admin/login" : "/auth";

  if (loading) return null;

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
