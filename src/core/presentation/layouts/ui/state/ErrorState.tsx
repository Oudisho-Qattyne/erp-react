import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../buttons/Button';
import { useLanguage } from '../../../context/i18n/I18nProvider';

interface ErrorStateProps {
  message?: string;
  icon?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ message, icon, retryLabel, onRetry, className = '' }: ErrorStateProps) {
  const { t } = useLanguage();
  return (
    <div className={`bg-danger/10 border border-danger/20 text-danger p-6 rounded-xl flex flex-col items-center gap-4 ${className}`}>
      {icon ?? <AlertCircle size={32} />}
      <p className="text-lg font-medium">{message || t('common.error', 'shared') || 'An error occurred'}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel || t('common.retry', 'shared') || 'Retry'}
        </Button>
      )}
    </div>
  );
}
