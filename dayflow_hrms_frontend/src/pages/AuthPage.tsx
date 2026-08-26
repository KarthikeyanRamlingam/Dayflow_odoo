import React, { useState } from 'react';
import { Sparkles, Shield, UserCheck, User, ArrowRight } from 'lucide-react';
import { authApi } from '../api/authApi';
import type { Role } from '../types/hrms';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

interface AuthPageProps {
  onSuccess: (token: string, role: Role, username: string, fullName?: string) => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('EMPLOYEE');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser.trim() || !loginPass) {
      setError('Please enter your username/email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login({ username: loginUser.trim(), password: loginPass });
      onSuccess(res.token, res.role, res.username, res.fullName);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid credentials. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      });
      onSuccess(res.token, res.role, res.username, res.fullName);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed. The username or email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (user: string, pass: string) => {
    setMode('login');
    setLoginUser(user);
    setLoginPass(pass);
    setError('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 font-sans">
      {/* Subtle Background Lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-lg shadow-brand-500/25 mb-4 text-white">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">DAYFLOW</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">People Operations Suite</p>
        </div>

        {/* Card Shell */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-dropdown">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
              <span className="shrink-0 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Username or Email"
                placeholder="e.g. admin or john.doe"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                autoComplete="username"
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                autoComplete="current-password"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2 font-semibold shadow-sm"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Dashboard
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                label="Choose Username"
                placeholder="e.g. robert.smith"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
              />

              <Input
                label="Work Email"
                type="email"
                placeholder="robert@company.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />

              <Input
                label="Create Password"
                type="password"
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />

              <Select
                label="Role Permission"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as Role)}
                options={[
                  { label: 'Employee (Standard Portal)', value: 'EMPLOYEE' },
                  { label: 'HR Manager (Review & Payroll)', value: 'HR_MANAGER' },
                  { label: 'System Admin (Full Access)', value: 'ADMIN' },
                ]}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full mt-2 font-semibold shadow-sm"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Register & Get Started
              </Button>
            </form>
          )}

          {/* Quick Demo Fill Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Quick One-Click Demo Sign-in
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickFill('admin', 'dayflow123')}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-500 hover:bg-brand-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-brand-600">
                  <Shield className="w-3 h-3 text-brand-600" /> Admin
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">admin</p>
              </button>

              <button
                type="button"
                onClick={() => quickFill('hrmanager', 'dayflow123')}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-500 hover:bg-brand-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-brand-600">
                  <UserCheck className="w-3 h-3 text-brand-600" /> HR
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">hrmanager</p>
              </button>

              <button
                type="button"
                onClick={() => quickFill('john.doe', 'dayflow123')}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-brand-500 hover:bg-brand-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 group-hover:text-brand-600">
                  <User className="w-3 h-3 text-brand-600" /> Staff
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">john.doe</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
