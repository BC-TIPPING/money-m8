import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export const useProfessionalPDFExport = () => {
  const handleExportToPDF = async () => {
    try {
      toast.info("Generating PDF report...");

      // Get the PDF template element
      const pdfElement = document.getElementById('pdf-export-content');
      if (!pdfElement) {
        toast.error("PDF content not found. Please try again.");
        return;
      }

      // Show the PDF template temporarily
      const originalStyle = pdfElement.style.cssText;
      pdfElement.style.cssText = `
        position: absolute;
        left: 0;
        top: 0;
        width: 210mm;
        background: white;
        z-index: 9999;
        visibility: visible;
      `;

      // Get all PDF sections
      const sections = pdfElement.querySelectorAll('.pdf-section');
      if (sections.length === 0) {
        toast.error("No sections found to export.");
        pdfElement.style.cssText = originalStyle;
        return;
      }

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i] as HTMLElement;
        
        try {
          // Capture the section as canvas
          const canvas = await html2canvas(section, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: section.offsetWidth,
            height: section.offsetHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: section.offsetWidth,
            windowHeight: section.offsetHeight,
          });

          const imgData = canvas.toDataURL('image/png', 1.0);
          
          // Add new page for each section (except first)
          if (i > 0) {
            pdf.addPage();
          }
          
          // Calculate dimensions to fit page
          const canvasAspectRatio = canvas.width / canvas.height;
          const pageAspectRatio = pageWidth / pageHeight;
          
          let imgWidth = pageWidth;
          let imgHeight = pageHeight;
          
          if (canvasAspectRatio > pageAspectRatio) {
            // Canvas is wider, fit to width
            imgHeight = pageWidth / canvasAspectRatio;
          } else {
            // Canvas is taller, fit to height  
            imgWidth = pageHeight * canvasAspectRatio;
          }
          
          // Center the image on the page
          const xOffset = (pageWidth - imgWidth) / 2;
          const yOffset = (pageHeight - imgHeight) / 2;
          
          pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
          
        } catch (sectionError) {
          console.error(`Error processing section ${i + 1}:`, sectionError);
          toast.error(`Error processing section ${i + 1}. Skipping...`);
        }
      }

      // Hide the PDF template
      pdfElement.style.cssText = originalStyle;

      // Save the PDF
      const fileName = `money-m8-financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF report exported successfully!");

    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error("Failed to export PDF. Please try again.");
      
      // Ensure PDF template is hidden even on error
      const pdfElement = document.getElementById('pdf-export-content');
      if (pdfElement) {
        pdfElement.style.cssText = `
          position: absolute;
          left: -9999px;
          top: -9999px;
          visibility: hidden;
        `;
      }
    }
  };

  return { handleExportToPDF };
};