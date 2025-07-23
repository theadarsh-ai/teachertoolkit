# Multi-Platform Deployment Guide

This application is designed to work across multiple platforms while maintaining full functionality.

## Supported Platforms

### 1. Replit (Current Platform)
✅ **Already configured and working**
```bash
npm run dev    # Development with hot reload
npm run build  # Production build
npm run start  # Production server
```

### 2. Firebase Studio
🔥 **Full Firebase integration with Cloud Functions**
```bash
firebase emulators:start  # Development
firebase deploy          # Production
```
See `deploy/firebase-studio.md` for detailed setup.

### 3. Vercel
▲ **Serverless deployment**
```bash
vercel dev     # Development
vercel --prod  # Production
```

### 4. Heroku
🟪 **Container-based deployment**
```bash
heroku local          # Development
git push heroku main  # Production
```

### 5. Local Development
💻 **Any environment with Node.js**
```bash
npm install
npm run dev
```

## Quick Platform Detection
```bash
node scripts/detect-platform.js
```

## Required Environment Variables
All platforms need these environment variables:

### Core Variables
```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_url
PORT=5000
```

### Firebase Variables (if using Firebase auth)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Architecture Compatibility

### Frontend (React + Vite)
- ✅ Works on all platforms
- ✅ Static build generation
- ✅ Environment variable handling

### Backend (Express + Node.js)
- ✅ Standard Express server
- ✅ Platform-agnostic database connections
- ✅ Serverless and traditional hosting support

### Database (PostgreSQL)
- ✅ Works with any PostgreSQL provider
- ✅ Neon Database (recommended)
- ✅ Local PostgreSQL
- ✅ Cloud providers (AWS RDS, Google Cloud SQL)

### AI Integration (Gemini)
- ✅ Works on all platforms
- ✅ Serverless compatible
- ✅ Environment variable configuration

## Downloading for Other Platforms

### Method 1: Direct Download
1. Download the entire project as ZIP
2. Extract to your preferred platform
3. Follow platform-specific setup guide

### Method 2: Git Clone (if available)
```bash
git clone <repository-url>
cd eduai-platform
npm install
```

### Method 3: Platform Migration
1. Copy these essential files to new platform:
   - `client/` (frontend)
   - `server/` (backend)
   - `shared/` (schemas)
   - `package.json`
   - `vite.config.ts`
   - `drizzle.config.ts`

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables for target platform

4. Run platform-specific commands

## File Compatibility Matrix

| File/Folder | Replit | Firebase | Vercel | Heroku | Local |
|-------------|--------|----------|--------|--------|-------|
| `client/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `server/` | ✅ | ✅* | ✅* | ✅ | ✅ |
| `shared/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `package.json` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `firebase.json` | ➖ | ✅ | ➖ | ➖ | ➖ |
| `vercel.json` | ➖ | ➖ | ✅ | ➖ | ➖ |
| `Procfile` | ➖ | ➖ | ➖ | ✅ | ➖ |

*Requires serverless adaptation

## Testing Across Platforms
1. **Replit**: Currently working ✅
2. **Firebase**: Use emulators for testing
3. **Vercel**: Use `vercel dev`
4. **Heroku**: Use `heroku local`
5. **Local**: Use `npm run dev`

## Support and Troubleshooting
Each platform has its own troubleshooting section in the respective setup guides.