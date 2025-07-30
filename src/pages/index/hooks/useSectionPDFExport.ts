import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const useSectionPDFExport = () => {
  const handleExportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let isFirstPage = true;

    // Define section selectors in order
    const sectionSelectors = [
      '.stepper-container', // Assessment stepper/summary
      '.health-check-section', // Full Financial Health Check
      '.ai-summary-section', // AI Generated summary
      '.goal-specific-section', // Goal-specific calculators
      '.chart-section', // Charts
      '.action-items-section' // Action items
    ];

    for (const selector of sectionSelectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (!element) continue;

      // Set white background for PDF
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = 'white';

      try {
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: 'white',
          logging: false
        });

        // Restore original background
        element.style.backgroundColor = originalBg;

        const imgData = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth;
        const imgHeight = pdfWidth / ratio;

        // Add new page if not first page
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // If section is too tall for one page, split it
        if (imgHeight > pdfHeight) {
          let remainingHeight = imgHeight;
          let sourceY = 0;
          
          while (remainingHeight > 0) {
            const heightToAdd = Math.min(pdfHeight, remainingHeight);
            const sourceHeight = (heightToAdd / imgHeight) * canvasHeight;
            
            // Create a new canvas for this portion
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasWidth;
            tempCanvas.height = sourceHeight;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (tempCtx) {
              tempCtx.drawImage(canvas, 0, sourceY, canvasWidth, sourceHeight, 0, 0, canvasWidth, sourceHeight);
              const tempImgData = tempCanvas.toDataURL('image/png');
              
              if (sourceY > 0) pdf.addPage();
              pdf.addImage(tempImgData, 'PNG', 0, 0, imgWidth, heightToAdd);
            }
            
            sourceY += sourceHeight;
            remainingHeight -= heightToAdd;
          }
        } else {
          // Section fits on one page
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }
      } catch (error) {
        console.error('Error capturing section:', selector, error);
        // Restore background on error
        element.style.backgroundColor = originalBg;
      }
    }

    pdf.save('financial-assessment.pdf');
  };

  return { handleExportToPDF };
};