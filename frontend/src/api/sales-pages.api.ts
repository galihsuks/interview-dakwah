import { apiClient } from './client';
import type { SalesPage, SalesPagePayload } from '../interfaces/sales-page';

export async function getSalesPages(): Promise<SalesPage[]> {
  const { data } = await apiClient.get<SalesPage[]>('/sales-pages');
  return data;
}

export async function createSalesPage(payload: SalesPagePayload): Promise<SalesPage> {
  const { data } = await apiClient.post<SalesPage>('/sales-pages', payload);
  return data;
}

export async function updateSalesPage(id: number, payload: SalesPagePayload): Promise<SalesPage> {
  const { data } = await apiClient.put<SalesPage>(`/sales-pages/${id}`, payload);
  return data;
}

export async function deleteSalesPage(id: number): Promise<void> {
  await apiClient.delete(`/sales-pages/${id}`);
}
