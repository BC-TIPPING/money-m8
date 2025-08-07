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

    // Define section selectors in order - more specific and comprehensive
    const sectionSelectors = [
      '[data-export-section="stepper"]', // Assessment stepper/summary
      '[data-export-section="health-check"]', // Full Financial Health Check  
      '[data-export-section="charts"]', // Charts section
      '[data-export-section="action-items"]', // Action items
    ];

    // Find all meaningful sections automatically
    const sections: HTMLElement[] = [];
    
    // Try specific selectors first
    for (const selector of sectionSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      console.log(`Found ${elements.length} elements for selector: ${selector}`);
      elements.forEach(el => {
        if (el.offsetHeight > 50 && !sections.includes(el)) {
          console.log(`Adding section with height: ${el.offsetHeight}`);
          sections.push(el);
        }
      });
    }

    // If no sections found, try to find main content sections
    if (sections.length === 0) {
      console.log('No sections found with data attributes, trying fallback...');
      const mainContent = document.getElementById('export-content');
      if (mainContent) {
        const childSections = mainContent.children;
        for (let i = 0; i < childSections.length; i++) {
          const section = childSections[i] as HTMLElement;
          if (section.offsetHeight > 50) {
            console.log(`Adding fallback section with height: ${section.offsetHeight}`);
            sections.push(section);
          }
        }
      }
    }

    console.log(`Total sections found: ${sections.length}`);

    let isFirstSection = true;

    for (const element of sections) {
      // Ensure element is fully visible and has proper dimensions
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
      
      // Set white background and ensure proper layout for PDF
      const originalBg = element.style.backgroundColor;
      const originalBorder = element.style.border;
      const originalPadding = element.style.padding;
      const originalWidth = element.style.width;
      
      element.style.backgroundColor = 'white';
      element.style.border = 'none';
      element.style.padding = '20px';
      element.style.width = 'auto';

      try {
        // Get the full dimensions of the element
        const elementRect = element.getBoundingClientRect();
        const fullWidth = Math.max(element.scrollWidth, element.offsetWidth, elementRect.width);
        const fullHeight = Math.max(element.scrollHeight, element.offsetHeight, elementRect.height);

        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: 'white',
          logging: false,
          allowTaint: true,
          foreignObjectRendering: true,
          width: fullWidth,
          height: fullHeight,
          x: 0,
          y: 0,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight
        });

        // Restore original styles
        element.style.backgroundColor = originalBg;
        element.style.border = originalBorder;
        element.style.padding = originalPadding;
        element.style.width = originalWidth;

        const imgData = canvas.toDataURL('image/png', 1.0);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate dimensions to fit the full width in PDF
        const imgWidth = contentWidth;
        const imgHeight = (canvasHeight * contentWidth) / canvasWidth;

        // Add new page for each section (except the very first one)
        if (!isFirstSection) {
          pdf.addPage();
        }
        isFirstSection = false;

        // If content is too tall for one page, split it across multiple pages
        if (imgHeight <= contentHeight) {
          // Content fits on one page - add it normally
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
          // Content spans multiple pages
          let remainingHeight = imgHeight;
          let yPos = 0;
          
          while (remainingHeight > 0) {
            const pageHeight = Math.min(remainingHeight, contentHeight);
            const cropCanvas = document.createElement('canvas');
            const cropCtx = cropCanvas.getContext('2d');
            
            cropCanvas.width = canvasWidth;
            cropCanvas.height = (pageHeight * canvasWidth) / contentWidth;
            
            if (cropCtx) {
              cropCtx.drawImage(
                canvas,
                0, (yPos * canvasWidth) / contentWidth,
                canvasWidth, cropCanvas.height,
                0, 0,
                canvasWidth, cropCanvas.height
              );
              
              const cropImgData = cropCanvas.toDataURL('image/png', 1.0);
              pdf.addImage(cropImgData, 'PNG', margin, margin, imgWidth, pageHeight);
              
              remainingHeight -= pageHeight;
              yPos += pageHeight;
              
              if (remainingHeight > 0) {
                pdf.addPage();
              }
            }
          }
        }

      } catch (error) {
        console.error('Error capturing section:', error);
        // Restore styles on error
        element.style.backgroundColor = originalBg;
        element.style.border = originalBorder;
        element.style.padding = originalPadding;
      }
    }

    pdf.save('financial-assessment.pdf');
  };

  return { handleExportToPDF };
};