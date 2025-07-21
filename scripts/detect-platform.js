#!/usr/bin/env node
/**
 * Platform Detection Script
 * Detects the current deployment platform and provides appropriate instructions
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const platforms = {
  replit: () => process.env.REPL_ID !== undefined,
  firebase: () => existsSync('firebase.json') && process.env.FIREBASE_CONFIG !== undefined,
  vercel: () => process.env.VERCEL !== undefined,
  heroku: () => process.env.DYNO !== undefined,
  netlify: () => process.env.NETLIFY !== undefined,
  local: () => true // fallback
};

function detectPlatform() {
  for (const [name, detector] of Object.entries(platforms)) {
    if (detector()) {
      return name;
    }
  }
  return 'unknown';
}

function getInstructions(platform) {
  const instructions = {
    replit: `
🚀 REPLIT PLATFORM DETECTED
✅ Already configured and running!
📝 Commands:
   - npm run dev (development)
   - npm run build (production build)
   - npm run start (production)
`,
    firebase: `
🔥 FIREBASE PLATFORM DETECTED
📝 Commands:
   - firebase emulators:start (development)
   - firebase deploy (production)
   
🔧 Setup Steps:
   1. firebase init (if not already done)
   2. Set environment variables in Firebase Console
   3. firebase functions:config:set gemini.api_key="your_key"
`,
    vercel: `
▲ VERCEL PLATFORM DETECTED
📝 Commands:
   - vercel dev (development)
   - vercel --prod (production)
   
🔧 Setup Steps:
   1. Add environment variables in Vercel Dashboard
   2. Configure build settings: npm run vercel:build
`,
    heroku: `
🟪 HEROKU PLATFORM DETECTED
📝 Commands:
   - heroku local (development)
   - git push heroku main (deploy)
   
🔧 Setup Steps:
   1. heroku config:set KEY=value (environment variables)
   2. Configure Procfile for production
`,
    local: `
💻 LOCAL DEVELOPMENT
📝 Commands:
   - npm run dev (development)
   - npm run build && npm run start (production)
   
🔧 Setup Steps:
   1. Create .env file with required variables
   2. Set up local PostgreSQL database
`
  };
  
  return instructions[platform] || instructions.local;
}

const platform = detectPlatform();
console.log(`Platform: ${platform.toUpperCase()}`);
console.log(getInstructions(platform));