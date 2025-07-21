import { adminDb, firebaseNCERTStorage } from './firebase-admin-ncert';

async function initializeFirestore() {
  try {
    console.log('🔥 Initializing Firestore database...');
    
    // Create a simple test document to initialize the database
    await adminDb.collection('_init').doc('test').set({
      initialized: true,
      timestamp: new Date(),
      message: 'Firestore database initialized successfully'
    });
    
    console.log('✅ Firestore database initialized successfully');
    
    // Now try to store a sample NCERT textbook
    const sampleBook = await firebaseNCERTStorage.storeTextbook({
      class: 1,
      subject: 'Mathematics',
      bookTitle: 'Mathematics - Class 1 (Test)',
      language: 'English',
      pdfUrl: 'https://ncert.nic.in/textbook/pdf/math1.pdf',
      contentExtracted: false,
      chapterCount: 0,
      metadata: { source: 'initialization_test' }
    });
    
    if (sampleBook) {
      console.log('✅ Sample textbook stored successfully');
      
      // Test retrieval
      const books = await firebaseNCERTStorage.getAllTextbooks();
      console.log(`📚 Retrieved ${books.length} textbooks from Firestore`);
      
      return { success: true, count: books.length };
    } else {
      throw new Error('Failed to store sample textbook');
    }
    
  } catch (error) {
    console.error('❌ Firestore initialization failed:', error);
    throw error;
  }
}

// Run initialization
initializeFirestore().then(result => {
  console.log('Firestore initialization result:', result);
  process.exit(0);
}).catch(error => {
  console.error('Initialization error:', error);
  process.exit(1);
});