import { apiClient } from './client';
import type { ApiResponse } from '../interfaces/common';
import type { GeminiAccountSettings, UpdateGeminiAccountPayload } from '../interfaces/gemini-account';

export async function getGeminiAccountSettings(): Promise<GeminiAccountSettings> {
  const { data } = await apiClient.get<ApiResponse<GeminiAccountSettings>>('/gemini-account');
  return data.data;
}

export async function updateGeminiAccountSettings(payload: UpdateGeminiAccountPayload): Promise<GeminiAccountSettings> {
  const { data } = await apiClient.put<ApiResponse<GeminiAccountSettings>>('/gemini-account', payload);
  return data.data;
}
