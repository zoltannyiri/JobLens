import { apiClient } from './apiClient';

export async function importCareerjetJobsRequest(payload) {
  const response = await apiClient.post("/job-import/careerjet", payload);


  return response.data.data;
}