import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const useSectionPDFExport = () => {
  const handleExportToPDF = async () => {
    console.log('Starting PDF export...');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = pdfHeight - (2 * margin);

    // Add title page header
    const addHeader = () => {
      // Add logo (using a simple placeholder shape for now)
      pdf.setFillColor(16, 185, 129); // Emerald color
      pdf.circle(pdfWidth / 2 - 15, 25, 8, 'F');
      pdf.setFillColor(59, 130, 246); // Blue color
      pdf.circle(pdfWidth / 2 + 5, 25, 6, 'F');
      pdf.setFillColor(168, 85, 247); // Purple color
      pdf.circle(pdfWidth / 2 + 20, 25, 4, 'F');
      
      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(31, 41, 55);
      pdf.text('Your Complete Financial Health Check', pdfWidth / 2, 45, { align: 'center' });
      
      // Subtitle
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Comprehensive analysis based on Australian financial benchmarks', pdfWidth / 2, 55, { align: 'center' });
      
      // Date
      const today = new Date().toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.setFontSize(10);
      pdf.text(`Generated: ${today}`, pdfWidth / 2, 65, { align: 'center' });
      
      // Divider line
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 72, pdfWidth - margin, 72);
      
      return 78; // Return Y position after header
    };

    // Define section groups - sections in same array are grouped on same page
    const sectionGroups = [
      // Group 1: Health Score, KPI Cards, Income Analysis (same page with header)
      ['health-score', 'kpi-cards', 'income-analysis'],
      // Individual sections (each on new page)
      ['budget-analysis'],
      ['budget-analysis-health'],
      ['super-health'],
      ['insurance-protection'],
      ['debt-strategy'],
      ['investment-strategy'],
      ['learning-resources'],
      ['action-plan'],
      // Removed ai-assistant
      ['stepper'],
      ['charts'],
      ['action-items'],
    ];

    const exportRoot = document.getElementById('export-content');
    
    // Helper to find element by section name
    const findSection = (name: string): HTMLElement | null => {
      const selector = `[data-export-section="${name}"]`;
      const elements = (exportRoot?.querySelectorAll(selector) ?? document.querySelectorAll(selector)) as NodeListOf<HTMLElement>;
      for (const el of elements) {
        const isNested = !!el.parentElement?.closest('[data-export-section]');
        if (!isNested && el.offsetHeight > 50) {
          return el;
        }
      }
      return null;
    };

    let isFirstPage = true;

    for (const group of sectionGroups) {
      // Find all elements in this group
      const elements = group.map(name => findSection(name)).filter((el): el is HTMLElement => el !== null);
      
      if (elements.length === 0) continue;

      // Add new page (except for first)
      if (!isFirstPage) {
        pdf.addPage();
      }

      // Add header on first page, start content below it
      let currentY = isFirstPage ? addHeader() : margin;
      isFirstPage = false;

      for (const element of elements) {
        console.log(`Capturing section: ${element.getAttribute('data-export-section')}`);

        try {
          // Get element's bounding rect for precise capture
          const rect = element.getBoundingClientRect();
          
          const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true,
            width: rect.width,
            height: rect.height,
            x: 0,
            y: 0,
            scrollX: 0,
            scrollY: 0,
          });

          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;
          
          // Calculate dimensions - scale to fit content width exactly
          const imgWidth = contentWidth;
          const imgHeight = (canvasHeight * contentWidth) / canvasWidth;

          // Check if we need a new page
          const availableHeight = pdfHeight - margin - currentY;
          if (imgHeight > availableHeight && currentY > margin + 10) {
            pdf.addPage();
            currentY = margin;
          }

          // If single image is taller than page, split it
          if (imgHeight > contentHeight) {
            let remainingHeight = imgHeight;
            let sourceY = 0;
            const scaleFactor = contentWidth / canvasWidth;
            
            while (remainingHeight > 0) {
              if (sourceY > 0) {
                pdf.addPage();
                currentY = margin;
              }
              
              const pageHeight = Math.min(remainingHeight, contentHeight);
              const sourceHeight = pageHeight / scaleFactor;
              
              const cropCanvas = document.createElement('canvas');
              const cropCtx = cropCanvas.getContext('2d');
              
              if (cropCtx) {
                cropCanvas.width = canvasWidth;
                cropCanvas.height = sourceHeight;
                
                cropCtx.drawImage(
                  canvas,
                  0, sourceY,
                  canvasWidth, sourceHeight,
                  0, 0,
                  canvasWidth, sourceHeight
                );
                
                const cropImgData = cropCanvas.toDataURL('image/png', 1.0);
                pdf.addImage(cropImgData, 'PNG', margin, currentY, imgWidth, pageHeight);
                
                remainingHeight -= pageHeight;
                sourceY += sourceHeight;
                currentY += pageHeight + 2;
              }
            }
          } else {
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 2;
          }

        } catch (error) {
          console.error('Error capturing section:', error);
        }
      }
    }

    pdf.save('financial-assessment.pdf');
  };

  return { handleExportToPDF };
};
