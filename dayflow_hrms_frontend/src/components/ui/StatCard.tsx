import React from 'react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'rose';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive = true,
  color = 'indigo',
  className,
}: StatCardProps) {
  const iconBg = {
    indigo: 'bg-brand-50 text-brand-600 border-brand-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-6 transition-all duration-200 shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">{value}</p>
          {subtitle && <p className="text-xs font-medium text-slate-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 mt-3">
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-md border',
                  trendPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                )}
              >
                {trend}
              </span>
              <span className="text-xs font-normal text-slate-400">vs last cycle</span>
            </div>
          )}
        </div>

        <div className={cn('p-3.5 rounded-2xl border shadow-subtle shrink-0', iconBg[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
