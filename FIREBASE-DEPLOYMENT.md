# 🚀 Firebase Hosting Deployment Guide

## Complete Setup for Frontend + Backend Deployment

Your EduAI Platform is now configured for **complete Firebase hosting deployment** with both frontend and backend running on Firebase infrastructure.

## 📋 Prerequisites

1. **Firebase CLI installed**: `npm install -g firebase-tools`
2. **Firebase project**: `genzion-ai` (already configured)
3. **Environment variables**: All secrets properly set in Firebase Functions config

## 🏗️ Architecture Overview

```
Firebase Hosting (Frontend)
├── React Application (dist/)
├── Static Assets
└── SPA Routing

Firebase Functions (Backend)  
├── Express.js API (/api/*)
├── Knowledge Base Agent
├── Video Generation Service
├── NCERT Database Integration
├── All 12 AI Agents
└── PostgreSQL Database Connection
```

## 🚀 Deployment Steps

### 1. Quick Deploy (Automated)
```bash
./firebase-deploy.sh
```

### 2. Manual Deploy Steps

#### Build Frontend:
```bash
npm run build
```

#### Build Functions:
```bash
cd functions
npm install
npm run build
cd ..
```

#### Deploy Everything:
```bash
firebase deploy
```

#### Deploy Only Frontend:
```bash
firebase deploy --only hosting
```

#### Deploy Only Backend:
```bash
firebase deploy --only functions
```

## 🔧 Configuration Details

### Firebase Hosting Configuration (`firebase.json`)
```json
{
  "hosting": {
    "public": "dist",
    "predeploy": ["npm run build"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Firebase Functions Configuration
- **Runtime**: Node.js 20
- **Memory**: 2GB
- **Timeout**: 540 seconds (9 minutes)
- **Region**: us-central1
- **Max Instances**: 10

## 🌐 Live URLs After Deployment

**Frontend**: `https://genzion-ai.web.app`
**Backend API**: `https://genzion-ai.web.app/api/*`

### API Endpoints Available:
- `GET /api/health` - Health check
- `POST /api/agents/knowledge-base/query` - Enhanced Knowledge Base
- `GET /api/agents/knowledge-base/history/:userId` - Q&A History  
- `POST /api/video-generator/generate` - Video Generation
- `GET /api/ncert/textbooks` - NCERT Database
- `GET /api/sketchfab/models` - 3D Models

## 🔐 Environment Variables

Ensure these secrets are set in Firebase Functions:
```bash
firebase functions:config:set \
  gemini.api_key="YOUR_GEMINI_API_KEY" \
  database.url="YOUR_NEON_DATABASE_URL" \
  firebase.project_id="genzion-ai" \
  google.cloud.project_id="genzion-ai" \
  google.cloud.location="us-central1"
```

## 📊 Features Available After Deployment

### ✅ Fully Functional Services:
- **12 AI Agents**: All educational agents working with Gemini AI
- **Knowledge Base**: Enhanced Q&A with step-by-step explanations
- **Video Generation**: Real Google Veo 3.0 video creation
- **NCERT Integration**: Complete textbook database
- **AR Models**: Sketchfab educational 3D models
- **User Authentication**: Firebase Auth with Google OAuth
- **Database**: PostgreSQL with complete schema
- **File Processing**: PDF, image, audio handling

### 🎯 Production Features:
- **CDN**: Global content delivery via Firebase
- **HTTPS**: Automatic SSL certificates
- **Caching**: Optimized static asset caching
- **Scaling**: Auto-scaling functions
- **Monitoring**: Built-in Firebase Analytics
- **Error Tracking**: Function logs and crash reporting

## 🛠️ Development vs Production

### Development (Current Replit):
```bash
npm run dev  # Runs on localhost:5000
```

### Production (Firebase):
```bash
firebase deploy  # Deploys to genzion-ai.web.app
```

## 📱 Mobile & Performance

- **Progressive Web App**: Full PWA support
- **Responsive Design**: Works on all devices
- **Fast Loading**: Optimized bundles and lazy loading
- **Offline Support**: Service worker integration

## 🔍 Monitoring & Logs

```bash
# View function logs
firebase functions:log

# Monitor performance
firebase console

# Real-time logs
firebase functions:log --follow
```

## 🚨 Troubleshooting

### Common Issues:
1. **Build Errors**: Check `npm run build` output
2. **Function Timeouts**: Increase timeout in firebase.json
3. **Database Connection**: Verify DATABASE_URL secret
4. **API Errors**: Check function logs for details

### Debug Commands:
```bash
# Test locally with emulators
firebase emulators:start

# Check deployment status
firebase deploy --dry-run

# View project info
firebase projects:list
```

## 🎉 Success Metrics

After successful deployment, you'll have:
- ✅ Frontend loading at `https://genzion-ai.web.app`
- ✅ API responding at `https://genzion-ai.web.app/api/health`
- ✅ All 12 AI agents fully functional
- ✅ Database operations working
- ✅ File uploads and processing enabled
- ✅ Real-time features active

Your EduAI Platform is now **production-ready** on Firebase! 🚀