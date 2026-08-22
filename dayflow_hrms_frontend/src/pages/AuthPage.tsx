import { useState } from 'react';
import { AuthForm } from '../components/AuthForm';
import type { AuthRole } from '../types/auth';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const handleSuccess = (token: string, role: AuthRole, username: string) => {
    localStorage.setItem('dayflow_token', token);
    localStorage.setItem('dayflow_role', role);
    localStorage.setItem('dayflow_username', username);
    window.location.href = '/';
  };

  return (
    <div className="auth-page">
      <div className="auth-toggle">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
          Login
        </button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
          Register
        </button>
      </div>
      <AuthForm mode={mode} onSuccess={handleSuccess} />
    </div>
  );
}
