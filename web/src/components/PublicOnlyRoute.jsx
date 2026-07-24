import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function PublicOnlyRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <main>
        <p> Betöltés...</p>
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