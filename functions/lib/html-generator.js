import { promises as fs } from 'fs';
import path from 'path';
export class HTMLGeneratorService {
    constructor() {
        this.outputDir = path.join(process.cwd(), 'generated_htmls');
        this.ensureOutputDirectory();
    }
    async ensureOutputDirectory() {
        try {
            await fs.access(this.outputDir);
        }
        catch {
            await fs.mkdir(this.outputDir, { recursive: true });
        }
    }
    generateHTMLTemplate(options) {
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
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .content {
          padding: 40px;
        }
        
        .section {
          margin-bottom: 30px;
          padding: 25px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-left: 5px solid #4f46e5;
        }
        
        .section h2 {
          color: #4f46e5;
          margin-bottom: 15px;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section h3 {
          color: #6366f1;
          margin: 20px 0 10px 0;
          font-size: 1.2rem;
        }
        
        .section p {
          margin-bottom: 15px;
          text-align: justify;
        }
        
        .section ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .section li {
          margin-bottom: 8px;
        }
        
        .cultural-context {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left-color: #f59e0b;
          margin: 20px 0;
        }
        
        .learning-objectives {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border-left-color: #10b981;
        }
        
        .activities {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-left-color: #3b82f6;
        }
        
        .assessment {
          background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
          border-left-color: #ec4899;
        }
        
        .ncert-alignment {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          border-left-color: #6366f1;
        }
        
        .highlight {
          background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #eab308;
          margin: 15px 0;
        }
        
        .grade-badge {
          display: inline-block;
          background: #4f46e5;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin: 2px;
        }
        
        .language-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          margin: 2px;
        }
        
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        
        .agent-info {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #cbd5e1;
        }
        
        .content-preview {
          white-space: pre-wrap;
          font-family: 'Georgia', serif;
          line-height: 1.8;
          font-size: 1.05rem;
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
          <div class="subtitle">Generated by ${agentType}</div>
          
          <div class="metadata">
            <div class="metadata-grid">
              <div class="metadata-item">
                <div class="metadata-label">Subject</div>
                <div class="metadata-value">${subject || 'General Education'}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Grades</div>
                <div class="metadata-value">
                  ${grades.map(grade => `<span class="grade-badge">${grade}</span>`).join('')}
                </div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Languages</div>
                <div class="metadata-value">
                  ${languages.map(lang => `<span class="language-badge">${lang}</span>`).join('')}
                </div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Generated</div>
                <div class="metadata-value">${generatedAt.toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="agent-info">
            <h3>🎯 About This Content</h3>
            <p>This educational content has been generated using AI technology specifically designed for Indian multi-grade classrooms. The content includes cultural references, local examples, and is aligned with NCERT curriculum standards.</p>
          </div>

          <div class="section learning-objectives">
            <h2>📚 Educational Content</h2>
            <div class="content-preview">${this.formatContent(content)}</div>
          </div>

          <div class="cultural-context">
            <h3>🇮🇳 Cultural Relevance</h3>
            <p>This content incorporates Indian cultural context, festivals, local examples, and regional references to make learning more relatable and engaging for Indian students.</p>
          </div>

          <div class="ncert-alignment">
            <h3>📖 NCERT Alignment</h3>
            <p>The content is designed to align with NCERT curriculum standards and can be used to supplement official textbooks with localized examples and cultural context.</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>EduAI Platform</strong> - AI-Powered Educational Assistant for Indian Classrooms</p>
          <p>Generated on ${generatedAt.toLocaleString('en-IN')} | Culturally Relevant • NCERT Aligned • Multi-Grade Optimized</p>
        </div>
      </div>
    </body>
    </html>
    `;
    }
    formatContent(content) {
        // Basic formatting for better display
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }
    async generateHTML(options) {
        const html = this.generateHTMLTemplate(options);
        // Create unique filename
        const timestamp = Date.now();
        const sanitizedTitle = options.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const filename = `${sanitizedTitle}_${timestamp}.html`;
        const filePath = path.join(this.outputDir, filename);
        try {
            await fs.writeFile(filePath, html, 'utf8');
            console.log(`✅ HTML generated successfully: ${filename}`);
            return { filePath, fileName: filename };
        }
        catch (error) {
            console.error('HTML generation error:', error);
            throw new Error(`Failed to generate HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Cleanup old files (optional)
    async cleanupOldFiles(maxAgeHours = 24) {
        try {
            const files = await fs.readdir(this.outputDir);
            const now = Date.now();
            for (const file of files) {
                if (file.endsWith('.html')) {
                    const filePath = path.join(this.outputDir, file);
                    const stats = await fs.stat(filePath);
                    const ageHours = (now - stats.mtime.getTime()) / (1000 * 60 * 60);
                    if (ageHours > maxAgeHours) {
                        await fs.unlink(filePath);
                        console.log(`🗑️ Cleaned up old HTML file: ${file}`);
                    }
                }
            }
        }
        catch (error) {
            console.error('HTML cleanup error:', error);
        }
    }
}
// Export instance for use in routes
export const htmlGenerator = new HTMLGeneratorService();
//# sourceMappingURL=html-generator.js.map