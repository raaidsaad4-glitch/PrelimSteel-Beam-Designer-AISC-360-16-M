
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
}

const Input: React.FC<InputProps> = ({ label, unit, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-150"
          {...props}
        />
        {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400">{unit}</span>}
      </div>
    </div>
  );
};

export default Input;
