import { adminDb } from './firebase-admin-ncert';

export async function initializeFirestoreDatabase() {
  try {
    console.log('🔥 Initializing Firestore database structure...');
    
    // Create initial collections with a single document to establish the database
    const collections = [
      'ncert_textbooks',
      'ncert_chapters', 
      'scraping_logs',
      'users',
      'agent_configs',
      'chat_sessions',
      'chat_messages',
      'generated_content'
    ];
    
    for (const collectionName of collections) {
      try {
        // Check if collection exists by trying to get it
        const snapshot = await adminDb.collection(collectionName).limit(1).get();
        
        if (snapshot.empty) {
          // Create initial document to establish collection
          const initDoc = {
            _init: true,
            createdAt: new Date(),
            description: `Initial document for ${collectionName} collection`
          };
          
          await adminDb.collection(collectionName).doc('_init').set(initDoc);
          console.log(`✓ Created collection: ${collectionName}`);
        } else {
          console.log(`✓ Collection exists: ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️  Error checking collection ${collectionName}:`, error.message);
      }
    }
    
    console.log('🎉 Firestore database initialization completed');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize Firestore database:', error);
    return false;
  }
}

export async function ensureFirestoreConnection() {
  try {
    // Try to create a simple test document to establish the database
    const testDocRef = adminDb.collection('_health_check').doc('test');
    await testDocRef.set({
      status: 'connected',
      timestamp: new Date(),
      message: 'Database connection established'
    });
    
    console.log('🔥 Firestore connection verified and database created');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error);
    
    // If it's a database not found error, try to create collections
    if (error.code === 5 && error.details === '') {
      console.log('🔧 Database not found, attempting to create collections...');
      try {
        // Force create collections by writing documents
        const collections = ['ncert_textbooks', 'scraping_logs', 'users'];
        for (const collectionName of collections) {
          await adminDb.collection(collectionName).doc('_init').set({
            _initialized: true,
            createdAt: new Date(),
            description: `Initial document for ${collectionName} collection`
          });
          console.log(`✓ Created collection: ${collectionName}`);
        }
        return true;
      } catch (createError) {
        console.error('❌ Failed to create database:', createError);
        return false;
      }
    }
    
    return false;
  }
}