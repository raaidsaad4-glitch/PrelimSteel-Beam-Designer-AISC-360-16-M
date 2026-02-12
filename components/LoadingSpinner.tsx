
import React from 'react';
import Card from './common/Card';

const LoadingSpinner: React.FC = () => {
  const messages = [
    "Analyzing structural integrity...",
    "Calculating load combinations...",
    "Optimizing steel section...",
    "Running finite element analysis...",
    "Checking AISC 360-16 provisions...",
    "Finalizing design calculations..."
  ];
  
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="flex flex-col items-center justify-center h-full bg-gray-800/80 backdrop-blur-sm">
      <div className="text-center">
        <svg className="animate-spin mx-auto h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="mt-4 text-xl font-semibold text-white">Generating Report</h3>
        <p className="mt-2 text-md text-gray-300 transition-opacity duration-500">{message}</p>
      </div>
    </Card>
  );
};

export default LoadingSpinner;
