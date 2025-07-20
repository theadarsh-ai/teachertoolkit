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

  app.post("/api/agents/knowledge-base", async (req, res) => {
    try {
      const { query, language = 'English' } = req.body;
      const response = await geminiEduService.processInstantQuery(query, language);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Gemini AI functions are now handled by geminiEduService
