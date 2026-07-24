import { apiClient } from './apiClient';

export async function getJobsRequest(params = {}) {
  const response = await apiClient.get("/jobs", {
    params,
  });

  return response.data.data;
}

export async function getMatchedJobsRequest(params = {}) {
  const response = await apiClient.get("/jobs/matched", {
    params,
  });

  return response.data.data;
}

export async function getJobMatchRequest(jobId) {
  const response = await apiClient.get(`/jobs/${jobId}/match`);

  return response.data.data.match;
}

export async function getJobByIdRequest(jobId) {
  const response = await apiClient.get(`/jobs/${jobId}`);

  return response.data.data;
}