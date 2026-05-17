'use client';

import React from 'react';

interface DistributionItem {
  label: string;
  value: number;
  total: number;
  color: string;
  icon?: React.ReactNode;
}

interface DistributionCardProps {
  title: string;
  items: DistributionItem[];
  className?: string;
}

export function DistributionCard({ title, items, className = '' }: DistributionCardProps) {
  return (
    <div className={`p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-500 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-primary rounded-full animate-pulse" />
        <h4 className="text-base font-black text-text tracking-tight">{title}</h4>
      </div>
      
      <div className="space-y-5">
        {items.map((item, idx) => {
          const percentage = Math.round((item.value / item.total) * 100);
          return (
            <div key={idx} className="group cursor-pointer">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <div className="w-8 h-8 rounded-lg bg-border/30 flex items-center justify-center text-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {item.icon}
                    </div>
                  )}
                  <span className="text-xs font-bold text-text group-hover:text-primary transition-colors duration-300">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-black text-text">{item.value}</span>
                  <span className="text-[10px] text-text-muted font-bold opacity-50">({percentage}%)</span>
                </div>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden p-0.5 border border-border/50">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                  style={{ 
                    width: `${percentage}%`, 
                    backgroundColor: item.color,
                    boxShadow: `0 0 12px ${item.color}30` 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
