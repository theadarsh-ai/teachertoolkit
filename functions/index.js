var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../server/storage.ts
var MemStorage, storage;
var init_storage = __esm({
  "../server/storage.ts"() {
    "use strict";
    MemStorage = class {
      users;
      agentConfigurations;
      chatSessions;
      chatMessages;
      generatedContent;
      ncertTextbooks;
      // NCERT textbooks storage
      currentUserId;
      currentConfigId;
      currentSessionId;
      currentMessageId;
      currentContentId;
      currentTextbookId;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.agentConfigurations = /* @__PURE__ */ new Map();
        this.chatSessions = /* @__PURE__ */ new Map();
        this.chatMessages = /* @__PURE__ */ new Map();
        this.generatedContent = /* @__PURE__ */ new Map();
        this.ncertTextbooks = /* @__PURE__ */ new Map();
        this.currentUserId = 1;
        this.currentConfigId = 1;
        this.currentSessionId = 1;
        this.currentMessageId = 1;
        this.currentContentId = 1;
        this.currentTextbookId = 1;
      }
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByFirebaseUid(firebaseUid) {
        return Array.from(this.users.values()).find((user) => user.firebaseUid === firebaseUid);
      }
      async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
          ...insertUser,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, user);
        return user;
      }
      async getAgentConfigurations(userId) {
        return Array.from(this.agentConfigurations.values()).filter((config) => config.userId === userId);
      }
      async createAgentConfiguration(insertConfig) {
        const id = this.currentConfigId++;
        const config = {
          id,
          userId: insertConfig.userId,
          agentType: insertConfig.agentType,
          grades: insertConfig.grades,
          contentSource: insertConfig.contentSource,
          languages: insertConfig.languages,
          isActive: true,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.agentConfigurations.set(id, config);
        return config;
      }
      async updateAgentConfiguration(id, updateData) {
        const existing = this.agentConfigurations.get(id);
        if (!existing) {
          throw new Error("Configuration not found");
        }
        const updated = { ...existing, ...updateData };
        this.agentConfigurations.set(id, updated);
        return updated;
      }
      async getChatSessions(userId) {
        return Array.from(this.chatSessions.values()).filter((session) => session.userId === userId);
      }
      async createChatSession(insertSession) {
        const id = this.currentSessionId++;
        const session = {
          ...insertSession,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.chatSessions.set(id, session);
        return session;
      }
      async getChatMessages(sessionId) {
        return Array.from(this.chatMessages.values()).filter((message) => message.sessionId === sessionId);
      }
      async createChatMessage(insertMessage) {
        const id = this.currentMessageId++;
        const message = {
          ...insertMessage,
          id,
          metadata: insertMessage.metadata || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.chatMessages.set(id, message);
        return message;
      }
      async getGeneratedContent(userId, agentType) {
        let results = Array.from(this.generatedContent.values()).filter((content) => content.userId === userId);
        if (agentType) {
          results = results.filter((content) => content.agentType === agentType);
        }
        return results;
      }
      async createGeneratedContent(insertContent) {
        const id = this.currentContentId++;
        const content = {
          ...insertContent,
          id,
          metadata: insertContent.metadata || null,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.generatedContent.set(id, content);
        return content;
      }
      // NCERT Textbook operations
      async getAllNCERTTextbooks() {
        return Array.from(this.ncertTextbooks.values());
      }
      async getNCERTTextbooks() {
        return Array.from(this.ncertTextbooks.values());
      }
      async getNCERTTextbooksByClass(classNum) {
        return Array.from(this.ncertTextbooks.values()).filter((textbook) => textbook.class === classNum);
      }
      async getNCERTTextbooksBySubject(subject) {
        return Array.from(this.ncertTextbooks.values()).filter((textbook) => textbook.subject === subject);
      }
      async storeNCERTTextbook(textbook) {
        const id = this.currentTextbookId++;
        const storedTextbook = {
          ...textbook,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.ncertTextbooks.set(id, storedTextbook);
        return storedTextbook;
      }
    };
    storage = new MemStorage();
  }
});

// ../server/ncert-scraper.ts
var ncert_scraper_exports = {};
__export(ncert_scraper_exports, {
  NCERTScraper: () => NCERTScraper
});
var NCERTScraper;
var init_ncert_scraper = __esm({
  "../server/ncert-scraper.ts"() {
    "use strict";
    init_storage();
    NCERTScraper = class {
      BASE_URL = "https://ncert.nic.in";
      // NCERT Subject mappings for different classes
      SUBJECT_MAPPINGS = {
        1: ["Mathematics", "English", "Hindi", "Environmental Studies"],
        2: ["Mathematics", "English", "Hindi", "Environmental Studies"],
        3: ["Mathematics", "English", "Hindi", "Environmental Studies"],
        4: ["Mathematics", "English", "Hindi", "Environmental Studies"],
        5: ["Mathematics", "English", "Hindi", "Environmental Studies"],
        6: ["Mathematics", "Science", "Social Science", "English", "Hindi", "Sanskrit"],
        7: ["Mathematics", "Science", "Social Science", "English", "Hindi", "Sanskrit"],
        8: ["Mathematics", "Science", "Social Science", "English", "Hindi", "Sanskrit"],
        9: ["Mathematics", "Science", "Social Science", "English", "Hindi", "Sanskrit", "Information Technology"],
        10: ["Mathematics", "Science", "Social Science", "English", "Hindi", "Sanskrit", "Information Technology"],
        11: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Economics", "Political Science", "History", "Geography", "Sociology", "Psychology"],
        12: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Economics", "Political Science", "History", "Geography", "Sociology", "Psychology"]
      };
      LANGUAGES = ["English", "Hindi", "Urdu"];
      async logAction(action, status, message, data) {
        console.log(`[${status.toUpperCase()}] ${action}: ${message}`, data ? JSON.stringify(data) : "");
      }
      async scrapeAllTextbooks() {
        await this.logAction("scrape_all_textbooks", "started", "Starting comprehensive NCERT textbook scraping");
        const allBooks = [];
        try {
          for (let classNum = 1; classNum <= 12; classNum++) {
            const subjects = this.SUBJECT_MAPPINGS[classNum] || [];
            for (const subject of subjects) {
              for (const language of this.LANGUAGES) {
                try {
                  const bookInfo = await this.getBookInfo(classNum, subject, language);
                  if (bookInfo) {
                    allBooks.push(bookInfo);
                    console.log(`\u2713 Found: Class ${classNum} ${subject} (${language})`);
                    await storage.storeNCERTTextbook({
                      class: bookInfo.class,
                      subject: bookInfo.subject,
                      bookTitle: bookInfo.bookTitle,
                      language: bookInfo.language,
                      pdfUrl: bookInfo.pdfUrl,
                      contentExtracted: false,
                      metadata: {
                        scrapedAt: /* @__PURE__ */ new Date(),
                        source: "ncert_scraper"
                      }
                    });
                  }
                } catch (error) {
                  console.log(`\u2717 Not found: Class ${classNum} ${subject} (${language})`);
                }
              }
            }
          }
          await this.logAction("scrape_all_textbooks", "completed", `Successfully scraped and stored ${allBooks.length} textbooks`, { count: allBooks.length });
          return { scrapedCount: allBooks.length, storedCount: allBooks.length, books: allBooks };
        } catch (error) {
          await this.logAction("scrape_all_textbooks", "error", `Error during scraping: ${error}`, { error: String(error) });
          throw error;
        }
      }
      async getBookInfo(classNum, subject, language) {
        const bookTitles = this.generateBookTitle(classNum, subject, language);
        if (!bookTitles) return null;
        const pdfUrl = this.generatePDFUrl(classNum, subject, language);
        return {
          class: classNum,
          subject,
          bookTitle: bookTitles,
          language,
          pdfUrl
        };
      }
      generateBookTitle(classNum, subject, language) {
        const titles = {
          Mathematics: {
            1: "Math-Magic",
            2: "Math-Magic",
            3: "Math-Magic",
            4: "Math-Magic",
            5: "Math-Magic",
            6: "Mathematics",
            7: "Mathematics",
            8: "Mathematics",
            9: "Mathematics",
            10: "Mathematics",
            11: "Mathematics - Part I & II",
            12: "Mathematics - Part I & II"
          },
          English: {
            1: "Marigold",
            2: "Marigold",
            3: "Marigold",
            4: "Marigold",
            5: "Marigold",
            6: "Honeysuckle & A Pact with the Sun",
            7: "Honeycomb & An Alien Hand",
            8: "Honeydew & It So Happened",
            9: "Beehive & Moments",
            10: "First Flight & Footprints without Feet",
            11: "Hornbill & Snapshots",
            12: "Flamingo & Vistas"
          },
          Science: {
            6: "Science",
            7: "Science",
            8: "Science",
            9: "Science",
            10: "Science - Textbook for Class X"
          },
          Hindi: {
            1: "\u0930\u093F\u092E\u091D\u093F\u092E",
            2: "\u0930\u093F\u092E\u091D\u093F\u092E",
            3: "\u0930\u093F\u092E\u091D\u093F\u092E",
            4: "\u0930\u093F\u092E\u091D\u093F\u092E",
            5: "\u0930\u093F\u092E\u091D\u093F\u092E",
            6: "\u0935\u0938\u0902\u0924",
            7: "\u0935\u0938\u0902\u0924",
            8: "\u0935\u0938\u0902\u0924",
            9: "\u0915\u094D\u0937\u093F\u0924\u093F\u091C",
            10: "\u0915\u094D\u0937\u093F\u0924\u093F\u091C",
            11: "\u0906\u0930\u094B\u0939",
            12: "\u0906\u0930\u094B\u0939"
          }
        };
        return titles[subject]?.[classNum] || `${subject} - Class ${classNum}`;
      }
      generatePDFUrl(classNum, subject, language) {
        const classStr = classNum.toString().padStart(2, "0");
        const subjectCode = subject.toLowerCase().replace(/\s+/g, "");
        const langCode = language.toLowerCase().substring(0, 2);
        return `${this.BASE_URL}/textbook/pdf/${classStr}${subjectCode}${langCode}.pdf`;
      }
    };
  }
});

// ../server/index.ts
import express2 from "express";

// ../server/routes.ts
init_storage();
import { createServer } from "http";
import multer from "multer";

// ../server/gemini.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
var GeminiEduService = class {
  async generateLocalizedContent(options) {
    const { prompt, grades, languages, contentSource, agentType } = options;
    const systemPrompt = `You are an expert Indian education specialist creating content for multi-grade classrooms.
    
Context:
- Target grades: ${grades.join(", ")}
- Languages: ${languages.join(", ")}
- Content source: ${contentSource === "prebook" ? "NCERT curriculum books" : "external educational resources"}
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
        contents: systemPrompt
      });
      return {
        content: response.text || "Content generation failed",
        metadata: {
          grades,
          languages,
          contentSource,
          culturallyRelevant: true,
          ncertAligned: contentSource === "prebook"
        },
        agentType
      };
    } catch (error) {
      throw new Error(`Gemini content generation failed: ${error}`);
    }
  }
  async createDifferentiatedMaterials(sourceContent, grades) {
    const systemPrompt = `You are an expert educator specializing in differentiated instruction for Indian multi-grade classrooms.

Task: Adapt the following content for different grade levels (${grades.join(", ")}).

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
        contents: systemPrompt
      });
      return {
        materials: grades.map((grade) => ({
          grade,
          content: response.text || `Adapted content for grade ${grade}`,
          difficulty: grade <= 5 ? "foundational" : grade <= 8 ? "intermediate" : "advanced",
          assessments: []
        })),
        metadata: {
          sourceContentLength: sourceContent.length,
          adaptationStrategy: "differentiated_instruction",
          culturalContext: "indian_education"
        }
      };
    } catch (error) {
      throw new Error(`Differentiation failed: ${error}`);
    }
  }
  async createLessonPlan(options) {
    const { subject, grades, timeframe, language = "English" } = options;
    const systemPrompt = `You are an experienced Indian teacher creating lesson plans for multi-grade classrooms.

Subject: ${subject}
Grade levels: ${grades.join(", ")}
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
        contents: systemPrompt
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
  async generateVisualAids(options) {
    const { concept, grades, type } = options;
    const systemPrompt = `You are an expert educational content creator specializing in visual learning aids for Indian students.

Concept: ${concept}
Target grades: ${grades.join(", ")}
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
        contents: systemPrompt
      });
      return {
        concept,
        type,
        grades,
        instructions: response.text || "Visual aid instructions generation failed",
        metadata: {
          materialRequirements: "basic_classroom_supplies",
          complexity: grades.includes(1) || grades.includes(2) ? "simple" : "moderate",
          culturalContext: "indian_education"
        }
      };
    } catch (error) {
      throw new Error(`Visual aids generation failed: ${error}`);
    }
  }
  async analyzePerformance(studentData, grades) {
    const systemPrompt = `You are an educational data analyst specializing in Indian multi-grade classroom performance analysis.

Student data: ${JSON.stringify(studentData)}
Grade levels: ${grades.join(", ")}

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
        contents: systemPrompt
      });
      const analysis = JSON.parse(response.text || "{}");
      return {
        analysis,
        metadata: {
          dataPoints: Object.keys(studentData).length,
          grades,
          analysisType: "comprehensive_performance",
          culturalContext: "indian_education"
        }
      };
    } catch (error) {
      throw new Error(`Performance analysis failed: ${error}`);
    }
  }
  async processInstantQuery(query, language = "English") {
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
        contents: systemPrompt
      });
      return {
        answer: response.text || "Unable to process query",
        language,
        metadata: {
          queryType: "instant_knowledge",
          culturalContext: "indian_education",
          responseTime: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Query processing failed: ${error}`);
    }
  }
  async processImageForWorksheet(options) {
    try {
      console.log(`\u{1F4F8} Processing image for ${options.questionType} worksheet with ${options.questionCount} questions`);
      const imageBase64 = options.imageBuffer.toString("base64");
      const systemPrompt = `You are an expert educator creating differentiated worksheets from textbook pages. 

Your task:
1. Analyze the uploaded textbook page image carefully
2. Extract key educational concepts, topics, and information
3. Create ${options.questionCount} ${options.questionType === "multiple-choice" ? "multiple choice questions" : "mixed questions"} suitable for grades ${options.grades.join(", ")}
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
      const userPrompt = `Please analyze this textbook page image and create ${options.questionCount} ${options.questionType === "multiple-choice" ? "multiple choice questions" : "mixed questions"} for grades ${options.grades.join(", ")}.

Focus on the main educational content and concepts shown in the image. Make sure questions are:
- Grade-appropriate for levels ${options.grades.join(", ")}
- Clear and unambiguous
- Educationally valuable
- Include Indian context where relevant

Return the response in JSON format with separate questions and answers arrays.`;
      const contents = [
        {
          inlineData: {
            data: imageBase64,
            mimeType: options.imageMimeType
          }
        },
        userPrompt
      ];
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        // Using Pro for complex multimodal analysis
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        },
        contents
      });
      const rawJson = response.text;
      console.log("\u{1F4DD} Gemini image analysis response received");
      if (!rawJson) {
        throw new Error("Empty response from Gemini model");
      }
      const parsedData = JSON.parse(rawJson);
      const questionsContent = this.formatQuestionsForPDF(parsedData.questions, { ...options, grades: options.grades });
      const answersContent = this.formatAnswersForPDF(parsedData.answers, { ...options, grades: options.grades });
      return {
        questions: parsedData.questions,
        answers: parsedData.answers,
        questionsContent,
        answersContent
      };
    } catch (error) {
      console.error("Image processing error:", error);
      throw new Error(`Failed to process image for worksheet generation: ${error.message}`);
    }
  }
  formatQuestionsForPDF(questions, options) {
    console.log("\u{1F4DD} Formatting questions for PDF:", { questionsCount: questions.length, firstQuestion: questions[0] });
    let content = `<div class="worksheet-header">
      <h1>\u{1F4DA} ${options.questionType === "multiple-choice" ? "Multiple Choice Questions" : "Mixed Worksheet"}</h1>
      <div class="worksheet-info">
        <p><strong>Grade Levels:</strong> ${Array.isArray(options.grades) ? options.grades.join(", ") : options.grades}</p>
        <p><strong>Number of Questions:</strong> ${questions.length}</p>
        <p><strong>Instructions:</strong> Choose the best answer for each question. Mark your answers clearly.</p>
      </div>
    </div>`;
    questions.forEach((q, index) => {
      content += `<div class="question-block">
        <h3>Question ${index + 1}</h3>
        <p class="question-text">${q.question || q.question_text || q.text || q.questionText || "No question text available"}</p>`;
      const options_data = q.options || q.choices || q.answers || {};
      if (typeof options_data === "object" && Object.keys(options_data).length > 0) {
        content += `<div class="options">`;
        if (Array.isArray(options_data)) {
          options_data.forEach((option, optIndex) => {
            const letter = String.fromCharCode(65 + optIndex);
            const optionText = typeof option === "string" ? option : option.text || option.option || option;
            content += `<p class="option"><strong>${letter}.</strong> ${optionText}</p>`;
          });
        } else {
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
  formatAnswersForPDF(answers, options) {
    console.log("\u{1F511} Formatting answers for PDF:", { answersCount: answers.length, firstAnswer: answers[0] });
    let content = `<div class="answer-header">
      <h1>\u{1F511} Answer Key</h1>
      <div class="answer-info">
        <p><strong>Grade Levels:</strong> ${Array.isArray(options.grades) ? options.grades.join(", ") : options.grades}</p>
        <p><strong>Total Questions:</strong> ${answers.length}</p>
      </div>
    </div>`;
    answers.forEach((a, index) => {
      content += `<div class="answer-block">
        <h3>Answer ${index + 1}</h3>
        <p class="correct-answer"><strong>Correct Answer:</strong> ${a.correctAnswer || a.correct_answer || a.correct_option || a.answer || a.correct || a.solution || "Not specified"}</p>`;
      const explanation = a.explanation || a.rationale || a.reasoning || a.details || "";
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
  async createDifferentiatedMaterials(sourceContent, grades, options) {
    try {
      console.log(`\u{1F4DD} Creating ${options.questionType} materials from text content`);
      const systemPrompt = `You are an expert educator creating differentiated worksheets from educational content.

Your task:
1. Analyze the provided text content carefully
2. Create ${options.questionCount} ${options.questionType === "multiple-choice" ? "multiple choice questions" : "mixed questions"} suitable for grades ${grades.join(", ")}
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
      const userPrompt = `Based on this educational content, create ${options.questionCount} ${options.questionType === "multiple-choice" ? "multiple choice questions" : "mixed questions"} for grades ${grades.join(", ")}:

"${sourceContent}"

Make questions that:
- Test key concepts and understanding
- Are appropriate for grades ${grades.join(", ")}
- Include practical applications
- Use Indian context where relevant

Return in JSON format with questions and answers arrays.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        },
        contents: userPrompt
      });
      const rawJson = response.text;
      console.log("\u{1F4DD} Gemini text analysis response received");
      if (!rawJson) {
        throw new Error("Empty response from Gemini model");
      }
      const parsedData = JSON.parse(rawJson);
      console.log("\u{1F50D} Parsed Gemini response structure:", JSON.stringify(parsedData, null, 2));
      const questions = parsedData.questions || parsedData.data?.questions || [];
      const answers = parsedData.answers || parsedData.data?.answers || [];
      console.log("\u{1F4CA} Processing:", { questionsCount: questions.length, answersCount: answers.length });
      const questionsContent = this.formatQuestionsForPDF(questions, { ...options, grades });
      const answersContent = this.formatAnswersForPDF(answers, { ...options, grades });
      return {
        questions,
        answers,
        questionsContent,
        answersContent
      };
    } catch (error) {
      console.error("Text processing error:", error);
      throw new Error(`Failed to create differentiated materials: ${error.message}`);
    }
  }
};
var geminiEduService = new GeminiEduService();

// ../server/pdf-generator.ts
import { promises as fs } from "fs";
import path from "path";
var PDFGeneratorService = class {
  outputDir = path.join(process.cwd(), "generated_pdfs");
  constructor() {
    this.ensureOutputDirectory();
  }
  async ensureOutputDirectory() {
    try {
      await fs.access(this.outputDir);
    } catch {
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
                <div class="metadata-value">${grades.join(", ")}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Languages</div>
                <div class="metadata-value">${languages.join(", ")}</div>
              </div>
              ${subject ? `
              <div class="metadata-item">
                <div class="metadata-label">Subject</div>
                <div class="metadata-value">${subject}</div>
              </div>
              ` : ""}
              <div class="metadata-item">
                <div class="metadata-label">Generated By</div>
                <div class="metadata-value">${agentType}</div>
              </div>
              <div class="metadata-item">
                <div class="metadata-label">Generated On</div>
                <div class="metadata-value">${generatedAt.toLocaleDateString("en-IN")}</div>
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
            Document generated on ${generatedAt.toLocaleString("en-IN")} 
            \u2022 NCERT Curriculum Aligned \u2022 Culturally Relevant Content
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }
  formatContent(content) {
    if (!content || typeof content !== "string") {
      console.warn("formatContent received invalid content:", typeof content, content);
      return '<div class="error-message"><p>\u26A0\uFE0F Content generation failed. Please try again.</p></div>';
    }
    if (content.includes("<div") || content.includes("<h1") || content.includes("<p")) {
      return content;
    }
    let formattedContent = content.replace(/^# (.*$)/gm, "<h2>$1</h2>").replace(/^## (.*$)/gm, "<h3>$1</h3>").replace(/^### (.*$)/gm, "<h4>$1</h4>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/^\* (.*$)/gm, "<li>$1</li>").replace(/^\d+\. (.*$)/gm, "<li>$1</li>").split("\n\n").map((paragraph) => {
      paragraph = paragraph.trim();
      if (!paragraph) return "";
      if (paragraph.includes("\u{1F3AF}") || paragraph.includes("Key Point:") || paragraph.includes("Important:")) {
        return `<div class="highlight-box"><span class="icon">\u{1F3AF}</span>${paragraph}</div>`;
      }
      if (paragraph.includes("\u{1F3AA}") || paragraph.includes("Activity:") || paragraph.includes("Exercise:")) {
        return `<div class="activity-box"><span class="icon">\u{1F3AA}</span>${paragraph}</div>`;
      }
      if (paragraph.includes("\u{1F3DB}\uFE0F") || paragraph.includes("Cultural Context:") || paragraph.includes("Indian Example:")) {
        return `<div class="cultural-reference"><span class="icon">\u{1F3DB}\uFE0F</span>${paragraph}</div>`;
      }
      if (paragraph.includes("<li>")) {
        if (paragraph.match(/^\d/)) {
          return `<ol>${paragraph}</ol>`;
        } else {
          return `<ul>${paragraph}</ul>`;
        }
      }
      if (!paragraph.startsWith("<")) {
        return `<p>${paragraph}</p>`;
      }
      return paragraph;
    }).join("\n");
    return formattedContent;
  }
  async generatePDF(options) {
    const html = this.generateHTMLTemplate(options);
    const timestamp2 = Date.now();
    const sanitizedTitle = options.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const fileName = `${sanitizedTitle}_${timestamp2}.html`;
    const filePath = path.join(this.outputDir, fileName);
    try {
      await fs.writeFile(filePath, html);
      console.log(`\u2705 HTML document generated successfully: ${fileName}`);
      return { filePath, fileName };
    } catch (error) {
      console.error("Document generation error:", error);
      throw new Error(`Failed to generate document: ${error.message}`);
    }
  }
  async cleanupOldPDFs(maxAge = 24 * 60 * 60 * 1e3) {
    try {
      const files = await fs.readdir(this.outputDir);
      const now = Date.now();
      for (const file of files) {
        if (file.endsWith(".pdf")) {
          const filePath = path.join(this.outputDir, file);
          const stats = await fs.stat(filePath);
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            console.log(`\u{1F9F9} Cleaned up old PDF: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error("PDF cleanup error:", error);
    }
  }
};
var pdfGenerator = new PDFGeneratorService();

