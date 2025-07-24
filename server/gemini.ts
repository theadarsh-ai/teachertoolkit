import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

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
  prompt: string;
  style?: string;
  size?: string;
  grades?: number[];
  type?: 'diagram' | 'flowchart' | 'infographic' | 'educational';
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

  async generateVisualAid(options: VisualAidsOptions): Promise<any> {
    const { prompt, style = 'educational', size = '1024x1024' } = options;
    
    // New approach: Generate image without text, then add labels separately
    const noTextPrompt = `Create a clean educational diagram: ${prompt}

IMPORTANT: Generate the diagram WITHOUT any text labels or words.
Visual Requirements:
- Simple, clear illustration with NO TEXT at all
- High contrast colors (bright colors for elements, white/light backgrounds) 
- Professional educational style suitable for Indian classrooms
- Focus purely on visual elements, shapes, and colors
- Clean geometric shapes and clear visual hierarchy
- Educational diagram style similar to NCERT textbooks
- Leave space for text labels to be added later
- No words, no letters, no text overlays whatsoever`;

    // Generate labels separately for overlay
    const labelsPrompt = `For an educational diagram about "${prompt}", provide a JSON list of text labels that should be added. 

Return ONLY a JSON array in this format:
[
  {"text": "Label Name", "x": 100, "y": 50, "size": 18},
  {"text": "Another Label", "x": 200, "y": 150, "size": 16}
]

Where x,y are coordinates (0-1024) and size is font size (14-24).
Keep labels concise, educational, and appropriate for Indian curriculum.`;
    
    try {
      console.log('🎨 Generating clean image without text...');
      
      // Generate the base image without text using Gemini 2.0 Flash (only model that supports images)
      const imageResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{ role: "user", parts: [{ text: noTextPrompt }] }],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      let baseImageUrl = null;
      const candidates = imageResponse.candidates;
      
      if (candidates && candidates.length > 0) {
        const content = candidates[0].content;
        if (content && content.parts) {
          for (const part of content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              baseImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      }

      if (!baseImageUrl) {
        throw new Error("Failed to generate base image");
      }

      // Generate labels separately using text-only model
      console.log('📝 Generating text labels...');
      const labelsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: labelsPrompt,
      });

      let labels = [];
      try {
        if (labelsResponse.text) {
          // Extract JSON from response
          const jsonMatch = labelsResponse.text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            labels = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        console.log('Labels parsing failed, using base image only');
      }

      console.log('✅ Generated clean image with text overlay capability');
      return {
        success: true,
        imageUrl: baseImageUrl,
        labels: labels,
        prompt: prompt,
        style,
        size,
        timestamp: Date.now(),
        model: "gemini-2.0-flash-clean",
        format: "clean-base"
      };

    } catch (error) {
      console.error('Visual aid generation error:', error);
      throw new Error(`Failed to generate visual aid: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  async analyzeAudioReading(audioFilePath: string, readingText: string, language: string, grade: number): Promise<any> {
    try {
      console.log("Attempting to read audio file:", audioFilePath);
      
      // Check if file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found at path: ${audioFilePath}`);
      }
      
      // Read the audio file
      const audioBytes = fs.readFileSync(audioFilePath);

      const analysisPrompt = `You are an expert speech therapist and reading assessment specialist. Analyze this audio recording of a student reading aloud.

READING TEXT:
"${readingText}"

STUDENT DETAILS:
- Grade: ${grade}
- Language: ${language}
- Expected reading level: Grade ${grade} appropriate

ANALYSIS REQUIREMENTS:
1. Compare the audio against the provided reading text
2. Identify specific words that were mispronounced or read incorrectly
3. Provide word-by-word accuracy scoring
4. Assess pronunciation, fluency, and comprehension
5. Give specific, actionable improvement suggestions

Please provide a detailed JSON response with this exact structure:
{
  "overallScore": number (0-100),
  "wordAccuracy": {
    "totalWords": number,
    "correctWords": number,
    "incorrectWords": number,
    "accuracyPercentage": number
  },
  "transcript": {
    "original": "exact reading text",
    "detected": "what student actually said",
    "confidence": number (0-100)
  },
  "wordAnalysis": [
    {
      "word": "string",
      "index": number,
      "correct": boolean,
      "pronunciationScore": number (0-100),
      "timingMs": number,
      "issues": ["pronunciation", "stress", "clarity", "pace"]
    }
  ],
  "mistakes": [
    {
      "word": "string",
      "position": number,
      "type": "string",
      "severity": "high|medium|low",
      "suggestion": "string",
      "correctPronunciation": "string"
    }
  ],
  "pronunciation": {
    "score": number (0-100),
    "feedback": "string",
    "improvements": ["string"]
  },
  "fluency": {
    "score": number (0-100),
    "wpm": number,
    "pace": "string",
    "feedback": "string"
  },
  "comprehension": {
    "score": number (0-100),
    "accuracy": number,
    "feedback": "string"
  },
  "detailedAnalysis": "string",
  "recommendations": ["string"],
  "nextSteps": ["string"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json"
        },
        contents: [
          {
            inlineData: {
              data: audioBytes.toString("base64"),
              mimeType: "audio/webm"
            }
          },
          analysisPrompt
        ]
      });

      const analysisResult = JSON.parse(response.text || "{}");
      return analysisResult;

    } catch (error) {
      console.error("Audio analysis error:", error);
      throw new Error(`Audio analysis failed: ${error}`);
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
    console.log('📝 Formatting questions for PDF:', { questionsCount: questions.length, firstQuestion: questions[0] });
    
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
        <p class="question-text">${q.question || q.question_text || q.text || q.questionText || 'No question text available'}</p>`;
      
      // Handle options - can be object {A: "text", B: "text"} or array
      const options_data = q.options || q.choices || q.answers || {};
      if (typeof options_data === 'object' && Object.keys(options_data).length > 0) {
        content += `<div class="options">`;
        if (Array.isArray(options_data)) {
          // Array format
          options_data.forEach((option: any, optIndex: number) => {
            const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
            const optionText = typeof option === 'string' ? option : option.text || option.option || option;
            content += `<p class="option"><strong>${letter}.</strong> ${optionText}</p>`;
          });
        } else {
          // Object format {A: "text", B: "text"}
          Object.entries(options_data).forEach(([key, value]) => {
            content += `<p class="option"><strong>${key}.</strong> ${value}</p>`;
          });
        }
        content += `</div>`;
      }
      
      content += `</div>`;
    });

    return content;
  }

  private formatAnswersForPDF(answers: any[], options: any): string {
    console.log('🔑 Formatting answers for PDF:', { answersCount: answers.length, firstAnswer: answers[0] });
    
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
        <p class="correct-answer"><strong>Correct Answer:</strong> ${a.correctAnswer || a.correct_answer || a.correct_option || a.answer || a.correct || a.solution || 'Not specified'}</p>`;
      
      const explanation = a.explanation || a.rationale || a.reasoning || a.details || '';
      if (explanation) {
        content += `<div class="explanation">
          <h4>Explanation:</h4>
          <p>${explanation}</p>
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
      console.log('🔍 Parsed Gemini response structure:', JSON.stringify(parsedData, null, 2));
      
      // Ensure we have valid arrays
      const questions = parsedData.questions || parsedData.data?.questions || [];
      const answers = parsedData.answers || parsedData.data?.answers || [];
      
      console.log('📊 Processing:', { questionsCount: questions.length, answersCount: answers.length });
      
      // Format content for PDF generation  
      const questionsContent = this.formatQuestionsForPDF(questions, { ...options, grades });
      const answersContent = this.formatAnswersForPDF(answers, { ...options, grades });

      return {
        questions,
        answers,
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