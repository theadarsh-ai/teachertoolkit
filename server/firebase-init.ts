import { firebaseStorage } from './firebase-storage';

// Initialize Firebase with demo data for development
export async function initializeFirebaseData() {
  try {
    console.log('🔥 Setting up Firebase for EduAI Platform...');
    
    // Set emulator environment for local development
    if (process.env.NODE_ENV === 'development') {
      process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
      console.log('🔧 Using Firebase Emulator for local development');
    }
    
    if (firebaseStorage.initializeDemoData) {
      await firebaseStorage.initializeDemoData();
      console.log('✅ Firebase demo data initialized successfully');
    }
    
    // Test basic functionality
    const textbooks = await firebaseStorage.getNCERTTextbooks();
    console.log(`📚 Firebase contains ${textbooks.length} NCERT textbooks`);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.log('💡 Make sure Firebase emulators are running: npx firebase-tools emulators:start --only firestore');
    return false;
  }
}

// Print setup instructions
export function showFirebaseSetup() {
  console.log(`
🔥 FIREBASE SETUP FOR EDUAI PLATFORM

Current Configuration:
- Project ID: ${process.env.FIREBASE_PROJECT_ID || '❌ Not set'}
- Client Email: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Not set'}  
- Private Key: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Not set'}

🚀 FOR PRODUCTION FIREBASE:
1. Your Firebase project is already configured
2. All 11 AI agents will store data in Firestore
3. NCERT textbook database available via Firebase
4. Access your Firebase Console: https://console.firebase.google.com

🔧 FOR LOCAL DEVELOPMENT WITH EMULATORS:
1. Install Firebase CLI: npm install -g firebase-tools
2. Start emulators: firebase emulators:start --only firestore
3. Access Firebase UI: http://localhost:4000
4. Firestore data: http://localhost:4000/firestore

📊 APPLICATION ACCESS:
- EduAI Platform: http://localhost:5000
- Firebase Studio: http://localhost:4000 (when emulators running)
- Firestore Database: Integrated with all AI agents
`);
}