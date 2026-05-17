'use client';

import React from 'react';

interface OccupancyItem {
  label: string;
  value: number;
  total: number;
}

interface OccupancyCardProps {
  title: string;
  items: OccupancyItem[];
  className?: string;
}

export function OccupancyCard({ title, items, className = '' }: OccupancyCardProps) {
  return (
    <div className={`p-6 rounded-2xl border border-border bg-card shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-base font-black text-text tracking-tight">{title}</h4>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-border" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item, idx) => {
          const percentage = Math.round((item.value / item.total) * 100);
          const strokeDasharray = `${percentage * 0.88} 88`;
          
          return (
            <div 
              key={idx} 
              className="group p-4 rounded-xl bg-primary-light/5 border border-primary-light/10 text-center hover:bg-primary-light/10 hover:border-primary/20 transition-all duration-500 hover:-translate-y-1"
            >
              <div className="text-[11px] font-black text-text-muted mb-4 group-hover:text-primary transition-colors">
                {item.label}
              </div>
              <div className="relative w-16 h-16 mx-auto mb-3">
                <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90 group-hover:scale-110 transition-transform duration-500">
                  <circle cx="18" cy="18" r="14" fill="none" className="stroke-border/30" strokeWidth="4" />
                  <circle 
                    cx="18" cy="18" r="14" fill="none" 
                    className="stroke-primary drop-shadow-[0_0_2px_rgba(var(--color-primary),0.3)]" 
                    strokeWidth="4" 
                    strokeDasharray={strokeDasharray} 
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-primary">
                  {percentage}%
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[10px] text-text font-bold">
                  {item.value} / {item.total}
                </div>
                <div className="text-[8px] text-text-muted font-medium opacity-50 uppercase tracking-tighter">
                  وحدة مشغولة
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
