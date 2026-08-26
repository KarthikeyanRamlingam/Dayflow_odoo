import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if not already on auth page
      if (!window.location.pathname.includes('/auth') && localStorage.getItem('dayflow_token')) {
        localStorage.removeItem('dayflow_token');
        localStorage.removeItem('dayflow_role');
        localStorage.removeItem('dayflow_username');
        localStorage.removeItem('dayflow_email');
        localStorage.removeItem('dayflow_emp_id');
        localStorage.removeItem('dayflow_full_name');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);
