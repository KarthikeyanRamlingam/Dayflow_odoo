import { apiClient } from './client';
import type { Role, UserProfile } from '../types/hrms';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: Role;
  employeeId?: number;
  fullName?: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  getMe: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>('/me');
    return data;
  },

  updateMe: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await apiClient.put<UserProfile>('/me', payload);
    return data;
  },
};
