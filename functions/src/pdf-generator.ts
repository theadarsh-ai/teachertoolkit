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
    
    // Parse lesson plan content if it's JSON
    let lessonPlan;
    try {
      lessonPlan = JSON.parse(content);
    } catch (e) {
      lessonPlan = null;
    }
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.5;
          color: #2c3e50;
          font-size: 12px;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          padding: 25px;
          margin-bottom: 25px;
          border-radius: 8px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        
        .header-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          margin-top: 10px;
          opacity: 0.95;
        }
        
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .section-title {
          background: #ecf0f1;
          color: #2c3e50;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: bold;
          border-left: 4px solid #3498db;
          margin-bottom: 10px;
        }
        
        .objectives-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .objective-item {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          border-left: 3px solid #27ae60;
        }
        
        .daily-lesson {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 15px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        
        .daily-header {
          background: linear-gradient(135deg, #34495e, #2c3e50);
          color: white;
          padding: 12px 15px;
          font-weight: bold;
          font-size: 13px;
        }
        
        .daily-content {
          padding: 15px;
        }
        
        .daily-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 15px;
          margin-bottom: 12px;
          align-items: start;
        }
        
        .daily-label {
          font-weight: bold;
          color: #34495e;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .daily-value {
          font-size: 11px;
          line-height: 1.4;
        }
        
        .daily-value ul {
          margin: 0;
          padding-left: 15px;
        }
        
        .daily-value li {
          margin-bottom: 3px;
        }
        
        .ncert-ref {
          background: #e8f5e8;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #27ae60;
          font-size: 10px;
          color: #27ae60;
          font-weight: bold;
        }
        
        .assessment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .assessment-card {
          background: #f1f2f6;
          padding: 15px;
          border-radius: 6px;
          border-top: 3px solid #e74c3c;
        }
        
        .assessment-title {
          font-weight: bold;
          color: #e74c3c;
          margin-bottom: 5px;
          font-size: 12px;
        }
        
        .resource-list {
          columns: 2;
          column-gap: 20px;
          font-size: 11px;
        }
        
        .resource-item {
          break-inside: avoid;
          margin-bottom: 5px;
          padding: 5px 0;
        }
        
        .footer {
          margin-top: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          text-align: center;
          font-size: 10px;
          color: #7f8c8d;
        }
        
        .ncert-alignment {
          background: #fff3cd;
          padding: 15px;
          border: 1px solid #ffeaa7;
          border-radius: 6px;
          margin-top: 15px;
        }
        
        .ncert-alignment h4 {
          color: #b8860b;
          margin-bottom: 10px;
          font-size: 12px;
        }
        
        .page-break {
          page-break-before: always;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title}</h1>
        <div class="header-meta">
          <span>Subject: ${subject || 'General'}</span>
          <span>Grade: ${grades.join(', ')}</span>
          <span>Generated: ${generatedAt.toLocaleDateString()}</span>
        </div>
      </div>

      ${this.generateLessonPlanHTML(lessonPlan, content)}

      <div class="footer">
        <p>Generated by EduAI Platform - AI-Powered Educational Assistant</p>
        <p>This lesson plan is aligned with NCERT curriculum standards and Indian educational context</p>
      </div>
    </body>
    </html>
    `;
  }

  private generateLessonPlanHTML(lessonPlan: any, rawContent: string): string {
    if (!lessonPlan) {
      return `<div class="section"><div class="section-title">Content</div><div style="padding: 15px; white-space: pre-wrap;">${rawContent}</div></div>`;
    }

    let html = '';

    // Learning Objectives Section
    if (lessonPlan.objectives && lessonPlan.objectives.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">🎯 Learning Objectives</div>
          <div class="objectives-grid">
            ${lessonPlan.objectives.map((obj: string, index: number) => `
              <div class="objective-item">
                <strong>Objective ${index + 1}:</strong> ${obj}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Daily Lessons Section
    if (lessonPlan.dailyLessons && lessonPlan.dailyLessons.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">📅 Daily Lesson Plan</div>
          ${lessonPlan.dailyLessons.map((lesson: any) => `
            <div class="daily-lesson">
              <div class="daily-header">
                ${lesson.day} - ${lesson.topic} (${lesson.duration || '40'} minutes)
              </div>
              <div class="daily-content">
                <div class="daily-row">
                  <div class="daily-label">Learning Goals</div>
                  <div class="daily-value">
                    ${lesson.objectives ? `<ul>${lesson.objectives.map((obj: string) => `<li>${obj}</li>`).join('')}</ul>` : 'Not specified'}
                  </div>
                </div>
                
                <div class="daily-row">
                  <div class="daily-label">Activities</div>
                  <div class="daily-value">
                    ${lesson.activities ? `<ul>${lesson.activities.map((activity: string) => `<li>${activity}</li>`).join('')}</ul>` : 'Standard classroom activities'}
                  </div>
                </div>
                
                <div class="daily-row">
                  <div class="daily-label">Materials Needed</div>
                  <div class="daily-value">
                    ${lesson.materials ? `<ul>${lesson.materials.map((material: string) => `<li>${material}</li>`).join('')}</ul>` : 'Basic classroom materials'}
                  </div>
                </div>
                
                <div class="daily-row">
                  <div class="daily-label">Homework</div>
                  <div class="daily-value">${lesson.homework || 'Review today\'s topics'}</div>
                </div>
                
                ${lesson.ncertReference ? `
                  <div class="daily-row">
                    <div class="daily-label">NCERT Reference</div>
                    <div class="daily-value">
                      <div class="ncert-ref">${lesson.ncertReference}</div>
                    </div>
                  </div>
                ` : ''}
                
                ${lesson.notes ? `
                  <div class="daily-row">
                    <div class="daily-label">Teacher Notes</div>
                    <div class="daily-value"><em>${lesson.notes}</em></div>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Assessments Section
    if (lessonPlan.assessments && lessonPlan.assessments.length > 0) {
      html += `
        <div class="section page-break">
          <div class="section-title">📊 Assessment Strategy</div>
          <div class="assessment-grid">
            ${lessonPlan.assessments.map((assessment: any) => `
              <div class="assessment-card">
                <div class="assessment-title">${assessment.title || assessment.type}</div>
                <p><strong>Type:</strong> ${assessment.type}</p>
                <p><strong>Description:</strong> ${assessment.description}</p>
                ${assessment.points ? `<p><strong>Points:</strong> ${assessment.points}</p>` : ''}
                ${assessment.dueDate ? `<p><strong>Due Date:</strong> ${assessment.dueDate}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Resources Section
    if (lessonPlan.resources && lessonPlan.resources.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">📚 Resources & Materials</div>
          <div class="resource-list">
            ${lessonPlan.resources.map((resource: string) => `
              <div class="resource-item">✓ ${resource}</div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // NCERT Alignment Section
    if (lessonPlan.ncertAlignment) {
      html += `
        <div class="section">
          <div class="section-title">📖 NCERT Curriculum Alignment</div>
          <div class="ncert-alignment">
            <h4>Textbook References:</h4>
            ${lessonPlan.ncertAlignment.textbooks ? `
              <ul>
                ${lessonPlan.ncertAlignment.textbooks.map((book: any) => `
                  <li><strong>${book.title}</strong> (${book.language})</li>
                `).join('')}
              </ul>
            ` : '<p>Standard NCERT textbooks for the grade level</p>'}
            
            ${lessonPlan.ncertAlignment.chapters ? `
              <h4 style="margin-top: 10px;">Relevant Chapters:</h4>
              <p>${lessonPlan.ncertAlignment.chapters}</p>
            ` : ''}
            
            ${lessonPlan.ncertAlignment.learningOutcomes ? `
              <h4 style="margin-top: 10px;">Learning Outcomes:</h4>
              <p>${lessonPlan.ncertAlignment.learningOutcomes}</p>
            ` : ''}
          </div>
        </div>
      `;
    }

    return html;
  }

  async generatePDF(options: PDFGenerationOptions): Promise<{ filePath: string; fileName: string }> {
    const html = this.generateHTMLTemplate(options);
    
    // Create unique filename
    const timestamp = Date.now();
    const sanitizedTitle = options.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${sanitizedTitle}_${timestamp}.pdf`;
    const filePath = path.join(this.outputDir, filename);

    try {
      // Import jsPDF for PDF generation
      const { jsPDF } = await import('jspdf');
      
      // Create PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Parse lesson plan content if it's JSON
      let lessonPlan;
      try {
        lessonPlan = JSON.parse(options.content);
      } catch (e) {
        lessonPlan = null;
      }
      
      // Add structured content to PDF
      this.addContentToPDF(doc, options, lessonPlan);
      
      // Save PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      await fs.writeFile(filePath, pdfBuffer);
      
      console.log(`✅ PDF generated successfully: ${filename}`);
      return { filePath, fileName: filename };
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addContentToPDF(doc: any, options: PDFGenerationOptions, lessonPlan: any) {
    let currentY = 20;
    const pageHeight = 297; // A4 height in mm
    const margin = 20;
    const contentWidth = 170;

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(options.title, margin, currentY);
    currentY += 15;

    // Header info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Subject: ${options.subject || 'General'} | Grade: ${options.grades.join(', ')} | Generated: ${options.generatedAt.toLocaleDateString()}`, margin, currentY);
    currentY += 15;

    if (lessonPlan) {
      // Learning Objectives
      if (lessonPlan.objectives && lessonPlan.objectives.length > 0) {
        currentY = this.addSection(doc, 'LEARNING OBJECTIVES', currentY, margin, contentWidth, pageHeight);
        lessonPlan.objectives.forEach((obj: string, index: number) => {
          const text = `${index + 1}. ${obj}`;
          const lines = doc.splitTextToSize(text, contentWidth);
          if (currentY + (lines.length * 5) > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
          }
          doc.text(lines, margin + 5, currentY);
          currentY += lines.length * 5 + 3;
        });
        currentY += 10;
      }

      // Daily Lessons
      if (lessonPlan.dailyLessons && lessonPlan.dailyLessons.length > 0) {
        currentY = this.addSection(doc, 'DAILY LESSON PLAN', currentY, margin, contentWidth, pageHeight);
        
        lessonPlan.dailyLessons.forEach((lesson: any) => {
          // Check if we need a new page
          if (currentY + 60 > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
          }

          // Day header
          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          doc.text(`${lesson.day} - ${lesson.topic} (${lesson.duration || '40'} minutes)`, margin, currentY);
          currentY += 8;

          doc.setFontSize(9);
          doc.setFont(undefined, 'normal');

          // Learning Goals
          if (lesson.objectives) {
            doc.setFont(undefined, 'bold');
            doc.text('Learning Goals:', margin + 5, currentY);
            currentY += 5;
            doc.setFont(undefined, 'normal');
            lesson.objectives.forEach((obj: string) => {
              const lines = doc.splitTextToSize(`• ${obj}`, contentWidth - 10);
              doc.text(lines, margin + 10, currentY);
              currentY += lines.length * 4;
            });
            currentY += 3;
          }

          // Activities
          if (lesson.activities) {
            doc.setFont(undefined, 'bold');
            doc.text('Activities:', margin + 5, currentY);
            currentY += 5;
            doc.setFont(undefined, 'normal');
            lesson.activities.forEach((activity: string) => {
              const lines = doc.splitTextToSize(`• ${activity}`, contentWidth - 10);
              doc.text(lines, margin + 10, currentY);
              currentY += lines.length * 4;
            });
            currentY += 3;
          }

          // Materials
          if (lesson.materials) {
            doc.setFont(undefined, 'bold');
            doc.text('Materials:', margin + 5, currentY);
            currentY += 5;
            doc.setFont(undefined, 'normal');
            lesson.materials.forEach((material: string) => {
              const lines = doc.splitTextToSize(`• ${material}`, contentWidth - 10);
              doc.text(lines, margin + 10, currentY);
              currentY += lines.length * 4;
            });
            currentY += 3;
          }

          // NCERT Reference
          if (lesson.ncertReference) {
            doc.setFont(undefined, 'bold');
            doc.text('NCERT Reference:', margin + 5, currentY);
            currentY += 5;
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(lesson.ncertReference, contentWidth - 10);
            doc.text(lines, margin + 10, currentY);
            currentY += lines.length * 4 + 3;
          }

          // Homework
          if (lesson.homework) {
            doc.setFont(undefined, 'bold');
            doc.text('Homework:', margin + 5, currentY);
            currentY += 5;
            doc.setFont(undefined, 'normal');
            const lines = doc.splitTextToSize(lesson.homework, contentWidth - 10);
            doc.text(lines, margin + 10, currentY);
            currentY += lines.length * 4;
          }

          currentY += 10; // Space between lessons
        });
      }

      // Assessments
      if (lessonPlan.assessments && lessonPlan.assessments.length > 0) {
        currentY = this.addSection(doc, 'ASSESSMENT STRATEGY', currentY, margin, contentWidth, pageHeight);
        lessonPlan.assessments.forEach((assessment: any) => {
          if (currentY + 20 > pageHeight - 20) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFont(undefined, 'bold');
          doc.text(assessment.title || assessment.type, margin + 5, currentY);
          currentY += 6;
          
          doc.setFont(undefined, 'normal');
          doc.text(`Type: ${assessment.type}`, margin + 5, currentY);
          currentY += 5;
          
          const descLines = doc.splitTextToSize(assessment.description, contentWidth - 10);
          doc.text(descLines, margin + 5, currentY);
          currentY += descLines.length * 4 + 5;
        });
      }
    } else {
      // Fallback for non-JSON content
      doc.setFontSize(11);
      const textContent = this.extractTextFromHTML(options.content);
      const lines = doc.splitTextToSize(textContent, contentWidth);
      doc.text(lines, margin, currentY);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Generated by EduAI Platform - NCERT Curriculum Aligned', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, contentWidth, pageHeight - 10);
    }
  }

  private addSection(doc: any, title: string, currentY: number, margin: number, contentWidth: number, pageHeight: number): number {
    if (currentY + 15 > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(title, margin, currentY);
    currentY += 10;
    
    // Add underline
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 8;
    
    return currentY;
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