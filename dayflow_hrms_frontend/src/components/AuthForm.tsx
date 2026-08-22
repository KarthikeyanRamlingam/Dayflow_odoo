import { useMemo, useState } from 'react';
import { authApi } from '../api/authApi';
import type { AuthRole, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: (token: string, role: AuthRole, username: string) => void;
}

const defaultLogin: LoginRequest = {
  username: '',
  password: '',
};

const defaultRegister: RegisterRequest = {
  username: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
};

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [loginForm, setLoginForm] = useState<LoginRequest>(defaultLogin);
  const [registerForm, setRegisterForm] = useState<RegisterRequest>(defaultRegister);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === 'login' ? 'Sign in to Dayflow' : 'Create your Dayflow account'),
    [mode],
  );

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(loginForm);
      onSuccess(response.token, response.role, response.username);
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.register(registerForm);
      onSuccess(response.token, response.role, response.username);
    } catch (err) {
      setError('Registration failed. Please check your fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>{title}</h2>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="auth-form">
          <label>
            Username
            <input
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="enter username"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="enter password"
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="auth-form">
          <label>
            Username
            <input
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              placeholder="choose username"
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              placeholder="name@company.com"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              placeholder="create password"
            />
          </label>
          <label>
            Role
            <select
              value={registerForm.role}
              onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value as AuthRole })}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="HR_MANAGER">HR Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        </form>
      )}
    </div>
  );
}
