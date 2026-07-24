import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest, logoutRequest, getCurrentUserRequest, registerRequest } from "../api/authApi";
import { restoreSession } from "../api/apiClient";
import { clearAccessToken, setAccessToken } from "../api/tokenStore"

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] =
    useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const accessToken = await restoreSession();

        if (!accessToken) {
          return;
        }

        const currentUser =
          await getCurrentUserRequest();

        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        clearAccessToken();

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login(credentials) {
    const loggedInUser =
      await loginRequest(credentials);

    setUser(loggedInUser);

    return loggedInUser;
  }

  async function register(data) {
    const registeredUser =
      await registerRequest(data);

    setUser(registeredUser);

    return registeredUser;
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      logout,
    }),
    [user, isInitializing]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "A useAuth csak AuthProvideren belül használható."
    );
  }

  return context;
}

export default AuthContext;