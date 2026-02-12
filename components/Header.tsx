import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <svg className="w-8 h-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 18h16M12 6v12" />
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-white">
                PrelimSteel Beam Designer
              </h1>
              <p className="text-xs text-cyan-400 -mt-1 tracking-wide">AISC 360-16M</p>
            </div>
          </div>
          {/* Company Logo placeholder */}
          <div className="flex items-center">
             {/* The logo was removed due to a data corruption issue in the source file. */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;