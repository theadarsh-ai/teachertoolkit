// Direct test to create Firestore database without going through collections
import { adminDb } from './firebase-admin-ncert';

async function createFirestoreDatabase() {
  try {
    console.log('🔥 Testing direct Firestore database creation...');
    
    // Try to write a single document to force database creation
    const testRef = adminDb.collection('test').doc('init');
    await testRef.set({
      message: 'Database created successfully',
      timestamp: new Date(),
      purpose: 'Force database creation'
    });
    
    console.log('✅ Database created! Now creating NCERT collection...');
    
    // Create NCERT textbooks collection
    const ncertRef = adminDb.collection('ncert_textbooks').doc('_init');
    await ncertRef.set({
      _initialized: true,
      createdAt: new Date(),
      description: 'NCERT textbooks collection initialized'
    });
    
    console.log('✅ NCERT collection created!');
    
    // Clean up test document
    await testRef.delete();
    console.log('✅ Test document cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Database creation failed:', error);
    console.log('');
    console.log('🚨 MANUAL SETUP REQUIRED:');
    console.log('1. Visit: https://console.firebase.google.com/project/genzion-ai/firestore');
    console.log('2. Click "Create database"');
    console.log('3. Choose "Start in test mode"');
    console.log('4. Select location (e.g., us-central1)');
    console.log('5. Click "Done"');
    console.log('6. Then run the scraping process');
    return false;
  }
}

// Export for use in routes
export { createFirestoreDatabase };