import { apiClient } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../interfaces/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/login', payload);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/logout');
}
