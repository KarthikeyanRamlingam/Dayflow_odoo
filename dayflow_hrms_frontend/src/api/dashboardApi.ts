import { apiClient } from './client';
import type { DashboardStats } from '../types/hrms';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard');
    return data;
  },
};
