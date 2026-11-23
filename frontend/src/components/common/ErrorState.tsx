import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-red-100">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-bold text-gray-800 mb-2">Unable to Load Data</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="border-gray-300">
          Try Again
        </Button>
      )}
    </div>
  );
}
