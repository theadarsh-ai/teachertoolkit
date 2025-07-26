import type { Express } from "express";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { storage } from "./storage";
import { geminiEduService } from "./gemini";
import { pdfGenerator } from "./pdf-generator";
import { htmlGenerator } from "./html-generator";
import { GooglePolyService } from './google-poly-api';
import { SketchfabService } from './sketchfab-api';
import { videoGeneratorService } from './video-generator';
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

// Configure multer for file uploads in Firebase Functions
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('audio/') ||
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype === 'text/csv' ||
        file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export function setupRoutes(app: Express) {
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      platform: 'Firebase Functions',
      services: {
        database: 'PostgreSQL',
        ai: 'Gemini 2.5',
        storage: 'Firebase Storage'
      }
    });
  });

  // Enhanced Instant Knowledge Base with History
  app.post('/api/agents/knowledge-base/query', async (req, res) => {
    try {
      const { question, grade, subject, language, userId, options } = req.body;
      
      console.log(`🧠 Knowledge Base Query: "${question}" (Grade ${grade}, ${subject}, ${language})`);
      
      let ncertResults: any[] = [];
      let externalSources: any[] = [];
      
      // Search NCERT textbooks if requested
      if (options?.searchNCERT) {
        console.log(`📚 Searching NCERT textbooks for Grade ${grade} ${subject}...`);
        try {
          const ncertResponse = await fetch(`http://localhost:5000/api/ncert/textbooks?grade=${grade}&subject=${encodeURIComponent(subject)}`);
          if (ncertResponse.ok) {
            const ncertData = await ncertResponse.json();
            ncertResults = ncertData.data || [];
          }
        } catch (error) {
          console.error('NCERT search failed:', error);
        }
        console.log(`✓ Found ${ncertResults.length} relevant NCERT textbooks`);
      }
      
      // Search external sources if requested
      if (options?.searchExternal) {
        console.log('🌐 Searching external educational sources...');
        // Simulate external source search
        externalSources = [{
          title: `Educational Resource: ${question}`,
          content: `External educational content about ${question}`,
          source: 'Educational Database',
          relevance: 0.9
        }];
      }
      
      // Generate comprehensive answer using Gemini
      console.log('🤖 Generating comprehensive answer with Gemini...');
      let geminiResponse;
      
      try {
        geminiResponse = await geminiEduService.generateEducationalContent({
          prompt: `Question: ${question}
          
          Please provide a comprehensive educational answer suitable for Grade ${grade} students studying ${subject} in ${language}. 
          
          Requirements:
          1. Provide a clear, comprehensive answer
          2. Include step-by-step explanations breaking down complex concepts
          3. Use culturally relevant examples from Indian context
          4. Add analogies that students can relate to
          5. Include follow-up questions for deeper learning
          6. Make it engaging and interactive
          
          Structure your response with:
          - Main Answer
          - Detailed Step-by-Step Explanation
          - Cultural Context/Examples
          - Analogies
          - Follow-up Questions`,
          grades: [grade],
          languages: [language],
          contentSource: ncertResults.length > 0 ? 'prebook' : 'external',
          agentType: 'knowledge-base'
        });
      } catch (error) {
        console.error('Gemini generation failed:', error);
        console.log('⚠️ Gemini response was insufficient, using enhanced fallback');
        
        // Enhanced fallback response
        geminiResponse = {
          content: `# ${question}

## Comprehensive Answer

I understand you're asking about "${question}" for Grade ${grade} ${subject}. Let me provide you with a detailed explanation.

## Step-by-Step Explanation

**Step 1: Understanding the Concept**
- This topic is fundamental to ${subject} at Grade ${grade} level
- It connects to other important concepts in your curriculum

**Step 2: Breaking Down the Process**
- The main components involve understanding the basic principles
- Each part builds upon the previous knowledge

**Step 3: Real-World Applications**
- This concept is visible in everyday life around us
- From local examples to global phenomena

## Cultural Context

In Indian context, this concept can be related to:
- Traditional practices and knowledge systems
- Local examples from our environment
- Connections to Indian innovations and discoveries

## Analogies for Better Understanding

Think of this like:
- A familiar process from daily life
- Something you observe in nature
- An activity you do regularly

## Follow-up Questions for Deeper Learning

1. How does this concept apply in your local environment?
2. Can you think of examples from Indian history or culture?
3. What questions do you still have about this topic?

Remember, learning is a journey, and every question leads to new discoveries!`,
          metadata: {
            grades: [grade],
            languages: [language],
            contentSource: 'fallback',
            culturallyRelevant: true,
            ncertAligned: false
          }
        };
      }
      
      console.log(`✅ Knowledge Base Response: ${ncertResults.length} NCERT + ${externalSources.length} external sources`);
      
      // Save to knowledge base history
      try {
        await storage.saveKnowledgeBaseHistory({
          userId,
          question,
          answer: geminiResponse.content,
          explanation: geminiResponse.content, // For now, using same content
          grade,
          subject,
          language,
          sources: JSON.stringify([...ncertResults, ...externalSources]),
          confidence: 0.85,
          responseTime: Date.now(),
          metadata: JSON.stringify(geminiResponse.metadata || {})
        });
      } catch (error) {
        console.error('Failed to save knowledge base history:', error);
      }
      
      res.json({
        success: true,
        response: {
          answer: geminiResponse.content,
          explanation: geminiResponse.content,
          sources: [...ncertResults, ...externalSources],
          confidence: 0.85,
          grade,
          subject,
          language,
          metadata: geminiResponse.metadata || {}
        }
      });
      
    } catch (error) {
      console.error('❌ Knowledge Base Query failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Get knowledge base history
  app.get('/api/agents/knowledge-base/history/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      const history = await storage.getKnowledgeBaseHistory(
        parseInt(userId), 
        parseInt(limit as string), 
        parseInt(offset as string)
      );
      
      res.json({
        success: true,
        data: history,
        count: history.length
      });
    } catch (error) {
      console.error('Failed to fetch knowledge base history:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history'
      });
    }
  });

  // Search knowledge base history
  app.get('/api/agents/knowledge-base/search/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { query, subject, grade } = req.query;
      
      const results = await storage.searchKnowledgeBaseHistory(
        parseInt(userId),
        query as string,
        subject as string,
        grade ? parseInt(grade as string) : undefined
      );
      
      res.json({
        success: true,
        data: results,
        count: results.length
      });
    } catch (error) {
      console.error('Failed to search knowledge base history:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search history'
      });
    }
  });

  // Video Generator endpoint
  app.post('/api/video-generator/generate', async (req, res) => {
    try {
      const { prompt, grade, subject, language } = req.body;
      
      if (!prompt) {
        return res.status(400).json({
          success: false,
          error: 'Prompt is required'
        });
      }
      
      console.log(`🎬 Video Generation Request: "${prompt}" (Grade ${grade}, ${subject})`);
      
      const result = await videoGeneratorService.generateVideo({
        prompt,
        grade: grade || 8,
        subject: subject || 'General',
        language: language || 'English'
      });
      
      res.json({
        success: true,
        videoUrl: result.videoUrl,
        metadata: result.metadata
      });
      
    } catch (error) {
      console.error('❌ Video generation failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed'
      });
    }
  });

  // NCERT endpoints
  app.get('/api/ncert/textbooks', async (req, res) => {
    try {
      const { grade, subject } = req.query;
      const scraper = new NCERTScraper();
      
      let textbooks = await scraper.getTextbooks();
      
      // Filter by grade and subject if provided
      if (grade) {
        textbooks = textbooks.filter(book => book.class === parseInt(grade as string));
      }
      if (subject) {
        textbooks = textbooks.filter(book => 
          book.subject.toLowerCase().includes((subject as string).toLowerCase())
        );
      }
      
      res.json({
        success: true,
        count: textbooks.length,
        data: textbooks,
        source: 'NCERT Database'
      });
    } catch (error) {
      console.error('NCERT textbooks fetch failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch NCERT textbooks'
      });
    }
  });

  // Sketchfab models endpoint
  app.get('/api/sketchfab/models', async (req, res) => {
    try {
      const { query } = req.query;
      const sketchfabService = new SketchfabService();
      
      const models = await sketchfabService.searchEducationalModels(query as string || 'education');
      
      res.json({
        success: true,
        count: models.length,
        data: models
      });
    } catch (error) {
      console.error('Sketchfab search failed:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search Sketchfab models'
      });
    }
  });

  // Default 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.originalUrl
    });
  });
}