import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import InputForm from './components/InputForm';
import ReportDisplay from './components/ReportDisplay';
import { DesignInputs, AnalysisReport } from './types';
import { runBeamAnalysis } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [report, setReport] = React.useState<AnalysisReport | null>(null);
  const [lastInputs, setLastInputs] = React.useState<DesignInputs | null>(null);

  const handleAnalysis = async (inputs: DesignInputs) => {
    setIsLoading(true);
    setError(null);
    setReport(null);
    setLastInputs(inputs);
    try {
      const result = await runBeamAnalysis(inputs);
      setReport(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryBiggerSection = async () => {
    if (!lastInputs || !report?.selectedSection.name) {
      console.error("Cannot try a bigger section without previous inputs and a selected section.");
      return;
    }

    // Capture the section name before state changes clear the report object
    const heavierThanSectionName = report.selectedSection.name;

    setIsLoading(true);
    setError(null);
    setReport(null); // Clear previous report to ensure a clean state for the new request

    try {
      // Use the captured variable for the API call
      const result = await runBeamAnalysis(lastInputs, heavierThanSectionName);
      setReport(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:pr-4">
            <h2 className="text-3xl font-bold text-white mb-4">Design Inputs</h2>
            <p className="text-gray-400 mb-6">
              Provide the necessary parameters for the steel beam design. The AI will select an optimal section and perform checks based on AISC 360-16.
            </p>
            <InputForm onAnalysis={handleAnalysis} isLoading={isLoading} />
          </div>
          <div className="lg:pl-4">
            {error && (
              <div className="bg-red-900/50 border-2 border-red-700 text-red-300 p-6 rounded-lg mt-12 flex items-start space-x-4" role="alert">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-400">Analysis Failed</h3>
                  <p className="mt-1 text-red-200">{error}</p>
                </div>
              </div>
            )}
            
            {isLoading && <LoadingSpinner />}
            
            {!isLoading && !error && (
              <div className="h-full">
                <ReportDisplay report={report} onTryBiggerSection={handleTryBiggerSection} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;