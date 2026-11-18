import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading...', fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeClasses[size]} text-indigo-600 animate-spin`} />
      {label && <p className="text-sm font-medium text-slate-500">{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
