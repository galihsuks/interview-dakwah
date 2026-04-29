import { apiClient } from './client';
import type { ApiResponse } from '../interfaces/common';
import type { LogsResponseData } from '../interfaces/log';

export interface LogsQueryParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  keyword?: string;
  page?: number;
  per_page?: number;
}

export async function getLogs(params: LogsQueryParams): Promise<LogsResponseData> {
  const { data } = await apiClient.get<ApiResponse<LogsResponseData>>('/logs', { params });
  return data.data;
}
