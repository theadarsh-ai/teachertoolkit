const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// Configure multer for file uploads
const upload = multer({ 
  dest: "/tmp/uploads/",
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    platform: "firebase", 
    timestamp: new Date().toISOString(),
    message: "Firebase Functions running successfully"
  });
});

// Content Generator endpoint
app.post("/api/agents/content-generator", (req, res) => {
  try {
    const { content, userId } = req.body;
    
    // Simple response for Firebase testing
    const response = {
      success: true,
      message: "Content generated successfully on Firebase",
      content: {
        title: "Sample Educational Content",
        description: `Content based on: ${content || "sample input"}`,
        materials: [
          "Educational material 1",
          "Educational material 2",
          "Educational material 3"
        ]
      },
      platform: "firebase-functions"
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      platform: "firebase-functions"
    });
  }
});

// Differentiated Materials endpoint
app.post("/api/agents/differentiated-materials", upload.single('uploadedImage'), (req, res) => {
  try {
    const { sourceContent, grades, questionType, questionCount, userId } = req.body;
    const hasImage = !!req.file;
    
    // Simple response for Firebase testing
    const response = {
      success: true,
      message: `Generated ${questionCount || 5} questions successfully on Firebase`,
      materials: {
        questions: [
          {
            question: "Sample question generated on Firebase Functions",
            options: {
              A: "Option A",
              B: "Option B", 
              C: "Option C",
              D: "Option D"
            },
            correct_answer: "B"
          }
        ],
        answers: [
          {
            question_number: 1,
            correct_answer: "B",
            explanation: "This is a sample explanation generated on Firebase Functions"
          }
        ]
      },
      processing: {
        hasImage,
        grades: JSON.parse(grades || "[]"),
        questionType: questionType || "multiple-choice",
        questionCount: questionCount || 5
      },
      platform: "firebase-functions"
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      platform: "firebase-functions"
    });
  }
});

// Dashboard endpoint
app.get("/api/agents", (req, res) => {
  const agents = [
    { id: "content-generator", name: "Content Generator", status: "active" },
    { id: "differentiated-materials", name: "Differentiated Materials", status: "active" }
  ];
  
  res.json({ 
    success: true, 
    agents,
    platform: "firebase-functions"
  });
});

// Catch all for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "API endpoint not found on Firebase Functions",
    path: req.path,
    platform: "firebase-functions"
  });
});

exports.app = onRequest(app);