import React from 'react';

export type ToggleVariant = 'primary' | 'success' | 'danger' | 'outline' | 'ghost';
export type ToggleSize = 'sm' | 'md' | 'lg';

interface ToggleProps {
  value?: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  variant?: ToggleVariant;
  size?: ToggleSize;
  label?: string;
}

const onVariants: Record<ToggleVariant, string> = {
  primary: 'bg-primary',
  success: 'bg-green-600',
  danger: 'bg-danger',
  outline: 'bg-primary/10 ring-1 ring-inset ring-primary',
  ghost: 'bg-primary/5',
};

const offClasses = 'bg-gray-200 dark:bg-gray-600';

const sizeStyles: Record<ToggleSize, { trackW: number; h: number; knobSize: number }> = {
  sm: { trackW: 32, h: 16, knobSize: 12 },
  md: { trackW: 44, h: 24, knobSize: 20 },
  lg: { trackW: 56, h: 28, knobSize: 24 },
};

const PADDING = 2;

export function Toggle({ value = false, onChange, disabled = false, variant = 'primary', size = 'md', label }: ToggleProps) {
  const dims = sizeStyles[size];
  const trackWidth = dims.trackW;
  const trackHeight = dims.h;
  const knobSize = dims.knobSize;
  const onLeft = trackWidth - knobSize - PADDING;

  const trackClasses: Record<ToggleSize, string> = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-7',
  };

  const knobClasses: Record<ToggleSize, string> = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={`relative inline-flex items-center rounded-full transition-colors duration-300 ease-out cursor-pointer ${trackClasses[size]} ${value ? onVariants[variant] : offClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={label}
    >
      <span
        className={`absolute rounded-full bg-white shadow-md transition-all duration-300 ease-out ${knobClasses[size]}`}
        style={{
          left: value ? onLeft : PADDING,
          top: (trackHeight - knobSize) / 2,
        }}
      />
    </button>
  );
}