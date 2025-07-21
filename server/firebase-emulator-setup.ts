import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Setup Firebase Emulator for local development
export function setupFirebaseEmulator() {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const useEmulator = process.env.FIREBASE_USE_EMULATOR === 'true';
  
  if (isDevelopment && useEmulator) {
    console.log('🔧 Setting up Firebase Emulator for localhost:5000...');
    
    try {
      // Initialize Firebase app for emulator
      const app = initializeApp({
        projectId: 'demo-eduai-project'
      });
      
      const db = getFirestore(app);
      
      // Note: Firebase Admin SDK automatically connects to emulator when FIRESTORE_EMULATOR_HOST is set
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      
      console.log('✅ Firebase Emulator connected on localhost:8080');
      console.log('🌐 Firebase Studio UI available at: http://localhost:4000');
      console.log('📊 Firestore Emulator UI at: http://localhost:4000/firestore');
      
      return { app, db };
    } catch (error) {
      console.error('❌ Firebase Emulator setup failed:', error);
      console.log('💡 To start Firebase emulator, run: firebase emulators:start');
      throw error;
    }
  } else {
    console.log('🔥 Using production Firebase configuration');
    return null;
  }
}

// Environment setup instructions
export function printEmulatorInstructions() {
  console.log(`
🔥 FIREBASE STUDIO SETUP INSTRUCTIONS:

1. Install Firebase CLI (if not already installed):
   npm install -g firebase-tools

2. Login to Firebase:
   firebase login

3. Initialize Firebase project:
   firebase init

4. Start Firebase emulators:
   firebase emulators:start --only firestore

5. Access Firebase Studio:
   - Main UI: http://localhost:4000
   - Firestore: http://localhost:4000/firestore
   - Authentication: http://localhost:4000/auth

6. Your Express app will run on:
   http://localhost:5000

Environment variables needed:
- FIREBASE_PROJECT_ID=${process.env.FIREBASE_PROJECT_ID || 'your-project-id'}
- FIREBASE_CLIENT_EMAIL=${process.env.FIREBASE_CLIENT_EMAIL || 'your-service-account-email'}
- FIREBASE_PRIVATE_KEY=${process.env.FIREBASE_PRIVATE_KEY ? '✓ Set' : '❌ Missing'}
- FIREBASE_USE_EMULATOR=${process.env.FIREBASE_USE_EMULATOR || 'true'}
`);
}