import React from 'react';

interface PDFSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const PDFSection: React.FC<PDFSectionProps> = ({ 
  title, 
  children, 
  className = "" 
}) => {
  return (
    <div className={`pdf-section min-h-[297mm] w-[210mm] p-8 bg-white ${className}`} style={{ pageBreakAfter: 'always' }}>
      {/* Header */}
      <div className="border-b-2 border-emerald-600 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="text-sm text-gray-500 mt-1">Financial Assessment Report</div>
      </div>

      {/* Content */}
      <div className="pdf-section-content">
        {children}
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-8 right-8 border-t pt-4 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <span>Money M8 Financial Assessment</span>
          <span>{new Date().toLocaleDateString('en-AU')}</span>
        </div>
      </div>
    </div>
  );
};