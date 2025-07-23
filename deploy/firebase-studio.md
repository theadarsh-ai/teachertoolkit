# Firebase Studio Deployment Guide

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created in Firebase Console
- Environment variables configured

## Setup Steps for Firebase Studio

### 1. Initialize Firebase (First Time Only)
```bash
firebase login
firebase init
```
Select:
- ✅ Functions: Configure a Cloud Functions project
- ✅ Hosting: Configure files for Firebase Hosting
- Use existing project (select your project)
- Language: JavaScript
- Use ESLint: No
- Install dependencies: Yes
- Public directory: dist/public
- Single-page app: Yes

### 2. Environment Variables Setup
In Firebase Console → Functions → Configuration:
```bash
firebase functions:config:set \
  gemini.api_key="your_gemini_api_key" \
  database.url="your_postgresql_url" \
  firebase.project_id="your_project_id" \
  firebase.client_email="your_service_account_email" \
  firebase.private_key="your_private_key"
```

### 3. Build and Deploy
```bash
# Build the application
npm run build

# Build Firebase Functions
cd functions && npm install && npm run build && cd ..

# Deploy to Firebase
firebase deploy
```

### 4. Development with Emulators
```bash
# Start Firebase emulators
firebase emulators:start

# Or with UI
firebase emulators:start --inspect-functions
```

### 5. Access Your Application
- **Local Emulator**: http://localhost:5000
- **Production**: https://your-project-id.web.app

## File Structure for Firebase
```
your-project/
├── firebase.json          # Firebase configuration
├── functions/             # Cloud Functions
│   ├── package.json      # Functions dependencies
│   └── index.js          # Function entry point
├── dist/public/          # Built frontend (generated)
└── server/               # Your original server code
```

## Environment Variables Mapping
| Original | Firebase Config |
|----------|----------------|
| `GEMINI_API_KEY` | `functions:config:get gemini.api_key` |
| `DATABASE_URL` | `functions:config:get database.url` |
| `FIREBASE_PROJECT_ID` | `functions:config:get firebase.project_id` |

## Troubleshooting
1. **Functions not deploying**: Check Node.js version in functions/package.json
2. **Environment variables not working**: Use `firebase functions:config:get` to verify
3. **Database connection issues**: Ensure PostgreSQL is accessible from Firebase
4. **Build errors**: Run `npm run build` locally first to debug

## Firebase Studio Specific Features
- Real-time database integration
- Authentication with Firebase Auth
- Cloud Storage for generated PDFs
- Analytics and monitoring
- Automatic scaling