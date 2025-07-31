import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-key',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'demo-app-id',
};

// Only log configuration status if Firebase is not configured
if (!isFirebaseConfigured()) {
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey !== 'demo-key' ? '✓ Set' : '✗ Missing (using demo values)',
    projectId: firebaseConfig.projectId !== 'demo-project' ? '✓ Set' : '✗ Missing (using demo values)',
    appId: firebaseConfig.appId !== 'demo-app-id' ? '✓ Set' : '✗ Missing (using demo values)',
    note: 'Configure Firebase environment variables to enable authentication'
  });
}

let app: any = null;
let auth: any = null;
let provider: GoogleAuthProvider | null = null;

// Only initialize Firebase if properly configured
if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export const signInWithGoogle = async () => {
  if (!isFirebaseConfigured() || !auth || !provider) {
    throw new Error('Firebase authentication is not configured. Please set up Firebase environment variables.');
  }
  
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Google sign-in successful:', result.user.email);
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const handleRedirectResult = () => {
  // No longer needed with popup, but keeping for compatibility
  return Promise.resolve(null);
};

export const signOutUser = () => {
  if (!auth) {
    return Promise.resolve();
  }
  return signOut(auth);
};

export { auth, isFirebaseConfigured };
