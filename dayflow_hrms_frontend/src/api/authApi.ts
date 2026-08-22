import axios from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

const API_BASE_URL = 'http://localhost:8080/api';

export const authApi = {
  login: async (payload: LoginRequest) => {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, payload);
    return data;
  },
  register: async (payload: RegisterRequest) => {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, payload);
    return data;
  },
};
