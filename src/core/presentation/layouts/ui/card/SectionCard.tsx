import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  empty?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
}

export function SectionCard({
  title,
  icon,
  children,
  className = '',
  empty = false,
  emptyMessage,
  emptyIcon,
}: SectionCardProps) {
  return (
    <div className={`bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-sm ${className}`}>
      <h2 className="text-lg font-bold text-text flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h2>
      {empty ? (
        <div className="text-center py-8 text-text-muted bg-background/30 rounded-xl border border-dashed border-border flex flex-col items-center gap-2">
          {emptyIcon && <span className="opacity-50">{emptyIcon}</span>}
          <span>{emptyMessage || 'No data'}</span>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
