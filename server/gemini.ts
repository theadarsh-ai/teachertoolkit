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

  async processImageForWorksheet(options: {
    imageBuffer: Buffer;
    imageMimeType: string;
    grades: number[];
    questionType: 'multiple-choice' | 'worksheet';
    questionCount: number;
  }): Promise<{
    questions: any[];
    answers: any[];
    questionsContent: string;
    answersContent: string;
  }> {
    try {
      console.log(`📸 Processing image for ${options.questionType} worksheet with ${options.questionCount} questions`);

      // Convert buffer to base64
      const imageBase64 = options.imageBuffer.toString('base64');

      const systemPrompt = `You are an expert educator creating differentiated worksheets from textbook pages. 

Your task:
1. Analyze the uploaded textbook page image carefully
2. Extract key educational concepts, topics, and information
3. Create ${options.questionCount} ${options.questionType === 'multiple-choice' ? 'multiple choice questions' : 'mixed questions'} suitable for grades ${options.grades.join(', ')}
4. Ensure questions test understanding, not just memorization
5. Include Indian cultural context where appropriate
6. Provide detailed answer explanations

Format your response as JSON with:
- questions: array of question objects
- answers: array of corresponding answer objects with explanations

For multiple choice questions, include:
- question text
- 4 options (A, B, C, D)
- correct answer
- explanation

Make questions progressively more challenging if multiple grades are selected.`;

      const userPrompt = `Please analyze this textbook page image and create ${options.questionCount} ${options.questionType === 'multiple-choice' ? 'multiple choice questions' : 'mixed questions'} for grades ${options.grades.join(', ')}.

Focus on the main educational content and concepts shown in the image. Make sure questions are:
- Grade-appropriate for levels ${options.grades.join(', ')}
- Clear and unambiguous
- Educationally valuable
- Include Indian context where relevant

Return the response in JSON format with separate questions and answers arrays.`;

      const contents = [
        {
          inlineData: {
            data: imageBase64,
            mimeType: options.imageMimeType,
          },
        },
        userPrompt
      ];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro", // Using Pro for complex multimodal analysis
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: contents,
      });

      const rawJson = response.text;
      console.log("📝 Gemini image analysis response received");

      if (!rawJson) {
        throw new Error("Empty response from Gemini model");
      }

      const parsedData = JSON.parse(rawJson);
      
      // Format content for PDF generation
      const questionsContent = this.formatQuestionsForPDF(parsedData.questions, { ...options, grades: options.grades });
      const answersContent = this.formatAnswersForPDF(parsedData.answers, { ...options, grades: options.grades });

      return {
        questions: parsedData.questions,
        answers: parsedData.answers,
        questionsContent,
        answersContent
      };

    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image for worksheet generation: ${error.message}`);
    }
  }

  private formatQuestionsForPDF(questions: any[], options: any): string {
    let content = `<div class="worksheet-header">
      <h1>📚 ${options.questionType === 'multiple-choice' ? 'Multiple Choice Questions' : 'Mixed Worksheet'}</h1>
      <div class="worksheet-info">
        <p><strong>Grade Levels:</strong> ${Array.isArray(options.grades) ? options.grades.join(', ') : options.grades}</p>
        <p><strong>Number of Questions:</strong> ${questions.length}</p>
        <p><strong>Instructions:</strong> Choose the best answer for each question. Mark your answers clearly.</p>
      </div>
    </div>`;

    questions.forEach((q, index) => {
      content += `<div class="question-block">
        <h3>Question ${index + 1}</h3>
        <p class="question-text">${q.question || q.text}</p>`;
      
      if (q.options) {
        content += `<div class="options">`;
        q.options.forEach((option: string, optIndex: number) => {
          const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
          content += `<p class="option"><strong>${letter}.</strong> ${option}</p>`;
        });
        content += `</div>`;
      }
      
      content += `</div>`;
    });

    return content;
  }

  private formatAnswersForPDF(answers: any[], options: any): string {
    let content = `<div class="answer-header">
      <h1>🔑 Answer Key</h1>
      <div class="answer-info">
        <p><strong>Grade Levels:</strong> ${Array.isArray(options.grades) ? options.grades.join(', ') : options.grades}</p>
        <p><strong>Total Questions:</strong> ${answers.length}</p>
      </div>
    </div>`;

    answers.forEach((a, index) => {
      content += `<div class="answer-block">
        <h3>Answer ${index + 1}</h3>
        <p class="correct-answer"><strong>Correct Answer:</strong> ${a.correctAnswer || a.answer}</p>`;
      
      if (a.explanation) {
        content += `<div class="explanation">
          <h4>Explanation:</h4>
          <p>${a.explanation}</p>
        </div>`;
      }
      
      content += `</div>`;
    });

    return content;
  }

  async createDifferentiatedMaterials(
    sourceContent: string, 
    grades: number[], 
    options: {
      questionType: 'multiple-choice' | 'worksheet';
      questionCount: number;
    }
  ): Promise<{
    questions: any[];
    answers: any[];
    questionsContent: string;
    answersContent: string;
  }> {
    try {
      console.log(`📝 Creating ${options.questionType} materials from text content`);

      const systemPrompt = `You are an expert educator creating differentiated worksheets from educational content.

Your task:
1. Analyze the provided text content carefully
2. Create ${options.questionCount} ${options.questionType === 'multiple-choice' ? 'multiple choice questions' : 'mixed questions'} suitable for grades ${grades.join(', ')}
3. Ensure questions test understanding and application
4. Include Indian cultural examples where appropriate
5. Provide detailed explanations for all answers

Format your response as JSON with:
- questions: array of question objects
- answers: array of corresponding answer objects with explanations

For multiple choice questions, include:
- question text
- 4 options (A, B, C, D)
- correct answer
- explanation`;

      const userPrompt = `Based on this educational content, create ${options.questionCount} ${options.questionType === 'multiple-choice' ? 'multiple choice questions' : 'mixed questions'} for grades ${grades.join(', ')}:

"${sourceContent}"

Make questions that:
- Test key concepts and understanding
- Are appropriate for grades ${grades.join(', ')}
- Include practical applications
- Use Indian context where relevant

Return in JSON format with questions and answers arrays.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
        },
        contents: userPrompt,
      });

      const rawJson = response.text;
      console.log("📝 Gemini text analysis response received");

      if (!rawJson) {
        throw new Error("Empty response from Gemini model");
      }

      const parsedData = JSON.parse(rawJson);
      
      // Format content for PDF generation  
      const questionsContent = this.formatQuestionsForPDF(parsedData.questions, { ...options, grades });
      const answersContent = this.formatAnswersForPDF(parsedData.answers, { ...options, grades });

      return {
        questions: parsedData.questions,
        answers: parsedData.answers,
        questionsContent,
        answersContent
      };

    } catch (error) {
      console.error('Text processing error:', error);
      throw new Error(`Failed to create differentiated materials: ${error.message}`);
    }
  }
}

export const geminiEduService = new GeminiEduService();