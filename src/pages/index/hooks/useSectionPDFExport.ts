import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const useSectionPDFExport = () => {
  const handleExportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

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

        // Add new page for each section (except the very first one)
        if (sectionSelectors.indexOf(selector) > 0) {
          pdf.addPage();
        }

        // Try to fit section on current page, otherwise start new page
        if (imgHeight > pdfHeight) {
          // Section is too tall for one page, but try to keep it together by scaling
          const maxScale = 0.95; // 95% of page height to leave some margin
          const scaledHeight = pdfHeight * maxScale;
          const scaledWidth = (scaledHeight / imgHeight) * imgWidth;
          
          // If scaled version still fits reasonably, use it
          if (scaledWidth <= pdfWidth * 0.9) {
            pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight);
          } else {
            // Split into multiple pages as last resort
            let remainingHeight = imgHeight;
            let sourceY = 0;
            
            while (remainingHeight > 0) {
              const heightToAdd = Math.min(pdfHeight * 0.9, remainingHeight);
              const sourceHeight = (heightToAdd / imgHeight) * canvasHeight;
              
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