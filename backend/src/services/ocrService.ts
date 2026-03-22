import Tesseract from 'tesseract.js';
import fs from 'fs';

export class OCRService {
  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(
        imagePath,
        'eng',
        {
          logger: (m) => console.log(m)
        }
      );
      
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      
      return text.trim();
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPDF(pdfPath: string): Promise<string> {
    return 'PDF text extraction not yet implemented';
  }
}

export default new OCRService();
