import puppeteer from 'puppeteer';
import { GeneratedPaper } from '../types';
import { IAssignment } from '../models/Assignment';

export class PDFService {
  async generatePDF(assignment: IAssignment): Promise<Buffer> {
    if (!assignment.generatedPaper) {
      throw new Error('No generated paper found');
    }

    console.log('Building HTML for PDF...');
    const html = this.buildHTML(assignment);
    console.log('HTML built, length:', html.length);
    
    let browser;
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('Puppeteer launched successfully');

      const page = await browser.newPage();
      console.log('Setting page content...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('Page content set');
      
      console.log('Generating PDF...');
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });
      console.log('PDF generated, size:', pdf.length);

      await browser.close();
      return pdf;
    } catch (error) {
      console.error('Puppeteer error:', error);
      if (browser) {
        await browser.close();
      }
      throw error;
    }
  }

  private buildHTML(assignment: any): string {
    const { generatedPaper, subject, class: className, duration, totalMarks } = assignment;
    
    if (!generatedPaper || !generatedPaper.sections) {
      throw new Error('No generated paper found');
    }

    let questionCounter = 1;
    const sections = generatedPaper.sections.map((section: any) => {
      const questions = section.questions.map((q: any) => {
        const questionHTML = `
          <div class="question">
            <div class="q-number">${questionCounter}.</div>
            <div class="q-content">
              <div class="q-text">${q.text}</div>
              <div class="q-marks">[${q.marks} marks]</div>
            </div>
          </div>
        `;
        questionCounter++;
        return questionHTML;
      }).join('');

      return `
        <div class="section">
          <div class="section-title">${section.title}</div>
          <div class="section-instruction">${section.instruction}</div>
          ${questions}
        </div>
      `;
    }).join('');

    questionCounter = 1;
    const answerKey = generatedPaper.sections.map((section: any) => {
      const answers = section.questions.map((q: any) => {
        const answer = q.answer || 'Answer not provided';
        const answerHTML = `
          <div class="answer-item">
            <span class="ans-number">${questionCounter}.</span>
            <span class="ans-text">${answer}</span>
          </div>
        `;
        questionCounter++;
        return answerHTML;
      }).join('');
      return answers;
    }).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 210mm;
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      padding: 0;
      margin: 0 auto;
    }
    
    .page-container {
      width: 100%;
      min-height: 297mm;
      padding: 15mm;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .school-name {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .subject-line {
      font-size: 14pt;
      font-weight: bold;
      margin: 3px 0;
    }
    
    .class-line {
      font-size: 14pt;
      font-weight: bold;
      margin: 3px 0;
    }
    
    .meta-row {
      display: flex;
      justify-content: space-between;
      margin: 15px 0;
      font-size: 11pt;
    }
    
    .general-instructions {
      margin: 15px 0;
      font-size: 11pt;
    }
    
    .student-details {
      margin: 15px 0 20px 0;
      font-size: 11pt;
    }
    
    .student-details div {
      margin: 5px 0;
    }
    
    .fill-line {
      display: inline-block;
      border-bottom: 1px solid #000;
      min-width: 180px;
      margin-left: 5px;
    }
    
    .section {
      margin: 20px 0;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: bold;
      text-align: center;
      margin: 15px 0 10px 0;
    }
    
    .section-instruction {
      font-style: italic;
      font-size: 11pt;
      margin-bottom: 12px;
    }
    
    .question {
      display: flex;
      margin: 12px 0;
      page-break-inside: avoid;
    }
    
    .q-number {
      min-width: 30px;
      font-weight: bold;
    }
    
    .q-content {
      flex: 1;
    }
    
    .q-text {
      display: inline;
    }
    
    .q-marks {
      float: right;
      font-size: 10pt;
      margin-left: 10px;
    }
    
    .answer-section {
      page-break-before: always;
      margin-top: 30px;
    }
    
    .answer-title {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      text-decoration: underline;
      margin-bottom: 20px;
    }
    
    .answer-item {
      display: flex;
      margin: 8px 0;
      page-break-inside: avoid;
    }
    
    .ans-number {
      min-width: 30px;
      font-weight: bold;
    }
    
    .ans-text {
      flex: 1;
    }
  </style>
</head>
<body>
  <div class="page-container">
    <div class="header">
      <div class="school-name">Delhi Public School, Sector-4, Bokaro</div>
      <div class="subject-line">Subject: ${subject || 'General'}</div>
      <div class="class-line">Class: ${className || 'Standard'}</div>
    </div>
    
    <div class="meta-row">
      <span><strong>Time Allowed:</strong> ${duration || '45'} minutes</span>
      <span><strong>Maximum Marks:</strong> ${totalMarks || generatedPaper.totalMarks || '20'}</span>
    </div>
    
    <div class="general-instructions">
      All questions are compulsory unless stated otherwise.
    </div>
    
    <div class="student-details">
      <div>Name: <span class="fill-line"></span></div>
      <div>Roll Number: <span class="fill-line"></span></div>
      <div>Class: ${className || 'Standard'} Section: <span class="fill-line" style="min-width: 60px;"></span></div>
    </div>
    
    ${sections}
    
    <div class="answer-section">
      <div class="answer-title">Answer Key</div>
      ${answerKey}
    </div>
  </div>
</body>
</html>`;
  }
}

export default new PDFService();
