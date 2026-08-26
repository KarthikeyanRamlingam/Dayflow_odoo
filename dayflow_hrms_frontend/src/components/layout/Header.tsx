import React, { useState, useEffect } from 'react';
import { Bell, Clock as ClockIcon, CheckCircle, ArrowRight } from 'lucide-react';
import type { Role, AppNotification } from '../../types/hrms';
import { Button } from '../ui/Button';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
  role: Role;
  isCheckedIn: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  loadingClock?: boolean;
  notifications?: AppNotification[];
  onSelectNotification?: (item: AppNotification) => void;
  onMarkAllRead?: () => void;
  onClearAll?: () => void;
  onDismissNotification?: (id: string) => void;
}

export function Header({
  title,
  subtitle,
  role,
  isCheckedIn,
  onCheckIn,
  onCheckOut,
  loadingClock = false,
  notifications = [],
  onSelectNotification = () => {},
  onMarkAllRead = () => {},
  onClearAll = () => {},
  onDismissNotification = () => {},
}: HeaderProps) {
  const [time, setTime] = useState<string>('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Live Clock Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-mono text-slate-700 shadow-sm">
          <ClockIcon className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          <span className="font-semibold">{time}</span>
        </div>

        {/* Quick Check-in/Check-out Action Button */}
        {isCheckedIn ? (
          <Button
            variant="danger"
            size="sm"
            loading={loadingClock}
            onClick={onCheckOut}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Check Out
          </Button>
        ) : (
          <Button
            variant="success"
            size="sm"
            loading={loadingClock}
            onClick={onCheckIn}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            Check In
          </Button>
        )}

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className={`relative p-2.5 rounded-xl transition-all border ${
              isNotificationsOpen
                ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 border-transparent hover:border-slate-200'
            }`}
            title="Notifications"
            aria-label="Toggle notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Interactive Dropdown */}
          <NotificationDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={notifications}
            onSelectNotification={(item) => {
              onSelectNotification(item);
              setIsNotificationsOpen(false);
            }}
            onMarkAllRead={onMarkAllRead}
            onClearAll={onClearAll}
            onDismiss={onDismissNotification}
          />
        </div>
      </div>
    </header>
  );
}
