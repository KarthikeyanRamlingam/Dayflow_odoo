import { apiClient } from './client';
import type { UserProfile } from '../types/hrms';

export const employeeApi = {
  list: async (search?: string): Promise<UserProfile[]> => {
    const params = search ? { search } : {};
    const { data } = await apiClient.get<UserProfile[]>('/employees', { params });
    return data;
  },

  getById: async (id: number): Promise<UserProfile> => {
    const { data } = await apiClient.get<UserProfile>(`/employees/${id}`);
    return data;
  },

  create: async (payload: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await apiClient.post<UserProfile>('/employees', payload);
    return data;
  },

  update: async (id: number, payload: Partial<UserProfile>): Promise<UserProfile> => {
    const { data } = await apiClient.put<UserProfile>(`/employees/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
