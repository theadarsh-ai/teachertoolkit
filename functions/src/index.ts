import { onRequest } from "firebase-functions/v2/https";
import express from "express";
import * as cors from "cors";

// Import your existing server setup
import { setupRoutes } from "./routes";

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Setup API routes
setupRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    platform: 'Firebase Functions'
  });
});

// Export the Firebase Function
export const api = onRequest({
  region: 'us-central1',
  memory: '2GiB',
  timeoutSeconds: 540,
  maxInstances: 10
}, app);