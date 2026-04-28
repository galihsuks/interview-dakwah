import { apiClient } from './client';
import type { ApiResponse } from '../interfaces/common';
import type { SalesPage, SalesPagePayload } from '../interfaces/sales-page';

export async function getSalesPages(): Promise<SalesPage[]> {
  const { data } = await apiClient.get<ApiResponse<SalesPage[]>>('/sales-pages');
  return data.data;
}

export async function createSalesPage(payload: SalesPagePayload): Promise<SalesPage> {
  const { data } = await apiClient.post<ApiResponse<SalesPage>>('/sales-pages', payload);
  return data.data;
}

export async function updateSalesPage(id: number, payload: SalesPagePayload): Promise<SalesPage> {
  const { data } = await apiClient.put<ApiResponse<SalesPage>>(`/sales-pages/${id}`, payload);
  return data.data;
}

export async function deleteSalesPage(id: number): Promise<void> {
  await apiClient.delete(`/sales-pages/${id}`);
}
