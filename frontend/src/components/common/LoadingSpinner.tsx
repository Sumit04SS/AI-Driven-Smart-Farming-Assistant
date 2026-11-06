import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label = 'Loading...',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-10 gap-3 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeStyles[size]} animate-spin text-emerald-600`} />
      {label && <p className="text-xs font-medium text-slate-600 animate-pulse">{label}</p>}
    </div>
  );
};
