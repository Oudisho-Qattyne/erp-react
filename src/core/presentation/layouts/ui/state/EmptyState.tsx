import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ message, icon, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-8 text-text-muted bg-background/30 rounded-xl border border-dashed border-border flex flex-col items-center gap-2 ${className}`}>
      {icon ? <span className="opacity-50">{icon}</span> : <Inbox size={24} className="opacity-50" />}
      <span>{message || 'No data'}</span>
    </div>
  );
}
