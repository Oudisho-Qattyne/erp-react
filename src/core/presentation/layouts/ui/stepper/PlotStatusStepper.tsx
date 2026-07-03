import React from 'react';
import { useLanguage } from '../../../context/i18n/I18nProvider';
import { Check, Pencil } from 'lucide-react';
import { useAuth } from '../../../../infrastructure/auth/AuthProvider';

export const PLOT_STATUSES = [
  'unsold',
  'announced',
  'subscribed',
  'allocated',
  'separated'
];

interface PlotStatusStepperProps {
  currentStatus: string;
  statusDate?: string;
  onStatusClick?: (status: string) => void;
  permissions?: Record<string, string>;
}

export function PlotStatusStepper({ currentStatus, statusDate, onStatusClick, permissions }: PlotStatusStepperProps) {
  const { t, direction } = useLanguage();
  const { hasPermission } = useAuth();
  const currentIndex = PLOT_STATUSES.indexOf(currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const canClickStatus = (status: string) => {
    if (!onStatusClick) return false;
    const perm = permissions?.[status];
    if (!perm) return true;
    return hasPermission(perm);
  };

  return (
    <div className="w-full py-6 px-4">
      <div className="relative flex items-center justify-between w-full">
        {/* Background Track */}
        <div className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 w-full h-1 bg-border/50 z-0`} />
        
        {/* Active Track */}
        <div 
          className={`absolute ${direction === 'rtl' ? 'right-0' : 'left-0'} top-1/2 transform -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500 ease-in-out`}
          style={{ width: `${(activeIndex / (PLOT_STATUSES.length - 1)) * 100}%` }}
        />

        {PLOT_STATUSES.map((status, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;
          const isPending = index > activeIndex;
          const canClick = canClickStatus(status);
          const isClickable = onStatusClick && (index === activeIndex || index === activeIndex + 1) && canClick;

          return (
            <div 
              key={status} 
              className={`relative z-10 flex flex-col items-center ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
              onClick={() => {
                if (isClickable) onStatusClick?.(status);
              }}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                  ${isCompleted ? 'bg-primary text-white' : ''}
                  ${isActive ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                  ${isPending ? 'bg-surface border-2 border-border text-text-muted' : ''}
                `}
              >
                {isCompleted ? <Check size={16} /> : (index + 1)}
              </div>
              <div className="absolute top-10 text-center w-32 -ml-16 left-1/2 flex flex-col items-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className={`text-xs font-semibold ${isActive || isCompleted ? 'text-primary' : 'text-text-muted'}`}>
                    {t(`plot_status.${status}`, 'investments') || status}
                  </span>
                  {isActive && isClickable && (
                    <button 
                      className="text-primary hover:text-primary-dark transition-colors p-0.5"
                      title="Edit Status"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                {isActive && statusDate && (
                  <span className="text-[10px] text-text-muted mt-0.5 font-medium">{statusDate}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
