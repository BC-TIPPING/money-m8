import React from 'react';
import { PDFSection } from './PDFSection';

interface PDFTemplateProps {
  children: React.ReactNode;
}

export const PDFTemplate: React.FC<PDFTemplateProps> = ({ children }) => {
  return (
    <div 
      id="pdf-export-content" 
      className="pdf-template"
      style={{
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '210mm',
        minHeight: '297mm',
        backgroundColor: 'white',
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.5'
      }}
    >
      <style>{`
        @media print {
          .pdf-section {
            page-break-after: always;
            page-break-inside: avoid;
          }
          .pdf-section:last-child {
            page-break-after: auto;
          }
        }
        
        .pdf-template * {
          color: black !important;
          background: white !important;
        }
        
        .pdf-template .card {
          border: 1px solid #e5e7eb !important;
          border-radius: 8px !important;
          padding: 16px !important;
          margin-bottom: 16px !important;
        }
        
        .pdf-template .chart-container {
          background: white !important;
        }
        
        .pdf-template table {
          border-collapse: collapse !important;
          width: 100% !important;
        }
        
        .pdf-template th,
        .pdf-template td {
          border: 1px solid #e5e7eb !important;
          padding: 8px !important;
          text-align: left !important;
        }
        
        .pdf-template th {
          background-color: #f9fafb !important;
          font-weight: bold !important;
        }
      `}</style>
      {children}
    </div>
  );
};