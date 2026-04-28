import { apiClient } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../interfaces/auth';
import type { ApiResponse } from '../interfaces/common';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/login', payload);
  return data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/register', payload);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/logout');
}
