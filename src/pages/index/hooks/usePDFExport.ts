
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export const usePDFExport = () => {
  const handleExportToPDF = () => {
    const input = document.getElementById('export-content');
    if (!input) {
      console.error("The element to export was not found.");
      return;
    }

    const originalBackgroundColor = input.style.backgroundColor;
    input.style.backgroundColor = 'white';

    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      input.style.backgroundColor = originalBackgroundColor;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      const ratio = canvasWidth / canvasHeight;
      const imgHeightOnPdf = pdfWidth / ratio;
      
      let heightLeft = imgHeightOnPdf;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
        heightLeft -= pdfHeight;
      }
      pdf.save('financial-assessment.pdf');
    });
  };

  return { handleExportToPDF };
};
