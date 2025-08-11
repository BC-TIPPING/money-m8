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

    // Define section selectors in order - more specific and comprehensive
    const sectionSelectors = [
      '[data-export-section="stepper"]', // Assessment stepper/summary
      '[data-export-section="budget-analysis"]', // Budget Analysis section
      '[data-export-section="health-check"]', // Full Financial Health Check  
      '[data-export-section="charts"]', // Charts section
      '[data-export-section="action-items"]', // Action items
    ];

    // Find all meaningful sections automatically (top-level only under #export-content)
    const sections: HTMLElement[] = [];
    const exportRoot = document.getElementById('export-content');
    
    // Try specific selectors first within export root to preserve order
    for (const selector of sectionSelectors) {
      const elements = (exportRoot?.querySelectorAll(selector) ?? document.querySelectorAll(selector)) as NodeListOf<HTMLElement>;
      console.log(`Found ${elements.length} elements for selector: ${selector}`);
      elements.forEach(el => {
        const isNested = !!el.parentElement?.closest('[data-export-section]');
        if (!isNested && el.offsetHeight > 50 && !sections.includes(el)) {
          console.log(`Adding top-level section with height: ${el.offsetHeight}`);
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
    
    for (let i = 0; i < sections.length; i++) {
      const element = sections[i];
      
      // Ensure element is fully visible and has proper dimensions
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Set white background and ensure proper layout for PDF
      const originalBg = element.style.backgroundColor;
      const originalBorder = element.style.border;
      const originalPadding = element.style.padding;
      const originalWidth = element.style.width;
      const originalMargin = element.style.margin;
      
      element.style.backgroundColor = 'white';
      element.style.border = 'none';
      element.style.padding = '20px';
      element.style.width = '800px'; // Fixed width for consistent capture
      element.style.margin = '0';

      try {
        // Wait for element to stabilize
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const canvas = await html2canvas(element, { 
          scale: 1.0, // Reduced scale to prevent cutoff
          useCORS: true,
          backgroundColor: 'white',
          logging: false,
          allowTaint: true,
          foreignObjectRendering: true,
          scrollX: 0,
          scrollY: 0,
          width: 800, // Fixed width
          height: element.scrollHeight
        });

        // Restore original styles
        element.style.backgroundColor = originalBg;
        element.style.border = originalBorder;
        element.style.padding = originalPadding;
        element.style.width = originalWidth;
        element.style.margin = originalMargin;

        const imgData = canvas.toDataURL('image/png', 0.95);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Calculate dimensions to fit properly in PDF with margins
        const availableWidth = contentWidth;
        const scaleFactor = availableWidth / canvasWidth;
        const imgWidth = availableWidth;
        const imgHeight = canvasHeight * scaleFactor;

        // Add a new page for each section (don't add page for first section)
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
          
          while (remainingHeight > 0) {
            if (!isFirstPage) {
              pdf.addPage();
            }
            isFirstPage = false;
            
            const pageHeight = Math.min(remainingHeight, contentHeight);
            const sourceHeight = (pageHeight / scaleFactor);
            
            // Create a cropped canvas for this page
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
        // Restore styles on error
        element.style.backgroundColor = originalBg;
        element.style.border = originalBorder;
        element.style.padding = originalPadding;
        element.style.width = originalWidth;
        element.style.margin = originalMargin;
      }
    }

    pdf.save('financial-assessment.pdf');
  };

  return { handleExportToPDF };
};