interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({
  className = '',
  size = 'md',
  text,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-red-200 border-t-red-600`}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}
