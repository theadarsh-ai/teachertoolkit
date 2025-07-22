import type { Express } from "express";
import { createServer, type Server } from "http";
import { spawn } from "child_process";
import multer from "multer";
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

  // AR Integration endpoints - Direct Python approach
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

      // Call Python script directly for faster results
      const pythonProcess = spawn('python3', ['server/ar-integration-direct.py', query], {
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code: number) => {
        if (stderr) {
          console.log('🐍 Python output:', stderr);
        }

        if (code !== 0) {
          console.error('❌ Python script failed with code:', code);
          return res.status(500).json({
            success: false,
            error: 'Failed to search 3D models'
          });
        }

        try {
          const result = JSON.parse(stdout);
          console.log(`✅ DIRECT: Found ${result.count} models`);
          console.log(`📤 DIRECT: Sample models:`, result.models?.slice(0, 2).map((m: any) => ({ name: m.name, author: m.author, id: m.id })));
          
          res.json(result);
        } catch (parseError) {
          console.error('❌ Failed to parse Python output:', parseError);
          res.status(500).json({
            success: false,
            error: 'Failed to parse search results'
          });
        }
      });

      // Handle timeout
      setTimeout(() => {
        pythonProcess.kill();
        res.status(500).json({
          success: false,
          error: 'Search timeout'
        });
      }, 15000);

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

  const httpServer = createServer(app);
  return httpServer;
}

// Gemini AI functions are now handled by geminiEduService
