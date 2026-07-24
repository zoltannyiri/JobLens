import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <main>
        <p> Betöltés...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace />
    )
  }

  return <Outlet />;
}

export default ProtectedRoute;