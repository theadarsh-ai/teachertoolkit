import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiEduService } from "./gemini";
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

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      const { prompt, grades, languages, contentSource } = req.body;
      const content = await geminiEduService.generateLocalizedContent({
        prompt,
        agentType: 'content-generation',
        grades,
        languages,
        contentSource
      });
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/agents/differentiated-materials", async (req, res) => {
    try {
      const { sourceContent, grades } = req.body;
      const materials = await geminiEduService.createDifferentiatedMaterials(sourceContent, grades);
      res.json(materials);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
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

  const httpServer = createServer(app);
  return httpServer;
}

// Gemini AI functions are now handled by geminiEduService
