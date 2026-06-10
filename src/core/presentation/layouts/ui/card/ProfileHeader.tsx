import type { ReactNode } from 'react';

interface ProfileHeaderProps {
  avatar: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ProfileHeader({ avatar, children, className = '' }: ProfileHeaderProps) {
  return (
    <div className={`bg-card/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-border shadow-sm relative overflow-hidden ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary via-primary-light to-primary opacity-70"></div>
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-card shadow-sm shrink-0">
          {avatar}
        </div>
        <div className="flex-1 text-center md:text-start space-y-2 pt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
