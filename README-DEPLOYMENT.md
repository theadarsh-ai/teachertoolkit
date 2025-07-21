# EduAI Platform - Multi-Platform Deployment

## 🚀 Quick Start on Any Platform

This application is designed to work seamlessly across multiple coding platforms while maintaining full functionality.

### Supported Platforms
- ✅ **Replit** (Current - fully configured)
- ✅ **Firebase Studio** (Google Cloud Platform)
- ✅ **Vercel** (Serverless deployment)
- ✅ **Heroku** (Container deployment)
- ✅ **Netlify** (JAMstack deployment)
- ✅ **Local Development** (Any Node.js environment)

## 📋 Platform Detection

Run this command to detect your current platform and get specific instructions:
```bash
node scripts/detect-platform.js
```

## 🔧 Quick Setup for Firebase Studio

### 1. Download and Extract
1. Download this project as a ZIP file
2. Extract to your Firebase Studio workspace
3. Open terminal in the project directory

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 4. Initialize Firebase (First Time)
```bash
firebase init
```
Select:
- ✅ Functions: Configure Cloud Functions
- ✅ Hosting: Configure Firebase Hosting
- Choose existing project or create new one
- Language: JavaScript
- Public directory: `dist/public`
- Single-page app: Yes

### 5. Set Environment Variables
```bash
firebase functions:config:set \
  gemini.api_key="your_gemini_api_key" \
  database.url="your_postgresql_url" \
  firebase.project_id="your_firebase_project_id"
```

### 6. Development with Emulators
```bash
# Build the application first
npm run build

# Start Firebase emulators
firebase emulators:start
```

### 7. Deploy to Production
```bash
# Build and deploy
npm run build
cd functions && npm install && npm run build && cd ..
firebase deploy
```

## 🌐 Environment Variables Required

Create these environment variables in your platform:

### Core Variables (Required)
```
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_postgresql_database_url
```

### Firebase Variables (If using Firebase Auth)
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Files Added for Multi-Platform Support

### Firebase Studio
- `firebase.json` - Firebase configuration
- `functions/package.json` - Cloud Functions dependencies
- `functions/index.js` - Function entry point

### Vercel
- `vercel.json` - Vercel configuration

### Heroku
- `Procfile` - Process configuration

### Netlify
- `netlify.toml` - Netlify configuration

### All Platforms
- `scripts/detect-platform.js` - Platform detection
- `server/platform-config.ts` - Platform-specific configuration
- `.env.example` - Environment variables template

## 🔍 Features Available on All Platforms

### ✅ Frontend Features
- React 18 with TypeScript
- Tailwind CSS styling
- Firebase Authentication
- Responsive design
- Mobile-friendly interface

### ✅ Backend Features
- Express.js REST API
- PostgreSQL database support
- Gemini AI integration
- File upload handling
- PDF generation system

### ✅ AI Agents
- Content Generator
- Differentiated Materials (Image + Text processing)
- Question generation with Indian cultural context
- Multi-grade adaptation (1st-12th)
- PDF download system

## 🛠 Troubleshooting

### Common Issues
1. **Environment variables not working**: Check platform-specific environment variable setup
2. **Database connection failed**: Ensure PostgreSQL URL is correct and accessible
3. **Build errors**: Run `npm install` and `npm run build` locally first
4. **Firebase deployment fails**: Check Node.js version and Firebase CLI version

### Platform-Specific Help
- **Firebase**: See `deploy/firebase-studio.md`
- **All Platforms**: See `deploy/platform-setup.md`

## 📞 Testing the Application

After deployment, test these core features:
1. **Dashboard**: Navigate to homepage - should show 11 AI agents
2. **Content Generator**: Upload content and generate educational materials
3. **Differentiated Materials**: Upload textbook images and generate questions
4. **PDF Download**: Verify both question and answer PDFs download correctly

## 🎯 Current Status
- ✅ **Replit**: Fully functional (current platform)
- ✅ **Firebase Studio**: Ready for deployment
- ✅ **Other Platforms**: Configuration files provided

The application maintains 100% functionality across all platforms while adapting to each platform's specific requirements.