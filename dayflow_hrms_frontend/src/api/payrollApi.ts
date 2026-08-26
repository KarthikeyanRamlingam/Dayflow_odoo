import { apiClient } from './client';
import type { PayrollRecord } from '../types/hrms';

export interface CreatePayrollPayload {
  employeeId: number;
  basicSalary: number;
  allowances?: number;
  deductions?: number;
  payrollMonth: string;
  remarks?: string;
}

export const payrollApi = {
  getPayroll: async (): Promise<PayrollRecord[]> => {
    const { data } = await apiClient.get<PayrollRecord[]>('/payroll');
    return data;
  },

  createPayroll: async (payload: CreatePayrollPayload): Promise<PayrollRecord> => {
    const { data } = await apiClient.post<PayrollRecord>('/payroll', payload);
    return data;
  },
};
