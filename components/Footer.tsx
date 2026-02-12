import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 mt-auto py-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
        <p>Powered by Gemini API. This tool is for educational and illustrative purposes only.</p>
        <p className="mt-2 text-gray-400">Designed & Developed by: <span className="font-semibold text-cyan-400">ENG RAED SAADELDIN MOHAMED</span></p>
        <p className="mt-2">&copy; {new Date().getFullYear()} PrelimSteel Beam Designer. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;