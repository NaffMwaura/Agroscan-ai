import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="spinner-ring"></div>
    <span className="text-green-400 font-medium animate-pulse text-sm tracking-widest uppercase">
      AI Analyzing...
    </span>
  </div>
);

export default LoadingSpinner;