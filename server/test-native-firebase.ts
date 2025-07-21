// Test native Firebase client instead of Admin SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

async function testNativeFirestore() {
  try {
    console.log('🔥 Testing native Firebase client...');
    console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Try to create a document
    console.log('📝 Creating test document...');
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello from native Firebase!',
      timestamp: new Date(),
      source: 'native-client'
    });
    
    console.log('✅ Document created with ID:', docRef.id);
    
    // Try to read documents
    console.log('📖 Reading documents...');
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Found', querySnapshot.size, 'documents');
    
    querySnapshot.forEach((doc) => {
      console.log('Document:', doc.id, '=>', doc.data());
    });
    
    return { success: true, message: 'Native Firebase is working!' };
  } catch (error) {
    console.error('❌ Native Firebase test failed:', error);
    return { success: false, error: error.message };
  }
}

testNativeFirestore().then(result => {
  console.log('Final result:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});