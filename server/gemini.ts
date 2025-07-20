import { GoogleGenAI } from "@google/genai";

// Gemini AI service for EduAI Platform
// Supports multilingual content generation for Indian education context

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ContentGenerationOptions {
  prompt: string;
  grades: number[];
  languages: string[];
  contentSource: 'prebook' | 'external';
  agentType: string;
}

export interface LessonPlanOptions {
  subject: string;
  grades: number[];
  timeframe: string;
  language?: string;
}

export interface VisualAidsOptions {
  concept: string;
  grades: number[];
  type: 'diagram' | 'flowchart' | 'infographic';
}

export class GeminiEduService {
  
  async generateLocalizedContent(options: ContentGenerationOptions): Promise<any> {
    const { prompt, grades, languages, contentSource, agentType } = options;
    
    const systemPrompt = `You are an expert Indian education specialist creating content for multi-grade classrooms.
    
Context:
- Target grades: ${grades.join(', ')}
- Languages: ${languages.join(', ')}
- Content source: ${contentSource === 'prebook' ? 'NCERT curriculum books' : 'external educational resources'}
- Agent type: ${agentType}

Requirements:
- Create culturally relevant content for Indian students
- Include local examples, festivals, and cultural references
- Adapt difficulty for the specified grade levels
- If multiple languages requested, provide bilingual content
- Follow NCERT pedagogy principles
- Make content engaging and interactive

Generate educational content based on: ${prompt}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      return {
        content: response.text || "Content generation failed",
        metadata: {
          grades,
          languages,
          contentSource,
          culturallyRelevant: true,
          ncertAligned: contentSource === 'prebook'
        },
        agentType
      };
    } catch (error) {
      throw new Error(`Gemini content generation failed: ${error}`);
    }
  }

  async createDifferentiatedMaterials(sourceContent: string, grades: number[]): Promise<any> {
    const systemPrompt = `You are an expert educator specializing in differentiated instruction for Indian multi-grade classrooms.

Task: Adapt the following content for different grade levels (${grades.join(', ')}).

Source Content: ${sourceContent}

Instructions:
- Create grade-appropriate versions maintaining core concepts
- Adjust vocabulary, complexity, and examples for each grade
- Include cultural context relevant to Indian students
- Provide assessment questions for each level
- Format as structured learning materials

Provide differentiated versions for each specified grade level.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: systemPrompt,
      });

      return {
        materials: grades.map(grade => ({
          grade,
          content: response.text || `Adapted content for grade ${grade}`,
          difficulty: grade <= 5 ? 'foundational' : grade <= 8 ? 'intermediate' : 'advanced',
          assessments: []
        })),
        metadata: {
          sourceContentLength: sourceContent.length,
          adaptationStrategy: 'differentiated_instruction',
          culturalContext: 'indian_education'
        }
      };
    } catch (error) {
      throw new Error(`Differentiation failed: ${error}`);
    }
  }

  async createLessonPlan(options: LessonPlanOptions): Promise<any> {
    const { subject, grades, timeframe, language = 'English' } = options;
    
    const systemPrompt = `You are an experienced Indian teacher creating lesson plans for multi-grade classrooms.

Subject: ${subject}
Grade levels: ${grades.join(', ')}
Timeframe: ${timeframe}
Language: ${language}

Create a comprehensive lesson plan that includes:
1. Learning objectives aligned with NCERT curriculum
2. Week-by-week breakdown
3. Activities suitable for multi-grade teaching
4. Assessment strategies
5. Local cultural integration
6. Resource requirements
7. Differentiation strategies for different grades

Ensure the plan is practical for Indian classroom contexts with limited resources.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: systemPrompt,
      });

      return {
        subject,
        grades,
        timeframe,
        language,
        plan: response.text || "Lesson plan generation failed",
        metadata: {
          ncertAligned: true,
          multiGradeOptimized: true,
          culturallyRelevant: true
        }
      };
    } catch (error) {
      throw new Error(`Lesson planning failed: ${error}`);
    }
  }

  async generateVisualAids(options: VisualAidsOptions): Promise<any> {
    const { concept, grades, type } = options;
    
    const systemPrompt = `You are an expert educational content creator specializing in visual learning aids for Indian students.

Concept: ${concept}
Target grades: ${grades.join(', ')}
Visual type: ${type}

Create detailed instructions for a ${type} that:
1. Explains the concept clearly for the target grades
2. Uses Indian cultural references and examples
3. Is suitable for low-resource classroom environments
4. Can be created with basic materials
5. Includes step-by-step creation guide
6. Provides usage instructions for teachers

Focus on making complex concepts accessible through visual representation.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      return {
        concept,
        type,
        grades,
        instructions: response.text || "Visual aid instructions generation failed",
        metadata: {
          materialRequirements: 'basic_classroom_supplies',
          complexity: grades.includes(1) || grades.includes(2) ? 'simple' : 'moderate',
          culturalContext: 'indian_education'
        }
      };
    } catch (error) {
      throw new Error(`Visual aids generation failed: ${error}`);
    }
  }

  async analyzePerformance(studentData: any, grades: number[]): Promise<any> {
    const systemPrompt = `You are an educational data analyst specializing in Indian multi-grade classroom performance analysis.

Student data: ${JSON.stringify(studentData)}
Grade levels: ${grades.join(', ')}

Analyze the performance data and provide:
1. Learning pattern identification
2. Areas of strength and improvement
3. Personalized learning recommendations
4. Grade-specific insights
5. Cultural and contextual considerations
6. Remedial strategies
7. Parent engagement suggestions

Consider the Indian education context and provide actionable insights for teachers.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              strengths: { type: "array", items: { type: "string" } },
              improvements: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } },
              gradeSpecificInsights: { type: "object" }
            }
          }
        },
        contents: systemPrompt,
      });

      const analysis = JSON.parse(response.text || "{}");
      
      return {
        analysis,
        metadata: {
          dataPoints: Object.keys(studentData).length,
          grades,
          analysisType: 'comprehensive_performance',
          culturalContext: 'indian_education'
        }
      };
    } catch (error) {
      throw new Error(`Performance analysis failed: ${error}`);
    }
  }

  async processInstantQuery(query: string, language: string = 'English'): Promise<any> {
    const systemPrompt = `You are a knowledgeable Indian education assistant providing instant answers to teachers and students.

Query: ${query}
Response language: ${language}

Provide a clear, concise answer that:
1. Is appropriate for the Indian education context
2. Uses local examples and analogies
3. Is culturally sensitive
4. Includes practical applications
5. Suggests follow-up learning activities

Keep the response engaging and educational.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      return {
        answer: response.text || "Unable to process query",
        language,
        metadata: {
          queryType: 'instant_knowledge',
          culturalContext: 'indian_education',
          responseTime: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Query processing failed: ${error}`);
    }
  }
}

export const geminiEduService = new GeminiEduService();