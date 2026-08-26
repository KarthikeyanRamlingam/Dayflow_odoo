import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
}

export function Badge({ className, status, variant, children, ...props }: BadgeProps) {
  let badgeVariant = variant || 'default';

  if (status) {
    const s = status.toUpperCase();
    if (['PRESENT', 'APPROVED', 'ACTIVE', 'PAID', 'SUCCESS'].includes(s)) {
      badgeVariant = 'success';
    } else if (['PENDING', 'HALF_DAY', 'PROCESSING', 'WARNING'].includes(s)) {
      badgeVariant = 'warning';
    } else if (['REJECTED', 'ABSENT', 'INACTIVE', 'DANGER', 'FAILED'].includes(s)) {
      badgeVariant = 'danger';
    } else if (['ON_LEAVE', 'PAID_TIME_OFF', 'INFO'].includes(s)) {
      badgeVariant = 'info';
    } else if (['HR_MANAGER', 'ADMIN'].includes(s)) {
      badgeVariant = 'purple';
    }
  }

  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/10 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/10 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/10 font-semibold',
    info: 'bg-sky-50 text-sky-700 border-sky-200 ring-1 ring-sky-500/10 font-semibold',
    purple: 'bg-brand-50 text-brand-700 border-brand-200 ring-1 ring-brand-500/10 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[badgeVariant],
        className
      )}
      {...props}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80 shrink-0" />
      {children || (status ? status.replace(/_/g, ' ') : '')}
    </span>
  );
}
