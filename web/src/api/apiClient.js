import axios from "axios";
import { clearAccessToken, getAccessToken, setAccessToken } from "./tokenStore";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((response) => {
        const newAccessToken = response.data.data.accessToken;
        setAccessToken(newAccessToken);
        return newAccessToken;
      })
      .catch((error) => {
        clearAccessToken();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response.status === 401;

    const isRefreshRequest = originalRequest?.url?.includes("/auth/refresh");

    if (!isUnauthorized || !originalRequest || isRefreshRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  }
);

export async function restoreSession() {
  try {
    const response = await refreshClient.post("/auth/refresh");

    const { user, accessToken } = response.data.data;

    setAccessToken(accessToken);

    return user;
  } catch {
    clearAccessToken();
    return null;
  }
}