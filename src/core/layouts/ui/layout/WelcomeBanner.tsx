'use client';

import React from 'react';

interface BannerStat {
  label: string;
  value: string | number;
  variant?: 'white' | 'warning' | 'danger' | 'success';
}

interface WelcomeBannerProps {
  title: string;
  subtitle: string;
  stats: BannerStat[];
  className?: string;
}

const variantColors = {
  white: 'text-white',
  warning: 'text-warning',
  danger: 'text-danger-light',
  success: 'text-success-light',
};

export function WelcomeBanner({ title, subtitle, stats, className = '' }: WelcomeBannerProps) {
  const currentDate = new Date().toLocaleDateString('ar-SY', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-8 text-white shadow-xl shadow-primary/20
      bg-linear-to-br from-primary-dark via-primary to-primary-light
      animate-fade-in transition-all duration-500
      ${className}
    `}>
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none animate-pulse" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-1 bg-warning rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">لوحة تحكم النظام</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-warning font-bold text-base flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-warning animate-ping" />
            {subtitle}
          </p>
          <div className="flex items-center gap-2 text-white/40 text-[11px] font-medium pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            {currentDate}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 lg:gap-16">
          {stats.map((stat, idx) => (
            <React.Fragment key={idx}>
              <div className="text-center group cursor-default">
                <div className={`
                  text-4xl font-black mb-1 transition-transform duration-500 group-hover:scale-110
                  ${variantColors[stat.variant || 'white']}
                `}>
                  {stat.value}
                </div>
                <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                  {stat.label}
                </div>
              </div>
              {idx < stats.length - 1 && (
                <div className="hidden sm:block w-px h-14 bg-white/10" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Subtle bottom shine */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
