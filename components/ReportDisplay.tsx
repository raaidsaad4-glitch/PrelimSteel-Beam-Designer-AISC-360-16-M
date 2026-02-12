import React from 'react';
import { AnalysisReport, DesignCheck, ServiceabilityCheck } from '../types';
import Card from './common/Card';
import Button from './common/Button';

// Declare global variables from CDN scripts for TypeScript
declare var jspdf: any;
declare var html2canvas: any;

interface ReportDisplayProps {
  report: AnalysisReport | null;
  onTryBiggerSection: () => void;
}

const DeflectionVisualizer: React.FC<{ calculated: string; limit: string; status: ServiceabilityCheck['status'] }> = ({ calculated, limit, status }) => {
    // Helper to parse "16.67 mm" into 16.67
    const parseValue = (valueStr: string): number | null => {
        if (!valueStr || typeof valueStr !== 'string') return null;
        const match = valueStr.match(/^-?\d*\.?\d+/);
        return match ? parseFloat(match[0]) : null;
    };

    const calculatedValue = parseValue(calculated);
    const limitValue = parseValue(limit);

    if (calculatedValue === null || limitValue === null || limitValue === 0 || status === 'N/A') {
        return <span className="text-gray-500 text-xs">N/A</span>;
    }

    const ratio = calculatedValue / limitValue;
    // Cap at 110% to show overflow visually without breaking the layout too much
    const percentage = Math.min(ratio * 100, 110); 

    let barColor = 'bg-cyan-500';
    if (status === 'Fail') {
        barColor = 'bg-red-500';
    } else if (ratio > 0.9) {
        barColor = 'bg-yellow-500';
    }

    return (
        <div className="w-full bg-gray-600 rounded-full h-2.5 my-1 group relative">
             <div className="absolute bottom-full mb-2 w-max bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none left-1/2 -translate-x-1/2">
                {`Calculated: ${calculated} / Limit: ${limit}`}
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
            </div>
            <div
                className={`h-2.5 rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};


const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, onTryBiggerSection }) => {
  const reportContentRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPdf = () => {
    const input = reportContentRef.current;
    if (!input) {
      console.error("Report content not found for PDF generation.");
      return;
    }

    // Use html2canvas to render the report content to a canvas
    html2canvas(input, {
        scale: 2, // Higher scale for better quality
        backgroundColor: '#1f2937' // Match the card background color
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jspdf.jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = pdfWidth / canvasWidth;
      const pdfHeight = canvasHeight * ratio;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Steel-Beam-Design-Report.pdf');
    });
  };


  if (!report) {
    return (
      <>
        <h2 className="text-3xl font-bold text-white mb-4">Analysis Report</h2>
        <Card className="flex items-center justify-center h-full">
            <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-300">Awaiting Analysis</h3>
                <p className="mt-1 text-sm text-gray-400">Enter your design parameters and run the analysis to see the report.</p>
            </div>
        </Card>
      </>
    );
  }

  const { summary, selectedSection, governingCombination, internalForces, loadCombinations, designChecks, serviceabilityChecks, camberingInfo } = report;

  const summaryBgColor = summary.isAdequate ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500';
  const summaryTextColor = summary.isAdequate ? 'text-green-300' : 'text-red-300';
  
  const propertyLabels: Record<string, string> = {
    depth: 'Depth (d)',
    flangeWidth: 'Flange Width (bf)',
    plasticModulusZx: 'Plastic Modulus (Zx)',
    momentOfInertiaIx: 'Moment of Inertia (Ix)',
  };

  const DesignCheckRow: React.FC<{ check: DesignCheck }> = ({ check }) => {
    const isPass = check.status === 'Pass';
    const ratioColor = isPass ? (check.ratio > 0.9 ? 'text-yellow-400' : 'text-green-400') : 'text-red-400';

    return (
      <tr className="border-b border-gray-700 hover:bg-gray-700/50">
        <td className="p-3 text-sm text-gray-300">{check.checkName}</td>
        <td className="p-3 text-sm text-gray-300 font-mono">{check.demand.toFixed(2)}</td>
        <td className="p-3 text-sm text-gray-300 font-mono">{check.capacity.toFixed(2)}</td>
        <td className={`p-3 text-sm font-semibold font-mono ${ratioColor}`}>{check.ratio.toFixed(3)}</td>
        <td className={`p-3 text-sm font-semibold ${isPass ? 'text-green-400' : 'text-red-400'}`}>{check.status}</td>
      </tr>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Analysis Report</h2>
          <div className="flex items-center gap-4">
            <Button onClick={onTryBiggerSection} variant="secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Try a Bigger Section</span>
            </Button>
            <Button onClick={handleDownloadPdf} variant="secondary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PDF</span>
            </Button>
          </div>
      </div>

      <div ref={reportContentRef} className="space-y-6">
        <Card className={`border-2 ${summaryBgColor}`}>
          <div className="flex items-center space-x-4">
            {summary.isAdequate ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <h2 className={`text-2xl font-bold ${summaryTextColor}`}>
                {summary.isAdequate ? 'Member is Adequate (Safe)' : 'Member is Not Adequate'}
              </h2>
              <p className="text-gray-300">{summary.message}</p>
            </div>
          </div>
        </Card>
        
        <Card title="Selected Section">
          <div className="flex justify-between items-center">
              <div>
                  <p className="text-3xl font-bold text-cyan-400">{selectedSection.name}</p>
                  <p className="text-gray-400">from {selectedSection.standard} database</p>
              </div>
              <div className="text-right">
                  {Object.entries(selectedSection.properties).map(([key, value]) => (
                      <p key={key} className="text-sm">
                        <span className="font-semibold text-gray-300">{propertyLabels[key] || key}:</span>{' '}
                        <span className="font-mono text-gray-400">{value}</span>
                      </p>
                  ))}
              </div>
          </div>
        </Card>
        
        <Card title="Cambering Recommendation">
          <div className="flex items-center space-x-3">
              {camberingInfo.isRequired ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              )}
              <div>
                  <p className={`text-lg font-semibold ${camberingInfo.isRequired ? 'text-yellow-300' : 'text-green-300'}`}>
                      {camberingInfo.isRequired ? 'Cambering Recommended' : 'Cambering Not Required'}
                  </p>
                  <p className="text-sm text-gray-400">{camberingInfo.recommendation}</p>
              </div>
          </div>
        </Card>

        <Card title="Governing Forces (Strength)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                  <p className="text-sm text-gray-400">Governing Combination</p>
                  <p className="text-xl font-bold text-white">{governingCombination.name}</p>
              </div>
              <div>
                  <p className="text-sm text-gray-400">Factored Moment (Mu)</p>
                  <p className="text-xl font-bold text-white">{internalForces.moment.toFixed(2)} kNm</p>
              </div>
              <div>
                  <p className="text-sm text-gray-400">Factored Shear (Vu)</p>
                  <p className="text-xl font-bold text-white">{internalForces.shear.toFixed(2)} kN</p>
              </div>
          </div>
        </Card>

        <Card title="Strength Design Checks (AISC 360-16)">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-300">Check</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Demand</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Capacity</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Ratio (D/C)</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {designChecks.map((check, index) => <DesignCheckRow key={index} check={check} />)}
              </tbody>
            </table>
          </div>
        </Card>
        
        <Card title="Serviceability Checks">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-300">Check</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Calculated</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Limit</th>
                  <th className="p-3 text-sm font-semibold text-gray-300 min-w-[120px]">Visualization</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Status</th>
                  <th className="p-3 text-sm font-semibold text-gray-300">Details</th>
                </tr>
              </thead>
              <tbody>
                {serviceabilityChecks.map((check, index) => {
                    const getStatusColor = (status: ServiceabilityCheck['status']) => {
                        switch (status) {
                            case 'Pass': return 'text-green-400';
                            case 'Fail': return 'text-red-400';
                            default: return 'text-gray-400';
                        }
                    };
                    return (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="p-3 text-sm text-gray-300">{check.checkName}</td>
                            <td className="p-3 text-sm text-gray-300 font-mono">{check.calculated}</td>
                            <td className="p-3 text-sm text-gray-300 font-mono">{check.limit}</td>
                            <td className="p-3 text-sm">
                                <DeflectionVisualizer calculated={check.calculated} limit={check.limit} status={check.status} />
                            </td>
                            <td className={`p-3 text-sm font-semibold ${getStatusColor(check.status)}`}>{check.status}</td>
                            <td className="p-3 text-xs text-gray-400">{check.details}</td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Load Combinations (ASCE 7-16 LRFD)">
          <ul className="space-y-2">
              {loadCombinations.map((combo, index) => (
                  <li key={index} className={`p-3 rounded-md ${combo.name === governingCombination.name ? 'bg-cyan-900/50 border-cyan-700 border' : 'bg-gray-700/50'}`}>
                      <div className="flex justify-between items-center">
                          <div>
                              <span className="font-semibold text-gray-200">{combo.name}: </span>
                              <span className="text-sm text-gray-400">{combo.formula}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-cyan-300">{combo.factoredLoad.toFixed(2)} kN/m</span>
                            {combo.name === governingCombination.name && <span className="ml-2 text-xs bg-cyan-500 text-white font-bold py-0.5 px-2 rounded-full">GOVERNING</span>}
                          </div>
                      </div>
                  </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ReportDisplay;