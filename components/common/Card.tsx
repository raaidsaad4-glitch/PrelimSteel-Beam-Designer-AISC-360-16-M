
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 ${className}`}>
      {title && <h2 className="text-xl font-bold text-cyan-400 mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
