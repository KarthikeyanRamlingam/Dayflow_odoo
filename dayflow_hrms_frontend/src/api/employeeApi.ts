import axios from 'axios';
import type { Employee } from '../types/employee';

const API_BASE_URL = 'http://localhost:8080/api';

function getAuthHeader() {
  const token = localStorage.getItem('dayflow_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const employeeApi = {
  list: async (): Promise<Employee[]> => {
    const { data } = await axios.get<Employee[]>(`${API_BASE_URL}/employees`, {
      headers: getAuthHeader(),
    });
    return data;
  },

  getById: async (id: number): Promise<Employee> => {
    const { data } = await axios.get<Employee>(`${API_BASE_URL}/employees/${id}`, {
      headers: getAuthHeader(),
    });
    return data;
  },

  update: async (id: number, payload: Partial<Employee>): Promise<Employee> => {
    const { data } = await axios.put<Employee>(`${API_BASE_URL}/employees/${id}`, payload, {
      headers: getAuthHeader(),
    });
    return data;
  },
};
