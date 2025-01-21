import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface DocumentVersion {
  content: string;
  timestamp: Date;
  id: string;
}

export const generatePDF = async (editorRef: HTMLDivElement | null): Promise<void> => {
  if (!editorRef) return;
  
  try {
    const canvas = await html2canvas(editorRef);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('document.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportToWord = (content: string): void => {
  const blob = new Blob([content], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'document.doc';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};