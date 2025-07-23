import * as fs from 'fs';
import * as path from 'path';

interface HTMLGenerationOptions {
  title: string;
  content: string;
  grades: number[];
  languages: string[];
  agentType: string;
  generatedAt: Date;
  questionType?: string;
  questionCount?: number;
}

class HTMLGenerator {
  private ensureOutputDirectory() {
    const outputDir = 'generated_htmls';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✅ Created HTML output directory: ${outputDir}`);
    }
  }

  private generateCSS(): string {
    return `
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
        
        .worksheet-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 12px;
          border: 2px solid #0ea5e9;
        }
        
        .worksheet-info {
          margin-top: 15px;
        }
        
        .worksheet-info p {
          margin: 8px 0;
          font-weight: 500;
        }
        
        .question-block {
          margin: 25px 0;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border-left: 4px solid #4f46e5;
        }
        
        .question-text {
          font-weight: 600;
          margin: 10px 0 15px 0;
          color: #1e293b;
        }
        
        .options {
          margin-left: 20px;
        }
        
        .option {
          margin: 8px 0;
          padding: 8px 12px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        
        .highlight-box {
          background: linear-gradient(135deg, #fef3c7, #fed7aa);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
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
    `;
  }

  async generateHTML(options: HTMLGenerationOptions): Promise<{ fileName: string; success: boolean }> {
    try {
      this.ensureOutputDirectory();
      
      const timestamp = Date.now();
      const sanitizedTitle = options.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `${sanitizedTitle}_${timestamp}.html`;
      const filePath = path.join('generated_htmls', fileName);
      
      const formattedDate = options.generatedAt.toLocaleDateString('en-GB');
      
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    ${this.generateCSS()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${options.title}</h1>
      <div class="subtitle">AI-Generated Educational Content for Multi-Grade Classrooms</div>
      
      <div class="metadata">
        <div class="metadata-grid">
          <div class="metadata-item">
            <div class="metadata-label">Target Grades</div>
            <div class="metadata-value">${options.grades.join(', ')}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Languages</div>
            <div class="metadata-value">${options.languages.join(', ')}</div>
          </div>
          ${options.questionCount ? `
          <div class="metadata-item">
            <div class="metadata-label">Question Count</div>
            <div class="metadata-value">${options.questionCount}</div>
          </div>` : ''}
          <div class="metadata-item">
            <div class="metadata-label">Generated By</div>
            <div class="metadata-value">${options.agentType}</div>
          </div>
          <div class="metadata-item">
            <div class="metadata-label">Generated On</div>
            <div class="metadata-value">${formattedDate}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="content-section">
      <div class="content-body">
        ${options.content}
      </div>
    </div>
    
    <div class="footer">
      <div class="brand">EduAI Platform</div>
      <div class="tagline">Empowering Teachers with AI-Powered Educational Tools</div>
      <div class="generation-info">
        Generated by Gemini AI • ${formattedDate} • Multi-Grade Classroom Support
      </div>
    </div>
  </div>
</body>
</html>`;

      fs.writeFileSync(filePath, htmlContent, 'utf8');
      
      console.log(`✅ HTML generated successfully: ${fileName}`);
      return { fileName, success: true };
      
    } catch (error) {
      console.error('❌ HTML generation failed:', error);
      return { fileName: '', success: false };
    }
  }
}

export const htmlGenerator = new HTMLGenerator();