import React from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  UserCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import type { Role } from '../../types/hrms';
import { Badge } from '../ui/Badge';

export type NavTab = 'overview' | 'employees' | 'attendance' | 'leaves' | 'payroll' | 'profile';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  role: Role;
  username: string;
  fullName?: string;
  onLogout: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  role,
  username,
  fullName,
  onLogout,
}: SidebarProps) {
  const isManager = role === 'ADMIN' || role === 'HR_MANAGER';

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'employees',
      label: isManager ? 'Employee Directory' : 'Colleagues',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <Clock className="w-5 h-5" />,
    },
    {
      id: 'leaves',
      label: 'Time Off & Leaves',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'payroll',
      label: isManager ? 'Payroll Management' : 'Salary Slips',
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <UserCircle className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between p-5 min-h-screen shrink-0 sticky top-0 z-30 shadow-sm">
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">DAYFLOW</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded-md border border-brand-200">
                HRMS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">People Operations Suite</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-brand-600' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Card & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-slate-900 flex items-center justify-center font-bold text-white text-sm shrink-0 uppercase shadow-sm">
            {(fullName || username).slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{fullName || username}</p>
            <p className="text-[11px] text-slate-500 truncate">@{username}</p>
            <div className="mt-1">
              <Badge status={role} className="text-[10px] px-1.5 py-0" />
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors duration-150 border border-slate-200/80 hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
