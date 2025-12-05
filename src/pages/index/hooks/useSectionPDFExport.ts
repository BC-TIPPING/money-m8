import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const useSectionPDFExport = () => {
  const handleExportToPDF = async () => {
    console.log('Starting PDF export...');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = pdfHeight - (2 * margin);

    // Define section selectors in order
    const sectionSelectors = [
      '[data-export-section="stepper"]',
      '[data-export-section="health-score"]',
      '[data-export-section="kpi-cards"]',
      '[data-export-section="income-analysis"]',
      '[data-export-section="budget-analysis"]',
      '[data-export-section="budget-analysis-health"]',
      '[data-export-section="super-health"]',
      '[data-export-section="insurance-protection"]',
      '[data-export-section="debt-strategy"]',
      '[data-export-section="investment-strategy"]',
      '[data-export-section="learning-resources"]',
      '[data-export-section="action-plan"]',
      '[data-export-section="ai-assistant"]',
      '[data-export-section="charts"]',
      '[data-export-section="action-items"]',
    ];

    // Find all sections
    const sections: HTMLElement[] = [];
    const exportRoot = document.getElementById('export-content');
    
    for (const selector of sectionSelectors) {
      const elements = (exportRoot?.querySelectorAll(selector) ?? document.querySelectorAll(selector)) as NodeListOf<HTMLElement>;
      elements.forEach(el => {
        const isNested = !!el.parentElement?.closest('[data-export-section]');
        if (!isNested && el.offsetHeight > 50 && !sections.includes(el)) {
          sections.push(el);
        }
      });
    }

    // Fallback to main content children
    if (sections.length === 0) {
      const mainContent = document.getElementById('export-content');
      if (mainContent) {
        const childSections = mainContent.children;
        for (let i = 0; i < childSections.length; i++) {
          const section = childSections[i] as HTMLElement;
          if (section.offsetHeight > 50) {
            sections.push(section);
          }
        }
      }
    }

    console.log(`Total sections found: ${sections.length}`);
    
    for (let i = 0; i < sections.length; i++) {
      const element = sections[i];
      
      console.log(`Capturing section ${i + 1}/${sections.length}:`, {
        selector: element.getAttribute('data-export-section'),
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      try {
        // Capture the element directly without modifying styles
        const canvas = await html2canvas(element, { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL('image/png', 0.95);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate dimensions to fit in PDF
        const imgWidth = contentWidth;
        const imgHeight = (canvasHeight * contentWidth) / canvasWidth;

        // Add new page for each section (except first)
        if (i > 0) {
          pdf.addPage();
        }

        // If content fits on one page
        if (imgHeight <= contentHeight) {
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
          // Split content across multiple pages
          let remainingHeight = imgHeight;
          let sourceY = 0;
          let isFirstPage = true;
          const scaleFactor = contentWidth / canvasWidth;
          
          while (remainingHeight > 0) {
            if (!isFirstPage) {
              pdf.addPage();
            }
            isFirstPage = false;
            
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
              
              const cropImgData = cropCanvas.toDataURL('image/png', 0.95);
              pdf.addImage(cropImgData, 'PNG', margin, margin, imgWidth, pageHeight);
              
              remainingHeight -= pageHeight;
              sourceY += sourceHeight;
            }
          }
        }

      } catch (error) {
        console.error('Error capturing section:', error);
      }
    }

    pdf.save('financial-assessment.pdf');
  };

  return { handleExportToPDF };
};
