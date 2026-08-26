import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { 
  Role, 
  UserProfile, 
  DashboardStats, 
  AttendanceRecord, 
  LeaveRecord, 
  PayrollRecord, 
  LeaveStatus, 
  AppNotification 
} from './types/hrms';
import { authApi } from './api/authApi';
import { employeeApi } from './api/employeeApi';
import { attendanceApi } from './api/attendanceApi';
import { leaveApi } from './api/leaveApi';
import { payrollApi } from './api/payrollApi';
import { dashboardApi } from './api/dashboardApi';

import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';

import { AuthPage } from './pages/AuthPage';
import { OverviewPage } from './pages/OverviewPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export function MainApp() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('dayflow_token'));
  const [role, setRole] = useState<Role>((localStorage.getItem('dayflow_role') as Role) || 'EMPLOYEE');
  const [username, setUsername] = useState<string>(localStorage.getItem('dayflow_username') || '');
  const [fullName, setFullName] = useState<string>(localStorage.getItem('dayflow_full_name') || '');

  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Main state caches
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingClock, setLoadingClock] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  // Notifications & Toast State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(`dayflow_notifs_${username || 'guest'}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auto-hide toast after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Persist notifications
  useEffect(() => {
    if (username) {
      localStorage.setItem(`dayflow_notifs_${username}`, JSON.stringify(notifications));
    }
  }, [notifications, username]);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({
      id: String(Date.now()),
      title,
      message,
      type,
    });
  }, []);

  const pushNotification = useCallback((
    title: string, 
    message: string, 
    type: AppNotification['type'] = 'system', 
    actionTab?: NavTab
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false,
      actionTab,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  }, []);

  const handleAuthSuccess = (newToken: string, newRole: Role, newUsername: string, newFullName?: string) => {
    localStorage.setItem('dayflow_token', newToken);
    localStorage.setItem('dayflow_role', newRole);
    localStorage.setItem('dayflow_username', newUsername);
    if (newFullName) localStorage.setItem('dayflow_full_name', newFullName);

    setToken(newToken);
    setRole(newRole);
    setUsername(newUsername);
    if (newFullName) setFullName(newFullName);

    // Initial welcome notification
    pushNotification(
      'Welcome to Dayflow HRMS',
      `Signed in successfully as ${newUsername} (${newRole}).`,
      'system',
      'overview'
    );
    showToast('Signed In', `Welcome back, ${newFullName || newUsername}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setProfile(null);
    setStats(null);
    setEmployees([]);
    setAttendance([]);
    setLeaves([]);
    setPayroll([]);
    setNotifications([]);
    setToast(null);
  };

  // Global loader
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorBanner('');
    try {
      const [p, s, att, l, pay] = await Promise.all([
        authApi.getMe().catch(() => null),
        dashboardApi.getStats().catch(() => null),
        attendanceApi.getAttendance().catch(() => []),
        leaveApi.getLeaves().catch(() => []),
        payrollApi.getPayroll().catch(() => []),
      ]);

      if (p) {
        setProfile(p);
        setFullName(`${p.firstName} ${p.lastName}`.trim());
      }
      if (s) setStats(s);
      setAttendance(att);
      setLeaves(l);
      setPayroll(pay);

      // Load employees directory
      const empList = await employeeApi.list().catch(() => []);
      setEmployees(empList);

      // Seed initial contextual notifications if empty
      setNotifications((prev) => {
        if (prev.length > 0) return prev;
        const initial: AppNotification[] = [
          {
            id: 'init-1',
            title: 'System Initialized',
            message: 'Dayflow HRMS connected and synced with backend on port 8080.',
            timestamp: 'Today',
            type: 'system',
            read: false,
            actionTab: 'overview',
          },
        ];

        if (role === 'ADMIN' || role === 'HR_MANAGER') {
          const pending = l.filter((req) => req.status === 'PENDING');
          if (pending.length > 0) {
            initial.push({
              id: 'init-leaves',
              title: `${pending.length} Pending Leave Request${pending.length > 1 ? 's' : ''}`,
              message: `Employees have submitted ${pending.length} time-off request(s) awaiting your review.`,
              timestamp: 'Today',
              type: 'leave',
              read: false,
              actionTab: 'leaves',
            });
          }
        } else {
          const approved = l.filter((req) => req.status === 'APPROVED');
          if (approved.length > 0) {
            initial.push({
              id: 'init-emp-leave',
              title: 'Leave Request Approved',
              message: `Your ${approved[0].type} request (${approved[0].startDate} to ${approved[0].endDate}) has been approved.`,
              timestamp: 'Recently',
              type: 'leave',
              read: false,
              actionTab: 'leaves',
            });
          }
        }

        if (pay.length > 0) {
          initial.push({
            id: 'init-pay',
            title: 'Payroll Statement Available',
            message: `Latest payroll processed for month ${pay[0].payrollMonth} (Net: $${pay[0].netSalary.toLocaleString()}).`,
            timestamp: 'This Month',
            type: 'payroll',
            read: true,
            actionTab: 'payroll',
          });
        }

        return initial;
      });
    } catch (err: any) {
      setErrorBanner('Could not sync data with backend server on port 8080.');
    } finally {
      setLoading(false);
    }
  }, [token, role, pushNotification]);

  useEffect(() => {
    if (token) {
      void loadData();
    }
  }, [token, loadData]);

  // Check-in status
  const activeAttendance = attendance.find((a) => a.checkOut == null) || null;
  const isCheckedIn = !!activeAttendance;

  const handleCheckIn = async () => {
    setLoadingClock(true);
    try {
      await attendanceApi.checkIn();
      await loadData();
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      pushNotification('Clock-In Recorded', `Successfully clocked in at ${timeStr}. Have a productive day!`, 'attendance', 'attendance');
      showToast('Checked In', `Attendance recorded at ${timeStr}`, 'success');
    } catch (err: any) {
      showToast('Check In Failed', 'Unable to check in. You may already be clocked in.', 'error');
    } finally {
      setLoadingClock(false);
    }
  };

  const handleCheckOut = async () => {
    setLoadingClock(true);
    try {
      await attendanceApi.checkOut();
      await loadData();
      const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      pushNotification('Clock-Out Recorded', `Successfully clocked out at ${timeStr}. Work hours calculated.`, 'attendance', 'attendance');
      showToast('Checked Out', `Clocked out at ${timeStr}. Shift recorded.`, 'info');
    } catch (err: any) {
      showToast('Check Out Failed', 'Unable to check out. No active clock-in session found.', 'error');
    } finally {
      setLoadingClock(false);
    }
  };

  const handleApplyLeave = async (payload: { startDate: string; endDate: string; type: string; reason: string }) => {
    await leaveApi.applyLeave(payload);
    await loadData();
    pushNotification(
      'Leave Request Submitted', 
      `Your request for ${payload.type} from ${payload.startDate} to ${payload.endDate} was sent to HR.`, 
      'leave', 
      'leaves'
    );
    showToast('Leave Applied', 'Your request has been submitted for HR approval.', 'success');
  };

  const handleDecideLeave = async (id: number, status: LeaveStatus, reviewComment?: string) => {
    await leaveApi.decideLeave(id, status, { reviewComment });
    await loadData();
    const req = leaves.find((l) => l.id === id);
    const targetName = req ? req.employeeName : 'Employee';
    pushNotification(
      `Leave Request ${status}`, 
      `Leave for ${targetName} was marked as ${status}. Email notification sent.`, 
      'leave', 
      'leaves'
    );
    showToast('Leave Decision Updated', `Request marked as ${status}`, 'success');
  };

  const handleCreateEmployee = async (payload: Partial<UserProfile>) => {
    await employeeApi.create(payload);
    await loadData();
    pushNotification(
      'New Employee Onboarded',
      `${payload.firstName} ${payload.lastName} (${payload.department}) was added to the directory.`,
      'employee',
      'employees'
    );
    showToast('Employee Added', `${payload.firstName} ${payload.lastName} created successfully.`, 'success');
  };

  const handleUpdateEmployee = async (id: number, payload: Partial<UserProfile>) => {
    await employeeApi.update(id, payload);
    await loadData();
    showToast('Profile Updated', 'Employee details have been updated.', 'success');
  };

  const handleDeleteEmployee = async (id: number) => {
    await employeeApi.delete(id);
    await loadData();
    showToast('Employee Removed', 'Employee record was deleted.', 'info');
  };

  const handleUpdateProfile = async (payload: Partial<UserProfile>) => {
    const updated = await authApi.updateMe(payload);
    setProfile(updated);
    setFullName(`${updated.firstName} ${updated.lastName}`.trim());
    await loadData();
    pushNotification('Profile Updated', 'Your contact details and profile preferences were saved.', 'system', 'profile');
    showToast('Profile Saved', 'Personal information updated successfully.', 'success');
  };

  const handleCreatePayroll = async (payload: {
    employeeId: number;
    basicSalary: number;
    allowances: number;
    deductions: number;
    payrollMonth: string;
    remarks?: string;
  }) => {
    await payrollApi.createPayroll(payload);
    await loadData();
    const emp = employees.find((e) => e.id === payload.employeeId);
    pushNotification(
      'Payroll Processed',
      `Disbursed monthly payroll for ${emp ? emp.firstName + ' ' + emp.lastName : 'Employee'} (${payload.payrollMonth}).`,
      'payroll',
      'payroll'
    );
    showToast('Payroll Generated', 'Salary ledger record created successfully.', 'success');
  };

  // Notification handlers
  const handleSelectNotification = (item: AppNotification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.actionTab) {
      setActiveTab(item.actionTab);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications Marked', 'All notifications marked as read.', 'info');
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All notifications have been removed.', 'info');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!token) {
    return <AuthPage onSuccess={handleAuthSuccess} />;
  }

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Operations Dashboard',
      subtitle: role === 'ADMIN' ? 'Full administrator control center' : role === 'HR_MANAGER' ? 'People & talent management overview' : 'Personal employee workspace',
    },
    employees: {
      title: 'Employee Directory',
      subtitle: 'Browse colleagues, departments, and profile records',
    },
    attendance: {
      title: 'Workday Attendance',
      subtitle: 'Daily check-in logs, hours tracking, and presence reports',
    },
    leaves: {
      title: 'Leave & Time Off',
      subtitle: 'Apply for absence, review requests, and check leave balance',
    },
    payroll: {
      title: 'Payroll & Compensation',
      subtitle: 'Monthly salary disbursements, tax breakdowns, and payment stubs',
    },
    profile: {
      title: 'My Profile',
      subtitle: 'View and update your personal and job details',
    },
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 relative font-sans">
      {/* Toast Feedback Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-dropdown max-w-md">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-sky-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{toast.title}</p>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        role={role}
        username={username}
        fullName={fullName}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          title={tabTitles[activeTab].title}
          subtitle={tabTitles[activeTab].subtitle}
          role={role}
          isCheckedIn={isCheckedIn}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          loadingClock={loadingClock}
          notifications={notifications}
          onSelectNotification={handleSelectNotification}
          onMarkAllRead={handleMarkAllRead}
          onClearAll={handleClearAllNotifications}
          onDismissNotification={handleDismissNotification}
        />

        {/* Error Notification Banner */}
        {errorBanner && (
          <div className="mx-8 mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between shadow-subtle">
            <span className="font-semibold">{errorBanner}</span>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold transition-colors"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewPage
              stats={stats}
              role={role}
              isCheckedIn={isCheckedIn}
              activeAttendance={activeAttendance}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              loadingClock={loadingClock}
              onDecideLeave={handleDecideLeave}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesPage
              employees={employees}
              role={role}
              loading={loading}
              onRefresh={loadData}
              onCreateEmployee={handleCreateEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage
              attendance={attendance}
              role={role}
              isCheckedIn={isCheckedIn}
              activeAttendance={activeAttendance}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              loadingClock={loadingClock}
            />
          )}

          {activeTab === 'leaves' && (
            <LeavePage
              leaves={leaves}
              role={role}
              loading={loading}
              onApplyLeave={handleApplyLeave}
              onDecideLeave={handleDecideLeave}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollPage
              payroll={payroll}
              employees={employees}
              role={role}
              loading={loading}
              onCreatePayroll={handleCreatePayroll}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              profile={profile}
              role={role}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
