'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  showDot?: boolean;
  className?: string;
  pulse?: boolean;
}

const variants = {
  primary: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  muted: 'bg-text-muted/10 text-text-muted border-border',
};

const dotColors = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  muted: 'bg-text-muted',
};

export function Badge({ 
  label, 
  variant = 'muted', 
  showDot = true, 
  className = '', 
  pulse = false 
}: BadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border
      transition-all duration-300 hover:scale-105 active:scale-95
      ${variants[variant]} 
      ${className}
    `}>
      {showDot && (
        <span className={`relative flex h-1.5 w-1.5`}>
          {pulse && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}></span>
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColors[variant]}`}></span>
        </span>
      )}
      {label}
    </span>
  );
}
