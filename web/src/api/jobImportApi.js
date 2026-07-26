import { apiClient } from './apiClient';

export async function importCareerjetJobsRequest(payload) {
  const response = await apiClient.post("/job-import/careerjet/pages", payload);


  return response.data.data;
}

export async function importJoobleJobsRequest(payload) {
  const response = await apiClient.post("/job-import/jooble/pages", payload);

  return response.data.data;
}