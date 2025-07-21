const { onRequest } = require("firebase-functions/v2/https");
const express = require("express");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple health check for Firebase Functions
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", platform: "firebase", timestamp: new Date().toISOString() });
});

// API routes will be registered here
// Note: This is a simplified version for Firebase Functions
// Full functionality requires adaptation of the complete server code

exports.app = onRequest(app);