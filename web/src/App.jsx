import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";

import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SearchProfilePage from "./pages/SearchProfilePage";

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/search-profile" element={<SearchProfilePage />} />
      </Route>

      <Route path="/" element={
          <Navigate to="/dashboard" replace />
        }
      />

      <Route path="*" element={
          <Navigate to="/dashboard" replace />
        }
      />
    </Routes>
  );
}

export default App;