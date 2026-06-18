interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-8 w-8 border-4',
  xl: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClass = sizeMap[size] || sizeMap.md;
  return (
    <div
      className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClass} ${className}`}
    />
  );
}
