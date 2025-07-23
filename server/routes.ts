import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { geminiEduService } from "./gemini";
import { pdfGenerator } from "./pdf-generator";
import { GooglePolyService } from './google-poly-api';
import { SketchfabService } from './sketchfab-api';
import { 
  insertUserSchema, 
  insertAgentConfigSchema, 
  insertChatSessionSchema, 
  insertChatMessageSchema,
  insertGeneratedContentSchema 
} from "@shared/schema";
import { NCERTScraper } from "./ncert-scraper";

// Python LangGraph Agents API Configuration
const PYTHON_AGENTS_URL = "http://localhost:8000";

// Helper function to call Python agents
async function callPythonAgent(endpoint: string, data: any) {
  try {
    const response = await fetch(`${PYTHON_AGENTS_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Python agent request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Python agent error:', error);
    throw error;
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // ========== NCERT TEXTBOOKS WITH POSTGRESQL (WORKING) ==========
  
  // Get all NCERT textbooks from PostgreSQL  
  app.get("/api/ncert/textbooks", async (req, res) => {
    try {
      const { NCERTScraper } = await import('./ncert-scraper');
      const scraper = new NCERTScraper();
      
      // Get from database through storage
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

  // Scrape NCERT textbooks and store in PostgreSQL
  app.post("/api/ncert/scrape", async (req, res) => {
    try {
      console.log("🚀 Starting NCERT textbook scraping to PostgreSQL...");
      
      const { NCERTScraper } = await import('./ncert-scraper');
      const scraper = new NCERTScraper();
      
      // Run the scraping process
      const results = await scraper.scrapeAllTextbooks();
      
      res.json({
        success: true,
        message: "NCERT textbook scraping completed successfully",
        results: results,
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
  
  // Visual Aids Agent - Image Generation
  app.post("/api/agents/visual-aids", async (req, res) => {
    try {
      const { prompt, style, size } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: "Prompt is required"
        });
      }

      console.log('🎨 Starting visual aid generation...');
      console.log('Input:', { prompt, style, size });

      const result = await geminiEduService.generateVisualAid({
        prompt,
        style: style || 'educational',
        size: size || '1024x1024'
      });

      console.log('✅ Visual aid generated successfully');

      res.json(result);
      
    } catch (error) {
      console.error('Visual aid generation error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to generate visual aid",
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByFirebaseUid(userData.firebaseUid);
      if (existingUser) {
        res.json(existingUser);
        return;
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/users/:firebaseUid", async (req, res) => {
    try {
      const user = await storage.getUserByFirebaseUid(req.params.firebaseUid);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Agent configuration routes
  app.get("/api/agent-configs/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const configs = await storage.getAgentConfigurations(userId);
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/agent-configs", async (req, res) => {
    try {
      const configData = insertAgentConfigSchema.parse(req.body);
      const config = await storage.createAgentConfiguration(configData);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Chat routes
  app.get("/api/chat-sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/chat-messages/:sessionId", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/chat-messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Content generation route with Gemini
  app.post("/api/generate-content", async (req, res) => {
    try {
      const { userId, agentType, prompt, grades, languages, contentSource } = req.body;
      
      const content = await geminiEduService.generateLocalizedContent({
        prompt,
        agentType,
        grades,
        languages,
        contentSource
      });
      
      const generatedContent = await storage.createGeneratedContent({
        userId,
        agentType,
        title: `Generated ${agentType} Content`,
        content: JSON.stringify(content),
        metadata: { grades, languages, contentSource }
      });
      
      res.json(generatedContent);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Agent-specific routes with Gemini
  app.post("/api/agents/content-generation", async (req, res) => {
    try {
      const { prompt, grades, languages, contentSource, userId, generatePDF = true } = req.body;
      
      console.log("🎯 Starting content generation with PDF output...");
      
      const content = await geminiEduService.generateLocalizedContent({
        prompt,
        agentType: 'content-generation',
        grades,
        languages,
        contentSource
      });
      
      // Generate PDF if requested (default behavior)
      if (generatePDF) {
        console.log("📄 Generating PDF for content...");
        
        const pdfResult = await pdfGenerator.generatePDF({
          title: `Generated Educational Content: ${prompt.substring(0, 50)}...`,
          content: content.content,
          grades,
          languages,
          agentType: 'Hyper-Local Content Generator',
          generatedAt: new Date()
        });
        
        // Store in database with PDF info
        const generatedContent = await storage.createGeneratedContent({
          userId: userId || 1,
          agentType: 'content-generation',
          title: `Generated Educational Content: ${prompt.substring(0, 50)}...`,
          content: content.content, // Store actual content, not JSON
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
          generatedContent
        });
      } else {
        // Return JSON content only
        res.json(content);
      }
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error.stack
      });
    }
  });

  // PDF Download route
  app.get("/api/download-pdf/:fileName", async (req, res) => {
    try {
      const { fileName } = req.params;
      
      // Security check - ensure file exists and is valid type
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.html')) {
        return res.status(400).json({ error: "Invalid file type" });
      }
      
      // Set headers based on file type
      if (fileName.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      } else {
        res.setHeader('Content-Type', 'application/pdf');  
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      }
      res.setHeader('Cache-Control', 'no-cache');
      
      // Send the file
      res.sendFile(fileName, { root: 'generated_pdfs' }, (err) => {
        if (err) {
          console.error("PDF download error:", err);
          if (!res.headersSent) {
            res.status(404).json({ error: "PDF file not found" });
          }
        } else {
          console.log(`✅ PDF downloaded: ${fileName}`);
        }
      });
      
    } catch (error) {
      console.error("PDF download error:", error);
      res.status(500).json({ error: "PDF download failed" });
    }
  });

  app.post("/api/agents/differentiated-materials", upload.single('uploadedImage'), async (req, res) => {
    try {
      const { sourceContent, grades, questionType, questionCount, userId, generatePDF = "true" } = req.body;
      const uploadedImage = req.file;
      
      console.log("🎯 Starting differentiated materials generation...");
      console.log("Input:", { 
        hasImage: !!uploadedImage, 
        hasText: !!sourceContent, 
        grades: JSON.parse(grades || '[]'),
        questionType,
        questionCount: parseInt(questionCount || '25')
      });

      let materials;
      const parsedGrades = JSON.parse(grades || '[]');
      const numQuestions = parseInt(questionCount || '25');

      if (uploadedImage) {
        // Process image with Gemini multimodal
        console.log("📸 Processing uploaded image with Gemini...");
        materials = await geminiEduService.processImageForWorksheet({
          imageBuffer: uploadedImage.buffer,
          imageMimeType: uploadedImage.mimetype,
          grades: parsedGrades,
          questionType: questionType || 'multiple-choice',
          questionCount: numQuestions
        });
      } else if (sourceContent) {
        // Process text content
        console.log("📝 Processing text content...");
        materials = await geminiEduService.createDifferentiatedMaterials(sourceContent, parsedGrades, {
          questionType: questionType || 'multiple-choice',
          questionCount: numQuestions
        });
      } else {
        throw new Error('Either image or text content is required');
      }
      
      if (generatePDF === "true") {
        console.log("📄 Generating question and answer PDFs...");
        
        // Generate Questions PDF
        console.log('🔍 Materials structure:', { 
          questionsType: typeof materials.questionsContent,
          answersType: typeof materials.answersContent,
          questionsPreview: materials.questionsContent?.substring(0, 200) || 'UNDEFINED',
          answersPreview: materials.answersContent?.substring(0, 200) || 'UNDEFINED'
        });
        
        const questionsResult = await pdfGenerator.generatePDF({
          title: `${questionType === 'multiple-choice' ? 'Multiple Choice' : 'Mixed'} Questions - Grades ${parsedGrades.join(', ')}`,
          content: materials.questionsContent || 'No questions content generated',
          grades: parsedGrades,
          languages: ['English'],
          agentType: 'Differentiated Materials - Questions',
          generatedAt: new Date()
        });

        // Generate Answers PDF  
        const answersResult = await pdfGenerator.generatePDF({
          title: `Answer Key - Grades ${parsedGrades.join(', ')}`,
          content: materials.answersContent || 'No answers content generated',
          grades: parsedGrades,
          languages: ['English'],
          agentType: 'Differentiated Materials - Answers',
          generatedAt: new Date()
        });

        // Store in database
        await storage.createGeneratedContent({
          userId: parseInt(userId || '1'),
          agentType: 'differentiated-materials',
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
          message: `Generated ${numQuestions} ${questionType === 'multiple-choice' ? 'multiple choice questions' : 'mixed questions'} with answer key`,
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
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error.stack
      });
    }
  });

  app.post("/api/agents/lesson-planner", async (req, res) => {
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
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/agents/visual-aids", async (req, res) => {
    try {
      const { prompt, grades, type = 'diagram' } = req.body;
      const visualAids = await geminiEduService.generateVisualAids({
        concept: prompt,
        grades,
        type
      });
      res.json(visualAids);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/agents/performance-analysis", async (req, res) => {
    try {
      const { studentData, grades } = req.body;
      const analysis = await geminiEduService.analyzePerformance(studentData, grades);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // ========== PYTHON LANGGRAPH AGENT ROUTES ==========
  
  // Python LangGraph Agent routes
  app.post("/api/langgraph/agents/:agentType/generate", async (req, res) => {
    try {
      const { agentType } = req.params;
      const { prompt, grades, languages, contentSource, metadata } = req.body;
      
      // Validate input
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
        error: error instanceof Error ? error.message : 'Python agent generation failed',
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });

  // Lesson planner specific route
  app.post("/api/langgraph/agents/lesson-planner/create-plan", async (req, res) => {
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

      const result = await callPythonAgent('/agents/lesson-planner/create-plan', planData);
      res.json(result);
    } catch (error) {
      console.error("Lesson planner error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Lesson planning failed',
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });

  // Performance analysis route
  app.post("/api/langgraph/agents/performance-analysis/analyze", async (req, res) => {
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

      const result = await callPythonAgent('/agents/performance-analysis/analyze', analysisData);
      res.json(result);
    } catch (error) {
      console.error("Performance analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Performance analysis failed',
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });

  // Master chatbot route
  app.post("/api/langgraph/agents/master-chatbot/chat", async (req, res) => {
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

      const result = await callPythonAgent('/agents/master-chatbot/chat', chatData);
      res.json(result);
    } catch (error) {
      console.error("Master chatbot error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Master chatbot failed',
        fallback_message: "Python AI agents are starting up. Please try again in a moment."
      });
    }
  });

  // Agent status route
  app.get("/api/langgraph/agents/:agentType/status", async (req, res) => {
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

  // Python agents health check
  app.get("/api/langgraph/agents/health", async (req, res) => {
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

  app.post("/api/agents/knowledge-base", async (req, res) => {
    try {
      const { query, language = 'English' } = req.body;
      const response = await geminiEduService.processInstantQuery(query, language);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // NCERT Textbooks Management
  const ncertScraper = new NCERTScraper();

  // Scrape and store all NCERT textbooks
  app.post("/api/ncert/scrape", async (req, res) => {
    try {
      console.log('🚀 Starting NCERT textbook scraping...');
      
      const books = await ncertScraper.scrapeAllTextbooks();
      await ncertScraper.storeTextbooksInFirebase(books);
      
      res.json({
        success: true,
        message: `Successfully scraped and stored ${books.length} NCERT textbooks`,
        count: books.length,
        data: books
      });
    } catch (error) {
      console.error('NCERT scraping error:', error);
      res.status(500).json({ 
        error: 'Failed to scrape NCERT textbooks',
        details: String(error)
      });
    }
  });

  // Get all stored NCERT textbooks
  app.get("/api/ncert/textbooks", async (req, res) => {
    try {
      const textbooks = await ncertScraper.getAllStoredTextbooks();
      res.json({
        success: true,
        count: textbooks.length,
        data: textbooks
      });
    } catch (error) {
      console.error('Error fetching textbooks:', error);
      res.status(500).json({ 
        error: 'Failed to fetch NCERT textbooks',
        details: String(error)
      });
    }
  });

  // Get NCERT textbooks by class
  app.get("/api/ncert/textbooks/class/:classNum", async (req, res) => {
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

  // Get NCERT textbooks by subject
  app.get("/api/ncert/textbooks/subject/:subject", async (req, res) => {
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

  // Initialize AR integration services (with fallback to mock data)
  const googlePolyService = new GooglePolyService(process.env.GOOGLE_POLY_API_KEY || 'mock');
  const sketchfabService = new SketchfabService(process.env.SKETCHFAB_API_KEY || 'mock');

  // AR Integration endpoints - Direct Node.js approach
  app.post("/api/agents/ar-integration/search", async (req, res) => {
    try {
      const { query, source = 'sketchfab', educational = true } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: "Query parameter is required and must be a string"
        });
      }

      console.log(`🔍 DIRECT: Searching 3D models for: "${query}"`);

      // Direct Sketchfab API call (simplified)
      const apiKey = process.env.SKETCHFAB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          error: "Sketchfab API key not configured"
        });
      }

      const params = new URLSearchParams({
        q: query,
        sort_by: 'relevance',
        count: '20',
        downloadable: 'true'
      });

      const apiResponse = await fetch(`https://api.sketchfab.com/v3/models?${params}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!apiResponse.ok) {
        return res.status(500).json({
          success: false,
          error: `Sketchfab API error: ${apiResponse.status}`
        });
      }

      const apiData = await apiResponse.json();
      const rawModels = apiData.results || [];

      const models = rawModels.map((model: any) => ({
        id: model.uid,
        name: model.name || 'Untitled Model',
        description: model.description || 'Educational 3D model from Sketchfab',
        thumbnail: model.thumbnails?.images?.[0]?.url || '',
        source: 'sketchfab',
        url: `https://sketchfab.com/3d-models/${model.uid}`,
        embedUrl: `https://sketchfab.com/models/${model.uid}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=0&preload=1`,
        tags: [],
        author: model.user?.displayName || 'Unknown Artist',
        license: model.license?.label || 'Standard License'
      }));

      console.log(`✅ DIRECT: Found ${models.length} models`);
      console.log(`📤 DIRECT: Sample models:`, models.slice(0, 2).map(m => ({ name: m.name, author: m.author, id: m.id })));

      res.json({
        success: true,
        query,
        source: 'sketchfab-direct',
        count: models.length,
        models
      });

    } catch (error) {
      console.error('AR integration search error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to search 3D models",
        details: String(error)
      });
    }
  });

  // Get specific 3D model details
  app.get("/api/agents/ar-integration/model/:source/:id", async (req, res) => {
    try {
      const { source, id } = req.params;

      let modelData = null;

      if (source === 'google-poly') {
        const asset = await googlePolyService.getAsset(id);
        modelData = googlePolyService.convertToStandardModel(asset);
      } else if (source === 'sketchfab') {
        const model = await sketchfabService.getModel(id);
        modelData = sketchfabService.convertToStandardModel(model);
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid source. Use 'google-poly' or 'sketchfab'"
        });
      }

      res.json({
        success: true,
        model: modelData
      });

    } catch (error) {
      console.error('AR model fetch error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch 3D model details",
        details: String(error)
      });
    }
  });

  // Get embed URL for 3D model viewer
  app.post("/api/agents/ar-integration/embed", async (req, res) => {
    try {
      const { source, id, options = {} } = req.body;

      let embedUrl = '';

      if (source === 'sketchfab') {
        embedUrl = await sketchfabService.getModelEmbedUrl(id, {
          autostart: options.autostart ?? true,
          ui_controls: options.ui_controls ?? true,
          ui_infos: options.ui_infos ?? true,
          ui_inspector: options.ui_inspector ?? true,
          ui_watermark: false,
          ...options
        });
      } else if (source === 'google-poly') {
        embedUrl = `https://poly.google.com/view/${id}/embed`;
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid source for embed URL"
        });
      }

      res.json({
        success: true,
        embedUrl,
        source,
        modelId: id
      });

    } catch (error) {
      console.error('AR embed URL error:', error);
      res.status(500).json({
        success: false,
        error: "Failed to generate embed URL",
        details: String(error)
      });
    }
  });

  // Lesson Planner Agent - Generate Weekly Plans
  app.post('/api/agents/lesson-planner/generate-weekly-plan', async (req: Request, res: Response) => {
    try {
      const { subject, grade, curriculum, weekNumber, focusAreas, lessonDuration, classSize, selectedLessons } = req.body;
      
      if (!subject) {
        return res.status(400).json({ success: false, error: 'Subject is required' });
      }

      console.log(`📚 Generating weekly lesson plan for Grade ${grade}: "${subject}" with NCERT integration`);
      
      // Fetch NCERT textbooks for the subject and grade
      let ncertContent = '';
      let ncertTextbooks = [];
      
      try {
        // Get NCERT textbooks for this grade and subject
        const textbooksResponse = await fetch(`http://localhost:5000/api/ncert/textbooks/class/${grade}`);
        if (textbooksResponse.ok) {
          const textbooksData = await textbooksResponse.json();
          ncertTextbooks = textbooksData.data?.filter((book: any) => 
            book.subject.toLowerCase().includes(subject.toLowerCase()) ||
            subject.toLowerCase().includes(book.subject.toLowerCase())
          ) || [];
          
          if (ncertTextbooks.length > 0) {
            ncertContent = `
NCERT Textbook Reference for Grade ${grade} ${subject}:
${ncertTextbooks.map((book: any) => `- ${book.bookTitle} (${book.language}): ${book.pdfUrl}`).join('\n')}

Use these NCERT textbook references to align lesson content with official curriculum standards.`;
            console.log(`📖 Found ${ncertTextbooks.length} NCERT textbooks for Grade ${grade} ${subject}`);
          }
        }
      } catch (ncertError) {
        console.log('📚 NCERT integration not available, proceeding with standard lesson plan');
      }
      
      // Include selected NCERT lessons information
      const selectedLessonsInfo = selectedLessons && selectedLessons.length > 0 
        ? `\nSelected NCERT Lessons to incorporate:
${selectedLessons.map(lesson => `- ${lesson.title} (${lesson.chapter} from ${lesson.textbookTitle})`).join('\n')}

Please ensure the weekly plan specifically addresses these selected NCERT lessons and distributes them appropriately across the 5-day schedule.`
        : '';

      const prompt = `Generate a comprehensive weekly lesson plan for:
      
Subject: ${subject}
Grade Level: ${grade}
Curriculum: ${curriculum}
Week Number: ${weekNumber}
Focus Areas: ${focusAreas.join(', ')}
Lesson Duration: ${lessonDuration} minutes

${ncertContent}${selectedLessonsInfo}

Create a detailed lesson plan that includes:
1. Clear learning objectives aligned with NCERT curriculum standards
2. Daily lesson breakdown (Monday to Friday) incorporating selected NCERT lessons
3. Interactive activities and teaching methods
4. Assessment strategies
5. Required materials and resources
6. Homework assignments aligned with NCERT exercises
7. Cultural context and local examples where appropriate
8. Specific NCERT chapter/section references from selected lessons

Format the response as a JSON object with this structure:
{
  "title": "Week ${weekNumber}: ${subject} - [Main Topic]",
  "subject": "${subject}",
  "grade": ${grade},
  "weekNumber": ${weekNumber},
  "curriculum": "${curriculum}",
  "objectives": ["objective1", "objective2", "objective3"],
  "dailyLessons": [
    {
      "day": "Monday",
      "topic": "Topic name",
      "duration": ${lessonDuration},
      "activities": ["activity1", "activity2"],
      "materials": ["material1", "material2"],
      "objectives": ["daily objective1"],
      "homework": "Homework description",
      "notes": "Additional notes",
      "ncertReference": "Chapter/Section reference from NCERT textbook if applicable"
    }
  ],
  "assessments": [
    {
      "type": "quiz",
      "title": "Assessment title",
      "description": "Assessment description",
      "dueDate": "2025-01-30",
      "points": 100
    }
  ],
  "resources": ["resource1", "resource2"],
  "ncertAlignment": {
    "textbooks": ${JSON.stringify(ncertTextbooks.map((book: any) => ({
      title: book.bookTitle,
      language: book.language,
      pdfUrl: book.pdfUrl
    })))},
    "chapters": "List relevant chapters/sections",
    "learningOutcomes": "NCERT learning outcomes alignment"
  },
  "status": "draft"
}

Make the content culturally relevant to Indian education system and include local examples where appropriate. Reference NCERT textbook content and structure where possible.`;

      const response = await geminiEduService.generateLocalizedContent({
        prompt,
        agentType: 'lesson-planner',
        grades: [grade],
        languages: ['English'],
        contentSource: ncertTextbooks.length > 0 ? 'prebook' : 'external'
      });
      
      if (!response || !response.content) {
        throw new Error('Failed to generate lesson plan content');
      }

      // Clean and parse the response
      let cleanContent = response.content.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Remove any leading/trailing whitespace
      cleanContent = cleanContent.trim();
      
      let planData;
      try {
        planData = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        console.error('Raw content:', cleanContent);
        throw new Error('Invalid JSON format in AI response');
      }
      
      // Add unique ID and timestamps
      const plan = {
        id: Date.now().toString(),
        ...planData,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      console.log(`✅ Generated lesson plan: "${plan.title}" with ${plan.dailyLessons?.length || 0} daily lessons`);
      
      res.json({ success: true, plan });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to generate lesson plan',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Lesson Planner Agent - Get All Plans
  app.get('/api/agents/lesson-planner/plans', async (req: Request, res: Response) => {
    try {
      // In a real app, this would fetch from database  
      // For now, return empty array since we don't have persistence
      res.json([]);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch lesson plans' });
    }
  });

  // Lesson Planner Agent - Generate PDF for Lesson Plan
  app.post('/api/agents/lesson-planner/generate-pdf', async (req: Request, res: Response) => {
    try {
      const { plan } = req.body;
      
      if (!plan) {
        return res.status(400).json({ success: false, error: 'Lesson plan data is required' });
      }

      console.log(`📄 Generating PDF for lesson plan: "${plan.title}"`);

      // Format lesson plan content for PDF
      const formatLessonPlan = (plan: any) => {
        let content = `
<div class="lesson-overview">
  <h2>📚 Lesson Overview</h2>
  <div class="overview-grid">
    <div class="overview-item">
      <strong>Subject:</strong> ${plan.subject}
    </div>
    <div class="overview-item">
      <strong>Grade:</strong> ${plan.grade}
    </div>
    <div class="overview-item">
      <strong>Week:</strong> ${plan.weekNumber}
    </div>
    <div class="overview-item">
      <strong>Curriculum:</strong> ${plan.curriculum}
    </div>
  </div>
</div>

<div class="objectives-section">
  <h2>🎯 Learning Objectives</h2>
  <ul>
    ${plan.objectives?.map((obj: string) => `<li>${obj}</li>`).join('') || '<li>No objectives specified</li>'}
  </ul>
</div>

<div class="daily-lessons">
  <h2>📅 Daily Lesson Breakdown</h2>
  ${plan.dailyLessons?.map((lesson: any) => `
    <div class="lesson-day">
      <h3>${lesson.day} - ${lesson.topic}</h3>
      <div class="lesson-details">
        <div class="lesson-section">
          <h4>🎯 Objectives:</h4>
          <ul>
            ${lesson.objectives?.map((obj: string) => `<li>${obj}</li>`).join('') || '<li>No objectives specified</li>'}
          </ul>
        </div>
        
        <div class="lesson-section">
          <h4>🎪 Activities (${lesson.duration} minutes):</h4>
          <ul>
            ${lesson.activities?.map((activity: string) => `<li>${activity}</li>`).join('') || '<li>No activities specified</li>'}
          </ul>
        </div>
        
        <div class="lesson-section">
          <h4>📦 Materials:</h4>
          <ul>
            ${lesson.materials?.map((material: string) => `<li>${material}</li>`).join('') || '<li>No materials specified</li>'}
          </ul>
        </div>
        
        <div class="lesson-section">
          <h4>📝 Homework:</h4>
          <p>${lesson.homework || 'No homework assigned'}</p>
        </div>
        
        ${lesson.ncertReference ? `
        <div class="lesson-section">
          <h4>📖 NCERT Reference:</h4>
          <p>${lesson.ncertReference}</p>
        </div>
        ` : ''}
        
        <div class="lesson-section">
          <h4>📋 Teaching Notes:</h4>
          <p>${lesson.notes || 'No additional notes'}</p>
        </div>
      </div>
    </div>
  `).join('') || '<p>No daily lessons available</p>'}
</div>

<div class="assessments-section">
  <h2>📊 Assessments</h2>
  ${plan.assessments?.map((assessment: any) => `
    <div class="assessment-item">
      <h3>${assessment.title} (${assessment.type})</h3>
      <p><strong>Description:</strong> ${assessment.description}</p>
      <p><strong>Due Date:</strong> ${assessment.dueDate}</p>
      <p><strong>Points:</strong> ${assessment.points}</p>
    </div>
  `).join('') || '<p>No assessments defined</p>'}
</div>

<div class="resources-section">
  <h2>📚 Resources</h2>
  <ul>
    ${plan.resources?.map((resource: string) => `<li>${resource}</li>`).join('') || '<li>No resources specified</li>'}
  </ul>
</div>

${plan.ncertAlignment ? `
<div class="ncert-alignment">
  <h2>📖 NCERT Curriculum Alignment</h2>
  <div class="ncert-textbooks">
    <h3>Referenced Textbooks:</h3>
    <ul>
      ${plan.ncertAlignment.textbooks?.map((book: any) => `
        <li><strong>${book.title}</strong> (${book.language})</li>
      `).join('') || '<li>No NCERT textbooks referenced</li>'}
    </ul>
  </div>
  <div class="ncert-chapters">
    <h3>Relevant Chapters:</h3>
    <p>${plan.ncertAlignment.chapters || 'No specific chapters referenced'}</p>
  </div>
  <div class="learning-outcomes">
    <h3>Learning Outcomes Alignment:</h3>
    <p>${plan.ncertAlignment.learningOutcomes || 'No specific learning outcomes alignment specified'}</p>
  </div>
</div>
` : ''}

<style>
.lesson-overview {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.overview-item {
  background: rgba(255,255,255,0.7);
  padding: 10px;
  border-radius: 8px;
}

.objectives-section, .daily-lessons, .assessments-section, .resources-section, .ncert-alignment {
  margin-bottom: 25px;
  padding: 15px;
  border-left: 4px solid #4f46e5;
  background: #f8fafc;
}

.lesson-day {
  background: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.lesson-day h3 {
  color: #4f46e5;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.lesson-section {
  margin-bottom: 15px;
}

.lesson-section h4 {
  color: #374151;
  font-size: 1rem;
  margin-bottom: 8px;
}

.assessment-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #10b981;
}

.ncert-alignment {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
}

.ncert-textbooks, .ncert-chapters, .learning-outcomes {
  margin-bottom: 15px;
}

ul {
  margin-left: 20px;
}

li {
  margin-bottom: 5px;
}
</style>
        `;
        return content;
      };

      const lessonPlanContent = formatLessonPlan(plan);

      // Import PDF generator
      const { PDFGeneratorService } = await import('./pdf-generator');
      const pdfGenerator = new PDFGeneratorService();

      const pdfOptions = {
        title: plan.title || 'Weekly Lesson Plan',
        content: lessonPlanContent,
        grades: [plan.grade],
        languages: ['English'],
        subject: plan.subject,
        agentType: 'lesson-planner',
        generatedAt: new Date()
      };

      const result = await pdfGenerator.generatePDF(pdfOptions);

      console.log(`✅ Generated PDF for lesson plan: ${result.filename}`);

      res.json({
        success: true,
        filename: result.filename,
        filePath: result.filePath,
        downloadUrl: `/api/download/pdf/${result.filename}`,
        message: 'Lesson plan PDF generated successfully'
      });

    } catch (error) {
      console.error('Error generating lesson plan PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate lesson plan PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // PDF Download endpoint
  app.get('/api/download/pdf/:filename', async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), 'generated_pdfs', filename);
      
      console.log(`📥 Attempting to download PDF: ${filename}`);
      console.log(`📁 File path: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.log(`❌ PDF file not found: ${filePath}`);
        return res.status(404).json({ 
          error: 'PDF file not found',
          filename: filename,
          path: filePath
        });
      }

      // Get file stats
      const stats = fs.statSync(filePath);
      console.log(`✅ PDF file found, size: ${stats.size} bytes`);

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', stats.size.toString());
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      
      fileStream.on('error', (streamError) => {
        console.error('Error streaming PDF file:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error streaming PDF file' });
        }
      });

      fileStream.on('end', () => {
        console.log(`✅ PDF download completed: ${filename}`);
      });

      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ 
          error: 'Failed to download PDF file',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  });

  // NCERT Lessons API - Get lessons by subject and grade
  app.get('/api/ncert/lessons', async (req: Request, res: Response) => {
    try {
      const { subject, grade } = req.query;
      
      if (!subject || !grade) {
        return res.status(400).json({ 
          error: 'Subject and grade parameters are required' 
        });
      }

      console.log(`🔍 Fetching NCERT lessons for ${subject} Grade ${grade}`);

      // Initialize NCERT scraper with Firebase storage
      const ncertScraper = new NCERTScraper();
      
      // Get lessons from NCERT database
      const lessons = await ncertScraper.getLessonsBySubjectAndGrade(
        subject as string, 
        parseInt(grade as string)
      );

      console.log(`✅ Found ${lessons.length} NCERT lessons for ${subject} Grade ${grade}`);

      res.json(lessons);
    } catch (error) {
      console.error('Error fetching NCERT lessons:', error);
      res.status(500).json({ 
        error: 'Failed to fetch NCERT lessons',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // NCERT Lesson Content API - Get detailed content for a specific lesson
  app.get('/api/ncert/lessons/:lessonId', async (req: Request, res: Response) => {
    try {
      const { lessonId } = req.params;
      
      console.log(`📖 Fetching detailed content for lesson ID: ${lessonId}`);

      const ncertScraper = new NCERTScraper();
      const lessonContent = await ncertScraper.getLessonContent(lessonId);

      if (!lessonContent) {
        return res.status(404).json({ error: 'Lesson content not found' });
      }

      console.log(`✅ Retrieved content for lesson: ${lessonContent.title}`);

      res.json(lessonContent);
    } catch (error) {
      console.error('Error fetching lesson content:', error);
      res.status(500).json({ 
        error: 'Failed to fetch lesson content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Gamified Teaching - Game Generation
  app.post("/api/agents/gamified-teaching/generate-game", async (req, res) => {
    try {
      const { topic, grade, difficulty, gameType, duration, playerCount } = req.body;
      
      console.log(`🎮 Generating ${gameType} game for Grade ${grade}: "${topic}"`);
      
      const gamePrompt = `Create an educational ${gameType} game for Grade ${grade} students on "${topic}".
      
Game Requirements:
- Difficulty: ${difficulty}
- Duration: ${duration} minutes
- Players: ${playerCount}
- Educational focus: ${topic}
- Grade level: ${grade}

Generate:
1. Game title (engaging and educational)
2. Game description (2-3 sentences)
3. 10 educational questions with:
   - Clear question text
   - 4 multiple choice options
   - Correct answer index (0-3)
   - Educational explanation
   - Points value (10-50 based on difficulty)
   - Time limit (15-45 seconds)
4. 5 reward badges with names, descriptions, and rarity
5. 3 challenge objectives with rewards

Format as JSON with structure:
{
  "title": "Game Title",
  "description": "Description",
  "questions": [...],
  "rewards": [...],
  "challenges": [...],
  "metadata": {
    "estimatedTime": ${duration},
    "difficulty": "${difficulty}",
    "points": totalMaxPoints
  }
}`;

      const response = await geminiEduService.generateLocalizedContent({
        prompt: gamePrompt,
        agentType: 'gamified-teaching',
        grades: [grade],
        languages: ['English'],
        contentSource: 'external'
      });
      
      try {
        // Clean up the response by removing markdown code blocks
        let cleanContent = response.content;
        if (cleanContent.includes('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        }
        if (cleanContent.includes('```')) {
          cleanContent = cleanContent.replace(/```[\s\S]*?```/g, '').trim();
        }
        
        const gameData = JSON.parse(cleanContent);
        
        // Add unique IDs and normalize property names
        const game = {
          id: Date.now().toString(),
          ...gameData,
          questions: gameData.questions?.map((q: any, index: number) => ({
            id: `q_${index}`,
            question: q.questionText || q.question || `Question ${index + 1}`,
            options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q.correctAnswer || 0),
            explanation: q.educationalExplanation || q.explanation || 'Explanation not provided',
            points: q.pointsValue || q.points || 20,
            timeLimit: q.timeLimitSeconds || q.timeLimit || 30
          })) || [],
          rewards: gameData.rewards?.map((r: any, index: number) => ({
            id: `r_${index}`,
            ...r,
            rarity: r.rarity || 'common'
          })) || [],
          challenges: gameData.challenges?.map((c: any, index: number) => ({
            id: `c_${index}`,
            ...c
          })) || []
        };
        
        console.log(`✅ Generated game: "${game.title}" with ${game.questions.length} questions`);
        
        res.json({
          success: true,
          game
        });
        
      } catch (parseError) {
        console.error("❌ Failed to parse game JSON:", parseError);
        
        // Return a fallback structured game
        const fallbackGame = {
          id: Date.now().toString(),
          title: `${topic} Quiz Challenge`,
          description: `Test your knowledge of ${topic} with this Grade ${grade} educational game!`,
          gameType,
          questions: [
            {
              id: 'q_1',
              question: `What is an important concept related to ${topic}?`,
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              correctAnswer: 0,
              explanation: 'This is the correct answer because...',
              points: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 25 : 40,
              timeLimit: 30
            }
          ],
          rewards: [
            {
              id: 'r_1',
              name: 'Quick Learner',
              description: 'Answered your first question!',
              icon: 'star',
              rarity: 'common' as const,
              pointsRequired: 10
            }
          ],
          challenges: [
            {
              id: 'c_1',
              title: 'First Steps',
              description: 'Complete your first question',
              objective: 'Answer 1 question correctly',
              reward: 'Quick Learner badge',
              difficulty: 'easy'
            }
          ],
          metadata: {
            estimatedTime: duration,
            difficulty,
            points: difficulty === 'easy' ? 100 : difficulty === 'medium' ? 250 : 400
          }
        };
        
        res.json({
          success: true,
          game: fallbackGame
        });
      }
      
    } catch (error) {
      console.error("❌ Game generation error:", error);
      res.status(500).json({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate game'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Gemini AI functions are now handled by geminiEduService
