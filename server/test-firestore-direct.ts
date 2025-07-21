import { adminDb } from './firebase-admin-ncert';

async function testFirestoreConnection() {
  try {
    console.log('🔥 Testing direct Firestore connection...');
    
    // Try to create a simple document
    const testRef = adminDb.collection('test').doc('init');
    
    await testRef.set({
      message: 'Hello Firestore!',
      timestamp: new Date(),
      initialized: true
    });
    
    console.log('✅ Document created successfully');
    
    // Try to read it back
    const doc = await testRef.get();
    if (doc.exists) {
      console.log('✅ Document retrieved successfully:', doc.data());
      
      // Now try NCERT collection
      const ncertRef = adminDb.collection('ncert_textbooks').doc('test-book');
      await ncertRef.set({
        class: 1,
        subject: 'Mathematics',
        bookTitle: 'Test Book',
        language: 'English',
        pdfUrl: 'https://example.com/test.pdf',
        contentExtracted: false,
        chapterCount: 0,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ NCERT test document created successfully');
      
      return { success: true, message: 'Firestore is working!' };
    } else {
      throw new Error('Document was not found after creation');
    }
  } catch (error) {
    console.error('❌ Firestore test failed:', error);
    return { success: false, error: error.message };
  }
}

testFirestoreConnection().then(result => {
  console.log('Final result:', result);
  process.exit(result.success ? 0 : 1);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});