// ../shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var agentConfigurations = pgTable("agent_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agentType: text("agent_type").notNull(),
  grades: jsonb("grades").$type().notNull(),
  contentSource: text("content_source").notNull(),
  // 'prebook' or 'external'
  languages: jsonb("languages").$type(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionName: text("session_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id).notNull(),
  role: text("role").notNull(),
  // 'user' or 'assistant' or 'system'
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  agentType: text("agent_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var ncertTextbooks = pgTable("ncert_textbooks", {
  id: serial("id").primaryKey(),
  class: integer("class").notNull(),
  // 1-12
  subject: text("subject").notNull(),
  bookTitle: text("book_title").notNull(),
  language: text("language").notNull(),
  // Hindi, English, Urdu
  pdfUrl: text("pdf_url").notNull(),
  downloadedAt: timestamp("downloaded_at"),
  contentExtracted: boolean("content_extracted").default(false).notNull(),
  metadata: jsonb("metadata").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var ncertChapters = pgTable("ncert_chapters", {
  id: serial("id").primaryKey(),
  textbookId: integer("textbook_id").references(() => ncertTextbooks.id).notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  chapterTitle: text("chapter_title").notNull(),
  content: text("content"),
  // Extracted text content
  pageStart: integer("page_start"),
  pageEnd: integer("page_end"),
  topics: jsonb("topics").$type(),
  keywords: jsonb("keywords").$type(),
  learningObjectives: jsonb("learning_objectives").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var ncertTopics = pgTable("ncert_topics", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").references(() => ncertChapters.id).notNull(),
  topicTitle: text("topic_title").notNull(),
  content: text("content").notNull(),
  difficulty: text("difficulty").notNull(),
  // basic, intermediate, advanced
  concepts: jsonb("concepts").$type(),
  examples: jsonb("examples").$type(),
  exercises: jsonb("exercises").$type(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  firebaseUid: true
});
var insertAgentConfigSchema = createInsertSchema(agentConfigurations).pick({
  userId: true,
  agentType: true,
  grades: true,
  contentSource: true,
  languages: true
});
var insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  sessionName: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
  metadata: true
});
var insertGeneratedContentSchema = createInsertSchema(generatedContent).pick({
  userId: true,
  agentType: true,
  title: true,
  content: true,
  metadata: true
});
var insertNCERTTextbookSchema = createInsertSchema(ncertTextbooks).pick({
  class: true,
  subject: true,
  bookTitle: true,
  language: true,
  pdfUrl: true,
  downloadedAt: true,
  contentExtracted: true,
  metadata: true
});
var insertNCERTChapterSchema = createInsertSchema(ncertChapters).pick({
  textbookId: true,
  chapterNumber: true,
  chapterTitle: true,
  content: true,
  pageStart: true,
  pageEnd: true,
  topics: true,
  keywords: true,
  learningObjectives: true
});
var insertNCERTTopicSchema = createInsertSchema(ncertTopics).pick({
  chapterId: true,
  topicTitle: true,
  content: true,
  difficulty: true,
  concepts: true,
  examples: true,
  exercises: true
});

// ../server/routes.ts
init_ncert_scraper();
var PYTHON_AGENTS_URL = "http://localhost:8000";
async function callPythonAgent(endpoint, data) {
  try {
    const response = await fetch(`${PYTHON_AGENTS_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      throw new Error(`Python agent request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Python agent error:", error);
    throw error;
  }
}
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  }
});
async function registerRoutes(app2) {
  app2.get("/api/ncert/textbooks", async (req, res) => {
    try {
      const { NCERTScraper: NCERTScraper2 } = await Promise.resolve().then(() => (init_ncert_scraper(), ncert_scraper_exports));
      const scraper = new NCERTScraper2();
      const textbooks = await storage.getAllNCERTTextbooks();
      res.json({
        success: true,
        count: textbooks.length,
        data: textbooks,
        source: "PostgreSQL Database",
        status: textbooks.length === 0 ? "Database empty - run scraping to populate" : "Data loaded successfully"
      });
    } catch (error) {
      console.error("Error fetching NCERT textbooks:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch NCERT textbooks from database",
        details: error.message
      });
    }
  });
  app2.post("/api/ncert/scrape", async (req, res) => {
    try {
      console.log("\u{1F680} Starting NCERT textbook scraping to PostgreSQL...");
      const { NCERTScraper: NCERTScraper2 } = await Promise.resolve().then(() => (init_ncert_scraper(), ncert_scraper_exports));
      const scraper = new NCERTScraper2();
      const results = await scraper.scrapeAllTextbooks();
      res.json({
        success: true,
        message: "NCERT textbook scraping completed successfully",
        results,
        destination: "PostgreSQL Database"
      });
    } catch (error) {
      console.error("NCERT scraping error:", error);
      res.status(500).json({
        success: false,
        error: `NCERT scraping failed: ${error.message}`,
        details: error.stack
      });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
      if (existingUser) {
        res.json(existingUser);
        return;
      }
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/users/:firebaseUid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/agent-configs/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const configs = await storage.getAgentConfigurations(userId);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/agent-configs", async (req, res) => {
    try {
      const configData = insertAgentConfigSchema.parse(req.body);
      const config = await storage.createAgentConfiguration(configData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat-sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/chat-sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/chat-messages/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/chat-messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/generate-content", async (req, res) => {
    try {
      const { userId, agentType, prompt, grades, languages, contentSource } = req.body;
      const content = await geminiEduService.generateLocalizedContent({
        prompt,
        agentType,
        grades,
        languages,
        contentSource
      });
      const generatedContent2 = await storage.createGeneratedContent({
        userId,
        agentType,
        title: `Generated ${agentType} Content`,
        content: JSON.stringify(content),
        metadata: { grades, languages, contentSource }
      });
      res.json(generatedContent2);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/agents/content-generation", async (req, res) => {
    try {
      const { prompt, grades, languages, contentSource, userId, generatePDF = true } = req.body;
      console.log("\u{1F3AF} Starting content generation with PDF output...");
      const content = await geminiEduService.generateLocalizedContent({
        prompt,
        agentType: "content-generation",
        grades,
        languages,
        contentSource
      });
      if (generatePDF) {
        console.log("\u{1F4C4} Generating PDF for content...");
        const pdfResult = await pdfGenerator.generatePDF({
          title: `Generated Educational Content: ${prompt.substring(0, 50)}...`,
          content: content.content,
          grades,
          languages,
          agentType: "Hyper-Local Content Generator",
          generatedAt: /* @__PURE__ */ new Date()
        });
        const generatedContent2 = await storage.createGeneratedContent({
          userId: userId || 1,
          agentType: "content-generation",
          title: `Generated Educational Content: ${prompt.substring(0, 50)}...`,
          content: content.content,
          // Store actual content, not JSON
          metadata: {
            grades,
            languages,
            contentSource,
            pdfFileName: pdfResult.fileName,
            pdfPath: pdfResult.filePath,
            culturallyRelevant: content.metadata?.culturallyRelevant,
            ncertAligned: content.metadata?.ncertAligned
          }
        });
        res.json({
          success: true,
          message: "Educational content generated successfully",
          content: content.content,
          pdf: {
            fileName: pdfResult.fileName,
            downloadUrl: `/api/download-pdf/${pdfResult.fileName}`
          },
          metadata: content.metadata,
          generatedContent: generatedContent2
        });
      } else {
        res.json(content);
      }
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error.stack
      });
    }
  });
  app2.get("/api/download-pdf/:fileName", async (req, res) => {
    try {
      const { fileName } = req.params;
      if (!fileName.endsWith(".pdf") && !fileName.endsWith(".html")) {
        return res.status(400).json({ error: "Invalid file type" });
      }
      if (fileName.endsWith(".html")) {
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      } else {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      }
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(fileName, { root: "generated_pdfs" }, (err) => {
        if (err) {
          console.error("PDF download error:", err);
          if (!res.headersSent) {
            res.status(404).json({ error: "PDF file not found" });
          }
        } else {
          console.log(`\u2705 PDF downloaded: ${fileName}`);
        }
      });
    } catch (error) {
      console.error("PDF download error:", error);
      res.status(500).json({ error: "PDF download failed" });
    }
  });
  app2.post("/api/agents/differentiated-materials", upload.single("uploadedImage"), async (req, res) => {
    try {
      const { sourceContent, grades, questionType, questionCount, userId, generatePDF = "true" } = req.body;
      const uploadedImage = req.file;
      console.log("\u{1F3AF} Starting differentiated materials generation...");
      console.log("Input:", {
        hasImage: !!uploadedImage,
        hasText: !!sourceContent,
        grades: JSON.parse(grades || "[]"),
        questionType,
        questionCount: parseInt(questionCount || "25")
      });
      let materials;
      const parsedGrades = JSON.parse(grades || "[]");
      const numQuestions = parseInt(questionCount || "25");
      if (uploadedImage) {
        console.log("\u{1F4F8} Processing uploaded image with Gemini...");
        materials = await geminiEduService.processImageForWorksheet({
          imageBuffer: uploadedImage.buffer,
          imageMimeType: uploadedImage.mimetype,
          grades: parsedGrades,
          questionType: questionType || "multiple-choice",
          questionCount: numQuestions
        });
      } else if (sourceContent) {
        console.log("\u{1F4DD} Processing text content...");
        materials = await geminiEduService.createDifferentiatedMaterials(sourceContent, parsedGrades, {
          questionType: questionType || "multiple-choice",
          questionCount: numQuestions
        });
      } else {
        throw new Error("Either image or text content is required");
      }
      if (generatePDF === "true") {
        console.log("\u{1F4C4} Generating question and answer PDFs...");
        console.log("\u{1F50D} Materials structure:", {
          questionsType: typeof materials.questionsContent,
          answersType: typeof materials.answersContent,
          questionsPreview: materials.questionsContent?.substring(0, 200) || "UNDEFINED",
          answersPreview: materials.answersContent?.substring(0, 200) || "UNDEFINED"
        });
        const questionsResult = await pdfGenerator.generatePDF({
          title: `${questionType === "multiple-choice" ? "Multiple Choice" : "Mixed"} Questions - Grades ${parsedGrades.join(", ")}`,
          content: materials.questionsContent || "No questions content generated",
          grades: parsedGrades,
          languages: ["English"],
          agentType: "Differentiated Materials - Questions",
          generatedAt: /* @__PURE__ */ new Date()
        });
        const answersResult = await pdfGenerator.generatePDF({
          title: `Answer Key - Grades ${parsedGrades.join(", ")}`,
          content: materials.answersContent || "No answers content generated",
          grades: parsedGrades,
          languages: ["English"],
          agentType: "Differentiated Materials - Answers",
          generatedAt: /* @__PURE__ */ new Date()
        });
        await storage.createGeneratedContent({
          userId: parseInt(userId || "1"),
          agentType: "differentiated-materials",
          title: `Differentiated Materials (${numQuestions} Questions)`,
          content: JSON.stringify(materials),
          metadata: {
            grades: parsedGrades,
            questionType,
            questionCount: numQuestions,
            questionsFile: questionsResult.fileName,
            answersFile: answersResult.fileName,
            hasImage: !!uploadedImage
          }
        });
        res.json({
          success: true,
          message: `Generated ${numQuestions} ${questionType === "multiple-choice" ? "multiple choice questions" : "mixed questions"} with answer key`,
          materials: {
            questions: materials.questions,
            answers: materials.answers
          },
          pdf: {
            questionsFile: questionsResult.fileName,
            answersFile: answersResult.fileName,
            questionsDownloadUrl: `/api/download-pdf/${questionsResult.fileName}`,
            answersDownloadUrl: `/api/download-pdf/${answersResult.fileName}`
          }
        });
      } else {
        res.json({
          success: true,
          materials
        });
      }
    } catch (error) {
      console.error("Differentiated materials generation error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error.stack
      });
    }
  });
  app2.post("/api/agents/lesson-planner", async (req, res) => {
    try {
      const { subject, grades, timeframe, language } = req.body;
      const lessonPlan = await geminiEduService.createLessonPlan({
        subject,
        grades,
        timeframe,
        language
      });
      res.json(lessonPlan);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/agents/visual-aids", async (req, res) => {
    try {
      const { prompt, grades, type = "diagram" } = req.body;
      const visualAids = await geminiEduService.generateVisualAids({
        concept: prompt,
        grades,
        type
      });
      res.json(visualAids);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/agents/performance-analysis", async (req, res) => {
    try {
      const { studentData, grades } = req.body;
      const analysis = await geminiEduService.analyzePerformance(studentData, grades);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.post("/api/langgraph/agents/:agentType/generate", async (req, res) => {
    try {
      const { agentType } = req.params;
      const { prompt, grades, languages, contentSource, metadata } = req.body;
      if (!agentType || !prompt || !grades || !Array.isArray(grades)) {
        res.status(400).json({ error: "Missing required fields: agentType, prompt, grades" });
        return;
      }
      const agentData = {
        prompt,
        grades,
        languages: languages || ["English"],
        content_source: contentSource || "prebook",
        metadata: metadata || {}
      };
      const result = await callPythonAgent(`/agents/${agentType}/generate`, agentData);
      res.json(result);
    } catch (error) {
      console.error("Python LangGraph agent error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Python agent generation failed",
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });
  app2.post("/api/langgraph/agents/lesson-planner/create-plan", async (req, res) => {
    try {
      const { topic, grades, duration, languages, contentSource } = req.body;
      if (!topic || !grades || !duration) {
        res.status(400).json({ error: "Missing required fields: topic, grades, duration" });
        return;
      }
      const planData = {
        topic,
        grades,
        duration,
        languages: languages || ["English"],
        content_source: contentSource || "prebook"
      };
      const result = await callPythonAgent("/agents/lesson-planner/create-plan", planData);
      res.json(result);
    } catch (error) {
      console.error("Lesson planner error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Lesson planning failed",
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });
  app2.post("/api/langgraph/agents/performance-analysis/analyze", async (req, res) => {
    try {
      const { studentData, grades, subject } = req.body;
      if (!studentData || !grades || !subject) {
        res.status(400).json({ error: "Missing required fields: studentData, grades, subject" });
        return;
      }
      const analysisData = {
        student_data: studentData,
        grades,
        subject
      };
      const result = await callPythonAgent("/agents/performance-analysis/analyze", analysisData);
      res.json(result);
    } catch (error) {
      console.error("Performance analysis error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Performance analysis failed",
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });
  app2.post("/api/langgraph/agents/master-chatbot/chat", async (req, res) => {
    try {
      const { prompt, grades, languages, metadata } = req.body;
      if (!prompt || !grades) {
        res.status(400).json({ error: "Missing required fields: prompt, grades" });
        return;
      }
      const chatData = {
        prompt,
        grades,
        languages: languages || ["English"],
        content_source: metadata?.contentSource || "prebook",
        metadata: metadata || {}
      };
      const result = await callPythonAgent("/agents/master-chatbot/chat", chatData);
      res.json(result);
    } catch (error) {
      console.error("Master chatbot error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Master chatbot failed",
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });
  app2.get("/api/langgraph/agents/:agentType/status", async (req, res) => {
    try {
      const { agentType } = req.params;
      const response = await fetch(`${PYTHON_AGENTS_URL}/agents/${agentType}/status`);
      if (!response.ok) {
        res.status(503).json({
          error: "Python agents not available",
          status: "starting"
        });
        return;
      }
      const status = await response.json();
      res.json(status);
    } catch (error) {
      res.status(503).json({
        error: "Python agents not available",
        status: "starting"
      });
    }
  });
  app2.get("/api/langgraph/agents/health", async (req, res) => {
    try {
      const response = await fetch(`${PYTHON_AGENTS_URL}/`);
      if (!response.ok) {
        res.status(503).json({
          status: "unavailable",
          message: "Python AI agents are starting up"
        });
        return;
      }
      const health = await response.json();
      res.json({
        status: "available",
        python_agents: health,
        available_agents: health.available_agents || []
      });
    } catch (error) {
      res.status(503).json({
        status: "unavailable",
        message: "Python AI agents are starting up. Please wait a moment."
      });
    }
  });
  app2.post("/api/agents/knowledge-base", async (req, res) => {
    try {
      const { query, language = "English" } = req.body;
      const response = await geminiEduService.processInstantQuery(query, language);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  const ncertScraper = new NCERTScraper();
  app2.post("/api/ncert/scrape", async (req, res) => {
    try {
      console.log("\u{1F680} Starting NCERT textbook scraping...");
      const books = await ncertScraper.scrapeAllTextbooks();
      await ncertScraper.storeTextbooksInFirebase(books);
      res.json({
        success: true,
        message: `Successfully scraped and stored ${books.length} NCERT textbooks`,
        count: books.length,
        data: books
      });
    } catch (error) {
      console.error("NCERT scraping error:", error);
      res.status(500).json({
        error: "Failed to scrape NCERT textbooks",
        details: String(error)
      });
    }
  });
  app2.get("/api/ncert/textbooks", async (req, res) => {
    try {
      const textbooks = await ncertScraper.getAllStoredTextbooks();
      res.json({
        success: true,
        count: textbooks.length,
        data: textbooks
      });
    } catch (error) {
      console.error("Error fetching textbooks:", error);
      res.status(500).json({
        error: "Failed to fetch NCERT textbooks",
        details: String(error)
      });
    }
  });
  app2.get("/api/ncert/textbooks/class/:classNum", async (req, res) => {
    try {
      const classNum = parseInt(req.params.classNum);
      const textbooks = await ncertScraper.getTextbooksByClass(classNum);
      res.json({
        success: true,
        class: classNum,
        count: textbooks.length,
        data: textbooks
      });
    } catch (error) {
      console.error(`Error fetching class ${req.params.classNum} textbooks:`, error);
      res.status(500).json({
        error: `Failed to fetch class ${req.params.classNum} textbooks`,
        details: String(error)
      });
    }
  });
  app2.get("/api/ncert/textbooks/subject/:subject", async (req, res) => {
    try {
      const subject = req.params.subject;
      const textbooks = await ncertScraper.getTextbooksBySubject(subject);
      res.json({
        success: true,
        subject,
        count: textbooks.length,
        data: textbooks
      });
    } catch (error) {
      console.error(`Error fetching ${req.params.subject} textbooks:`, error);
      res.status(500).json({
        error: `Failed to fetch ${req.params.subject} textbooks`,
        details: String(error)
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// ../server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// ../vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// ../server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// ../server/platform-config.ts
function detectPlatform() {
  if (process.env.REPL_ID) return "replit";
  if (process.env.FUNCTIONS_EMULATOR) return "firebase-emulator";
  if (process.env.FIREBASE_CONFIG) return "firebase";
  if (process.env.VERCEL) return "vercel";
  if (process.env.DYNO) return "heroku";
  if (process.env.NETLIFY) return "netlify";
  return "local";
}
function getPlatformConfig() {
  const platform = detectPlatform();
  const isDevelopment = process.env.NODE_ENV === "development";
  const config = {
    platform,
    port: parseInt(process.env.PORT || "5000", 10),
    host: "0.0.0.0",
    isDevelopment,
    databaseUrl: process.env.DATABASE_URL || ""
  };
  switch (platform) {
    case "replit":
      config.host = "0.0.0.0";
      config.port = parseInt(process.env.PORT || "5000", 10);
      break;
    case "firebase":
    case "firebase-emulator":
      config.host = "localhost";
      config.port = parseInt(process.env.PORT || "5000", 10);
      break;
    case "vercel":
      config.port = parseInt(process.env.PORT || "3000", 10);
      break;
    case "heroku":
      config.port = parseInt(process.env.PORT || "5000", 10);
      config.host = "0.0.0.0";
      break;
    case "local":
    default:
      config.host = "localhost";
      config.port = parseInt(process.env.PORT || "5000", 10);
      break;
  }
  return config;
}
function logPlatformInfo() {
  const config = getPlatformConfig();
  console.log(`\u{1F680} Platform: ${config.platform.toUpperCase()}`);
  console.log(`\u{1F310} Server: ${config.host}:${config.port}`);
  console.log(`\u{1F527} Environment: ${config.isDevelopment ? "Development" : "Production"}`);
  if (config.platform !== "replit") {
    console.log(`\u{1F4CB} Platform detected: ${config.platform}`);
    console.log(`\u{1F4A1} Use platform-specific commands for optimal experience`);
  }
}

// ../server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const config = getPlatformConfig();
  server.listen({
    port: config.port,
    host: config.host,
    reusePort: true
  }, () => {
    logPlatformInfo();
    log(`serving on port ${config.port}`);
  });
})();
