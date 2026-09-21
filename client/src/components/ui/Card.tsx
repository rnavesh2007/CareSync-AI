import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-2xl border border-slate-200/80 shadow-soft p-5 transition-all duration-200',
        hoverable && 'hover:border-slate-300 hover:shadow-soft-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
