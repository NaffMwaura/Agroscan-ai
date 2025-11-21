// src/components/ui/InputField.tsx
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Import icons for visibility toggle

const InputField: React.FC<{
  icon: React.ElementType;
  placeholder: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ icon: Icon, placeholder, type, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine the input type dynamically for password fields
  const inputType = type === 'password' 
    ? (showPassword ? 'text' : 'password') 
    : type;

  // Determine if the visibility toggle should be shown
  const isPasswordField = type === 'password';
  const VisibilityIcon = showPassword ? EyeOff : Eye;

  return (
    <div className="relative mb-4">
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={inputType} // Use the dynamic type
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        // Added pr-12 to make space for the eye icon
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm text-gray-700"
      />

      {/* Add the Eye Icon toggle */}
      {isPasswordField && (
        <button
          type="button" // Important: prevents form submission
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <VisibilityIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default InputField;