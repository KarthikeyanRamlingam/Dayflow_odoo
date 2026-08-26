import { apiClient } from './client';
import type { AttendanceRecord } from '../types/hrms';

export const attendanceApi = {
  getAttendance: async (): Promise<AttendanceRecord[]> => {
    const { data } = await apiClient.get<AttendanceRecord[]>('/attendance');
    return data;
  },

  checkIn: async (): Promise<AttendanceRecord> => {
    const { data } = await apiClient.post<AttendanceRecord>('/attendance/check-in');
    return data;
  },

  checkOut: async (): Promise<AttendanceRecord> => {
    const { data } = await apiClient.post<AttendanceRecord>('/attendance/check-out');
    return data;
  },
};
