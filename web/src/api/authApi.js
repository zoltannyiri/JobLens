import { apiClient } from "./apiClient";
import { clearAccessToken, setAccessToken } from "./tokenStore";

export async function registerRequest(data) {
  const response = await apiClient.post("/auth/register", data);

  const { user, accessToken } = response.data.data;

  setAccessToken(accessToken);

  return user;
}

export async function loginRequest(data) {
  const response = await apiClient.post("/auth/login", data);

  const { user, accessToken } = response.data.data;

  setAccessToken(accessToken);

  return user;
}

export async function logoutRequest() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}

export async function getCurrentUserRequest() {
  const response = await apiClient.get("/auth/me");

  return response.data.data.user;
}