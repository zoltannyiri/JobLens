import { apiClient } from './apiClient';

export async function getSavedJobsRequest(params = {}) {
  const response = await apiClient.get('/saved-jobs', { params });

  return response.data.data;
}

export async function getSavedJobStatusRequest(jobId) {
  const response = await apiClient.get(`/saved-jobs/${jobId}/status`);

  return response.data.data;
}

export async function saveJobRequest(jobId) {
  const response = await apiClient.post(`/saved-jobs/${jobId}`);

  return response.data.data.savedJob;
}

export async function unsaveJobRequest(jobId) {
  const response = await apiClient.delete(`/saved-jobs/${jobId}`);

  return response.data;
}