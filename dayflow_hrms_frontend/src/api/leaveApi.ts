import { apiClient } from './client';
import type { LeaveRecord, LeaveStatus } from '../types/hrms';

export interface ApplyLeavePayload {
  startDate: string;
  endDate: string;
  type: string;
  reason: string;
}

export interface LeaveDecisionPayload {
  reviewComment?: string;
}

export const leaveApi = {
  getLeaves: async (): Promise<LeaveRecord[]> => {
    const { data } = await apiClient.get<LeaveRecord[]>('/leaves');
    return data;
  },

  applyLeave: async (payload: ApplyLeavePayload): Promise<LeaveRecord> => {
    const { data } = await apiClient.post<LeaveRecord>('/leaves', payload);
    return data;
  },

  decideLeave: async (
    id: number,
    status: LeaveStatus,
    payload?: LeaveDecisionPayload
  ): Promise<LeaveRecord> => {
    const { data } = await apiClient.patch<LeaveRecord>(
      `/leaves/${id}/${status}`,
      payload || {}
    );
    return data;
  },
};
