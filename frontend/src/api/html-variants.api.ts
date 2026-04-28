import { apiClient } from './client';
import type { ApiResponse } from '../interfaces/common';
import type { HtmlVariantDetail } from '../interfaces/html-variant';

export async function getHtmlVariantById(id: number): Promise<HtmlVariantDetail> {
  const { data } = await apiClient.get<ApiResponse<HtmlVariantDetail>>(`/html-variants/${id}`);
  return data.data;
}

export async function regenerateHtmlVariantSection(id: number, payload: { section: string; prompt: string }): Promise<HtmlVariantDetail> {
  const { data } = await apiClient.put<ApiResponse<HtmlVariantDetail>>(`/html-variants/${id}/regenerate-section`, payload);
  return data.data;
}
