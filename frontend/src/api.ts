import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export interface CarbonStatus {
  current: number;
  p30_threshold: number;
  is_green: boolean;
  forecast_summary: string;
}

export interface TaskResponse {
  request_id: string;
  status: string;
  priority: string;
  current_intensity: number | null;
  p30_threshold: number | null;
  emissions_saved: number;
  created_at: string;
  result?: { output: string };
}

export const getCarbonStatus = async () => {
  const response = await api.get<CarbonStatus>('/carbon');
  return response.data;
};

export const submitTask = async (priority: string, payload: any) => {
  const response = await api.post<TaskResponse>('/tasks', { priority, payload });
  return response.data;
};

export const getTaskStatus = async (requestId: string) => {
  const response = await api.get<TaskResponse>(`/tasks/${requestId}`);
  return response.data;
};
