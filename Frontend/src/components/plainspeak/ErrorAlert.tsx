import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  onDismiss,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl',
        'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
        className
      )}
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
        aria-label="Dismiss error"
      >
        <X className="w-4 h-4 text-red-500" />
      </button>
    </div>
  );
};
