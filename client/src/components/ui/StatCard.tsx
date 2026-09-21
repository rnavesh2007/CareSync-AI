import React from 'react';
import { clsx } from 'clsx';
import { Card } from './Card.js';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  statusText?: string;
  statusVariant?: 'brand' | 'teal' | 'success' | 'warning' | 'danger' | 'slate';
  icon: React.ReactNode;
  iconBgColor?: string;
  subtext?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  statusText,
  statusVariant = 'success',
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600',
  subtext,
  className,
}) => {
  const statusColors = {
    brand: 'text-brand-700 bg-brand-50 border-brand-100',
    teal: 'text-teal-700 bg-teal-50 border-teal-100',
    success: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    warning: 'text-amber-800 bg-amber-50 border-amber-100',
    danger: 'text-rose-700 bg-rose-50 border-rose-100',
    slate: 'text-slate-600 bg-slate-100 border-slate-200',
  };

  return (
    <Card hoverable className={clsx('relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
          </div>
        </div>
        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBgColor)}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {statusText && (
          <span
            className={clsx(
              'px-2 py-0.5 rounded-md font-medium border text-[11px]',
              statusColors[statusVariant]
            )}
          >
            {statusText}
          </span>
        )}
        {subtext && <span className="text-slate-400 font-normal">{subtext}</span>}
      </div>
    </Card>
  );
};
