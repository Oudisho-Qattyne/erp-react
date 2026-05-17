'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-primary-light dark:hover:bg-primary-dark/30 transition-all duration-300 group overflow-hidden relative"
      aria-label={theme === 'light' ? 'التحول للوضع الليلي' : 'التحول للوضع النهاري'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun
          size={20}
          className={`
            absolute transition-all duration-500 transform
            ${theme === 'dark' ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}
            text-warning
          `}
        />
        <Moon
          size={20}
          className={`
            absolute transition-all duration-500 transform
            ${theme === 'light' ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}
            text-gold
          `}
        />
      </div>
    </button>
  );
}
