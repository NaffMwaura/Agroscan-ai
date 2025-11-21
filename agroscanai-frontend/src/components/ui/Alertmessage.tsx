import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { AlertMessageProps } from '../../types'; // Import type from shared file
 // Import type from shared file

const AlertMessage: React.FC<AlertMessageProps> = ({ message, type }) => {
  if (!message) return null;
  const baseClasses = "p-4 rounded-xl text-sm mb-4 transition-all duration-300 shadow-md flex items-center";
  const typeClasses = type === 'success' ? "bg-green-100 text-green-800 border border-green-300" : "bg-red-100 text-red-800 border border-red-300";
  const Icon = type === 'success' ? CheckCircle : XCircle;
  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <Icon className="h-5 w-5 flex-shrink-0 mr-2" />
      <span>{message}</span>
    </div>
  );
};

export default AlertMessage;