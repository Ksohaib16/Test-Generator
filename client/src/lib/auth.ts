import { apiRequest } from './queryClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  institutionId?: number;
}

export interface AuthResponse {
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  institutionName?: string;
  institutionAddress?: string;
  teacherId?: number;
  rollNumber?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await apiRequest('POST', '/api/auth/login', data);
  return res.json();
}

export async function register(data: RegisterData): Promise<{ userId: number; message: string }> {
  const res = await apiRequest('POST', '/api/auth/register', data);
  return res.json();
}

export async function logout(): Promise<void> {
  await apiRequest('POST', '/api/auth/logout');
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const res = await apiRequest('GET', '/api/auth/me');
  return res.json();
}
