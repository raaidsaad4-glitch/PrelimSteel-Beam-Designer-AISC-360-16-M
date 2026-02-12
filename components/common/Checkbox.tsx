import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, description, id, ...props }) => {
  return (
    <div className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          id={id}
          aria-describedby={description ? `${id}-description` : undefined}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-600 focus:ring-offset-gray-800 focus:ring-2 focus:ring-cyan-600"
          {...props}
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor={id} className="font-medium text-gray-300">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default Checkbox;
