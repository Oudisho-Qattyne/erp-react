import { Spinner } from './Spinner';

interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export function LoadingState({ message, className = '', fullPage = false }: LoadingStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${fullPage ? 'min-h-screen' : 'py-8'} ${className}`}>
      <Spinner size="xl" />
      {message && <span className="text-text-muted">{message}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="flex items-center justify-center min-h-screen">{content}</div>;
  }

  return <div className="text-center">{content}</div>;
}
