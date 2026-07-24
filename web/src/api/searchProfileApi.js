import { apiClient } from "./apiClient";

export async function getSearchProfileRequest() {
  const response = await apiClient.get("/search-profile");
  return response.data.data.profile;
}

export async function createSearchProfileRequest(data) {
  const response = await apiClient.post("/search-profile", data);
  return response.data.data.profile;
}

export async function updateSearchProfileRequest(data) {
  const response = await apiClient.patch("/search-profile", data);
  return response.data.data.profile;
}

export async function deleteSearchProfileRequest() {
  const response = await apiClient.delete("/search-profile");
}