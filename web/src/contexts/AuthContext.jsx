import { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { restoreSession } from "../api/apiClient";
import { loginRequest, logoutRequest, registerRequest } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const restoredUser = await restoreSession();

      if (isMounted) {
        setUser(restoredUser);
        setIsInitializing(false);
      }
    }
    
    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedInUser = await loginRequest(credentials);

    setUser(loggedInUser);

    return loggedInUser;
  }, []);

  const register = useCallback(async (data) => {
    const registeredUser = await registerRequest(data);

    setUser(registeredUser);

    return registeredUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    register,
    logout,
  }), [user, isInitializing, login, register, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("A useAuth csak AuthProvideren belül használható.");
  }

  return context;
}