export type AuthRole = 'EMPLOYEE' | 'HR_MANAGER' | 'ADMIN';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  email: string;
  role: AuthRole;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: AuthRole;
}
