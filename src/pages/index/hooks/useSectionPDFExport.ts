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

    // Define section groups - sections in same array are grouped on same page
    const sectionGroups = [
      // Group 1: Health Score, KPI Cards, Income Analysis (same page)
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
      ['ai-assistant'],
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
      isFirstPage = false;

      let currentY = margin;

      for (const element of elements) {
        console.log(`Capturing section: ${element.getAttribute('data-export-section')}`);

        try {
          const canvas = await html2canvas(element, { 
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: true,
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
          if (currentY + imgHeight > pdfHeight - margin && currentY > margin) {
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
                currentY += pageHeight + 3;
              }
            }
          } else {
            const imgData = canvas.toDataURL('image/png', 1.0);
            pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
            currentY += imgHeight + 3; // Small gap between sections
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
