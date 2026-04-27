import { apiClient } from './client';
import type { GeminiAccountSettings, UpdateGeminiAccountPayload } from '../interfaces/gemini-account';

export async function getGeminiAccountSettings(): Promise<GeminiAccountSettings> {
  const { data } = await apiClient.get<GeminiAccountSettings>('/gemini-account');
  return data;
}

export async function updateGeminiAccountSettings(payload: UpdateGeminiAccountPayload): Promise<GeminiAccountSettings> {
  const { data } = await apiClient.put<GeminiAccountSettings>('/gemini-account', payload);
  return data;
}
