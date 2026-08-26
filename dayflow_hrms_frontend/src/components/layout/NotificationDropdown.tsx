import React, { useRef, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  Clock, 
  CreditCard, 
  UserCheck, 
  Info, 
  CheckCheck, 
  Trash2, 
  X, 
  ExternalLink 
} from 'lucide-react';
import type { AppNotification } from '../../types/hrms';

interface NotificationDropdownProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification: (item: AppNotification) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationDropdown({
  notifications,
  isOpen,
  onClose,
  onSelectNotification,
  onMarkAllRead,
  onClearAll,
  onDismiss,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'leave':
        return <Calendar className="w-4 h-4 text-brand-600" />;
      case 'attendance':
        return <Clock className="w-4 h-4 text-emerald-600" />;
      case 'payroll':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'employee':
        return <UserCheck className="w-4 h-4 text-sky-600" />;
      case 'system':
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconBg = (type: AppNotification['type']) => {
    switch (type) {
      case 'leave':
        return 'bg-brand-50 border-brand-200';
      case 'attendance':
        return 'bg-emerald-50 border-emerald-200';
      case 'payroll':
        return 'bg-indigo-50 border-indigo-200';
      case 'employee':
        return 'bg-sky-50 border-sky-200';
      case 'system':
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/80 shadow-dropdown z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-1 font-medium"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mark read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Clear all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">All caught up!</p>
            <p className="text-xs text-slate-500 mt-1">No new notifications at this time.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectNotification(item)}
              className={`p-3.5 transition-all flex items-start gap-3 cursor-pointer group hover:bg-slate-50/80 ${
                !item.read ? 'bg-brand-50/30' : ''
              }`}
            >
              {/* Type Icon */}
              <div
                className={`p-2 rounded-xl border shrink-0 mt-0.5 ${getIconBg(item.type)}`}
              >
                {getIcon(item.type)}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p
                    className={`text-xs truncate ${
                      !item.read ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'
                    }`}
                  >
                    {item.title}
                  </p>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {item.message}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.timestamp}
                  </span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.actionTab && (
                      <span className="text-[10px] text-brand-600 font-bold flex items-center gap-0.5">
                        View <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(item.id);
                      }}
                      className="p-1 hover:text-rose-600 text-slate-400 rounded"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Click any item to navigate to its details
          </p>
        </div>
      )}
    </div>
  );
}
