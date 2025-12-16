// src/components/ui/InputField.tsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  icon: React.ElementType;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string; // Fixes the "Property 'className' does not exist" error
}

const InputField: React.FC<InputFieldProps> = ({ 
  icon: Icon, 
  placeholder, 
  type, 
  value, 
  onChange,
  className // Destructure the new className prop
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordField = type === 'password';
  const inputType = isPasswordField ? (showPassword ? 'text' : 'password') : type;
  const VisibilityIcon = showPassword ? EyeOff : Eye;

  return (
    <div className="relative mb-4 group">
      {/* Icon with a transition effect when the input is focused */}
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-amber-400 transition-colors" />
      
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        // Use template literals to merge the default styles with the golden styles passed from AuthPage
        className={`w-full pl-12 pr-12 py-3 border rounded-xl outline-none transition-all duration-300 shadow-sm ${className}`}
      />

      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-amber-400 transition-colors focus:outline-none"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <VisibilityIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default InputField;