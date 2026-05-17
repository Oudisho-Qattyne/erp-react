'use client';

import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  onClick?: () => void;
  priority?: boolean;
}

export function StatCard({ icon, label, value, subLabel, trend, onClick, priority }: StatCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        group relative p-4 rounded-xl border border-border bg-card transition-all duration-500
        ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1' : ''}
        ${priority ? 'border-t-4 border-t-warning' : ''}
        animate-fade-in hover:border-primary/30
      `}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg bg-primary-light/5 text-primary group-hover:bg-primary/10 transition-colors duration-500">
          {icon}
        </div>
        <span className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{label}</span>
      </div>
      
      <div className="text-3xl font-black text-text tracking-tight mb-2 group-hover:text-primary transition-colors duration-500">
        {value}
      </div>
      
      {(subLabel || trend) && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          {subLabel && <span className="text-[10px] text-text-muted/70 font-medium">{subLabel}</span>}
          {trend && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-black ${trend.isUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              <span>{trend.isUp ? '▲' : '▼'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      )}

      {/* Decorative background glow */}
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />
    </div>
  );
}
