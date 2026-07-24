import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      </main>
    );
  }

  if (isAuthenticated) {
    return (
      <Navigate to="/dashboard" replace />
    );
  }

  return <Outlet />;
}

export default PublicOnlyRoute;