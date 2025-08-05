import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const useSectionPDFExport = () => {
  const handleExportToPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // Add margin for better appearance
    const contentWidth = pdfWidth - (2 * margin);
    const contentHeight = pdfHeight - (2 * margin);

    // Define section selectors in order - more specific and comprehensive
    const sectionSelectors = [
      '[data-export-section="stepper"]', // Assessment stepper/summary
      '[data-export-section="health-check"]', // Full Financial Health Check  
      '[data-export-section="charts"]', // Charts section
      '[data-export-section="action-items"]', // Action items
      // Fallback selectors if data attributes aren't found
      '.space-y-8 > div:has(.text-2xl)', // Individual sections with headings
      '.grid.gap-6 > div', // Grid sections
      '.space-y-6 > div' // Spaced sections
    ];

    // Find all meaningful sections automatically
    const sections: HTMLElement[] = [];
    
    // Try specific selectors first
    for (const selector of sectionSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      elements.forEach(el => {
        if (el.offsetHeight > 50 && !sections.includes(el)) { // Only include sections with content
          sections.push(el);
        }
      });
    }

    // If no sections found, try to find main content sections
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

    let isFirstSection = true;

    for (const element of sections) {
      // Set white background for PDF
      const originalBg = element.style.backgroundColor;
      const originalBorder = element.style.border;
      const originalPadding = element.style.padding;
      
      element.style.backgroundColor = 'white';
      element.style.border = 'none';
      element.style.padding = '20px';

      try {
        const canvas = await html2canvas(element, { 
          scale: 1.5, 
          useCORS: true,
          backgroundColor: 'white',
          logging: false,
          allowTaint: true,
          foreignObjectRendering: true
        });

        // Restore original styles
        element.style.backgroundColor = originalBg;
        element.style.border = originalBorder;
        element.style.padding = originalPadding;

        const imgData = canvas.toDataURL('image/png', 0.95);
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const ratio = canvasWidth / canvasHeight;
        const maxImgWidth = contentWidth;
        const maxImgHeight = contentHeight;
        
        // Calculate dimensions to fit within page while maintaining aspect ratio
        let imgWidth = maxImgWidth;
        let imgHeight = imgWidth / ratio;
        
        // If height exceeds page, scale down based on height
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = imgHeight * ratio;
        }

        // Add new page for each section (except the very first one)
        if (!isFirstSection) {
          pdf.addPage();
        }
        isFirstSection = false;

        // Center the content on the page
        const xOffset = margin + (contentWidth - imgWidth) / 2;
        const yOffset = margin + (contentHeight - imgHeight) / 2;

        // Add the image to PDF - keep sections together, scale if needed
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);

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