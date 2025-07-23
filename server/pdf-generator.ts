import { promises as fs } from 'fs';
import path from 'path';

export interface PDFGenerationOptions {
  title: string;
  content: string;
  grades: number[];
  languages: string[];
  subject?: string;
  agentType: string;
  generatedAt: Date;
}

export class PDFGeneratorService {
  private readonly outputDir = path.join(process.cwd(), 'generated_pdfs');

  constructor() {
    this.ensureOutputDirectory();
  }

  private async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  private generateHTMLTemplate(options: PDFGenerationOptions): string {
    const { title, content, grades, languages, subject, agentType, generatedAt } = options;
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 700;
        }
        
        .header .subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 20px;
        }
        
        .metadata {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 10px;
          margin-top: 20px;
        }
        
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          text-align: center;
        }
        
        .metadata-item {
          background: rgba(255,255,255,0.1);
          padding: 10px;
          border-radius: 8px;
        }
        
        .metadata-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-bottom: 5px;
        }
        
        .metadata-value {
          font-weight: 600;
          font-size: 1rem;
        }
        
        .content-section {
          padding: 40px;
        }
        
        .content-body {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #444;
        }
        
        .content-body h2 {
          color: #4f46e5;
          margin: 30px 0 15px 0;
          font-size: 1.8rem;
          border-bottom: 3px solid #e5e7eb;
          padding-bottom: 10px;
        }
        
        .content-body h3 {
          color: #6366f1;
          margin: 25px 0 12px 0;
          font-size: 1.4rem;
        }
        
        .content-body h4 {
          color: #7c3aed;
          margin: 20px 0 10px 0;
          font-size: 1.2rem;
        }
        
        .content-body p {
          margin-bottom: 15px;
          text-align: justify;
        }
        
        .content-body ul, .content-body ol {
          margin: 15px 0;
          padding-left: 25px;
        }
        
        .content-body li {
          margin-bottom: 8px;
        }
        
        .content-body blockquote {
          background: #f8fafc;
          border-left: 4px solid #4f46e5;
          padding: 15px 20px;
          margin: 20px 0;
          font-style: italic;
          color: #666;
        }
        
        .content-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
        }
        
        .content-body th, .content-body td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .content-body th {
          background: #f8fafc;
          font-weight: 600;
          color: #4f46e5;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, #fef3c7, #fed7aa);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .highlight-box .icon {
          font-size: 2rem;
          margin-bottom: 10px;
          display: block;
        }
        
        .activity-box {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .cultural-reference {
          background: linear-gradient(135deg, #fce7f3, #f3e8ff);
          border: 2px solid #a855f7;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        
        .footer {
          background: #f8fafc;
          padding: 30px;
          text-align: center;
          border-top: 2px solid #e5e7eb;
        }
        
        .footer .brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4f46e5;
          margin-bottom: 10px;
        }
        
        .footer .tagline {
          color: #666;
          font-style: italic;
        }
        
        .footer .generation-info {
          margin-top: 20px;
          font-size: 0.9rem;
          color: #888;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <div class="subtitle">AI-Generated Educational Content for Multi-Grade Classrooms</div>
          
          <div class="metadata">
            <div class="metadata-grid">
              <div class="metadata-item">
                <div class="metadata-label">Target Grades</div>
                <div class="metadata-value">${grades.join(', ')}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Languages</div>
                <div class="metadata-value">${languages.join(', ')}</div>
              </div>
              ${subject ? `
              <div class="metadata-item">
                <div class="metadata-label">Subject</div>
                <div class="metadata-value">${subject}</div>
              </div>
              ` : ''}
              <div class="metadata-item">
                <div class="metadata-label">Generated By</div>
                <div class="metadata-value">${agentType}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Generated On</div>
                <div class="metadata-value">${generatedAt.toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="content-section">
          <div class="content-body">
            ${this.formatContent(content)}
          </div>
        </div>
        
        <div class="footer">
          <div class="brand">EduAI Platform</div>
          <div class="tagline">Empowering Teachers in Multi-Grade Classrooms with AI</div>
          <div class="generation-info">
            Document generated on ${generatedAt.toLocaleString('en-IN')} 
            • NCERT Curriculum Aligned • Culturally Relevant Content
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private formatContent(content: string): string {
    // Handle undefined or null content
    if (!content || typeof content !== 'string') {
      console.warn('formatContent received invalid content:', typeof content, content);
      return '<div class="error-message"><p>⚠️ Content generation failed. Please try again.</p></div>';
    }

    // If content is already HTML (contains tags), return as-is
    if (content.includes('<div') || content.includes('<h1') || content.includes('<p')) {
      return content;
    }
    
    // Enhanced content formatting with special boxes and styling
    let formattedContent = content
      // Convert markdown-style headers
      .replace(/^# (.*$)/gm, '<h2>$1</h2>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Convert lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      
      // Convert line breaks to paragraphs
      .split('\n\n')
      .map(paragraph => {
        paragraph = paragraph.trim();
        if (!paragraph) return '';
        
        // Check for special content types
        if (paragraph.includes('🎯') || paragraph.includes('Key Point:') || paragraph.includes('Important:')) {
          return `<div class="highlight-box"><span class="icon">🎯</span>${paragraph}</div>`;
        }
        
        if (paragraph.includes('🎪') || paragraph.includes('Activity:') || paragraph.includes('Exercise:')) {
          return `<div class="activity-box"><span class="icon">🎪</span>${paragraph}</div>`;
        }
        
        if (paragraph.includes('🏛️') || paragraph.includes('Cultural Context:') || paragraph.includes('Indian Example:')) {
          return `<div class="cultural-reference"><span class="icon">🏛️</span>${paragraph}</div>`;
        }
        
        // Handle lists
        if (paragraph.includes('<li>')) {
          if (paragraph.match(/^\d/)) {
            return `<ol>${paragraph}</ol>`;
          } else {
            return `<ul>${paragraph}</ul>`;
          }
        }
        
        // Regular paragraphs
        if (!paragraph.startsWith('<')) {
          return `<p>${paragraph}</p>`;
        }
        
        return paragraph;
      })
      .join('\n');

    return formattedContent;
  }

  async generatePDF(options: PDFGenerationOptions): Promise<{ filePath: string; filename: string }> {
    const html = this.generateHTMLTemplate(options);
    
    // Create unique filename
    const timestamp = Date.now();
    const sanitizedTitle = options.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${sanitizedTitle}_${timestamp}.pdf`;
    const filePath = path.join(this.outputDir, filename);

    try {
      // Import jsPDF and html2canvas for PDF generation
      const { jsPDF } = await import('jspdf');
      const html2canvas = await import('html2canvas');
      
      // Create a temporary div to render HTML
      const tempDiv = `
        <div id="pdf-content" style="width: 794px; padding: 20px; font-family: Arial, sans-serif;">
          ${html}
        </div>
      `;
      
      // For server-side PDF generation, use a simpler approach
      // Convert HTML to PDF using jsPDF with text content
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Extract text content and format for PDF
      const textContent = this.extractTextFromHTML(options.content);
      
      // Add title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(options.title, 20, 30);
      
      // Add metadata
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated: ${options.generatedAt.toLocaleDateString()}`, 20, 40);
      doc.text(`Subject: ${options.subject || 'General'}`, 20, 45);
      doc.text(`Grades: ${options.grades.join(', ')}`, 20, 50);
      
      // Add content
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(textContent, 170);
      doc.text(lines, 20, 60);
      
      // Save PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      await fs.writeFile(filePath, pdfBuffer);
      
      console.log(`✅ PDF generated successfully: ${filename}`);
      return { filePath, filename };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractTextFromHTML(htmlContent: string): string {
    if (!htmlContent) return 'No content available';
    
    // Remove HTML tags and format for PDF
    let text = htmlContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    
    return text || 'Content extraction failed';
  }

  async cleanupOldPDFs(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();
      
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            console.log(`🧹 Cleaned up old PDF: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('PDF cleanup error:', error);
    }
  }
}

export const pdfGenerator = new PDFGeneratorService();