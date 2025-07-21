// Firebase Realtime Database setup using existing admin credentials
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin for Realtime Database (reuse existing setup)
let adminApp: any;
let adminDatabase: any;

// Try to get existing app first
try {
  adminApp = getApp();
  console.log('🔄 Using existing Firebase Admin app');
} catch {
  // If no existing app, create new one
  try {
    // Parse and format the private key properly for Replit Secrets
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    
    // Replit Secrets often store keys with literal \n characters that need conversion
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // Remove any surrounding quotes
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    
    // Ensure proper PEM format
    if (!privateKey.startsWith('-----BEGIN') && !privateKey.startsWith('-----END')) {
      // If it's just the base64 content, wrap it
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

    console.log('🔧 Initializing Firebase with project:', process.env.FIREBASE_PROJECT_ID);
    
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    throw new Error('Firebase Admin credentials are invalid. Please ensure FIREBASE_PRIVATE_KEY is in proper PEM format.');
  }
}

// Initialize Realtime Database
adminDatabase = getDatabase(adminApp);
console.log('🔥 Firebase Realtime Database initialized successfully');

export { adminDatabase };

// NCERT Textbook interface for Firebase Realtime Database
export interface NCERTTextbook {
  id?: string;
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  contentExtracted: boolean;
  chapters?: NCERTChapter[];
  chapterCount: number;
  metadata: {
    totalPages?: number;
    fileSize?: number;
    lastUpdated?: string;
    extractionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  };
  createdAt: string;
  updatedAt: string;
}

export interface NCERTChapter {
  chapterNumber: number;
  title: string;
  content: string;
  pageStart?: number;
  pageEnd?: number;
  exercises?: NCERTExercise[];
}

export interface NCERTExercise {
  exerciseNumber: string;
  questions: NCERTQuestion[];
}

export interface NCERTQuestion {
  questionNumber: string;
  questionText: string;
  questionType: 'mcq' | 'short' | 'long' | 'numerical' | 'diagram';
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  answer?: string;
}

// Firebase Realtime Database Storage Implementation
export class FirebaseRealtimeNCERTStorage {
  private dbRef = adminDatabase.ref('ncert_textbooks');

  async storeTextbook(textbook: NCERTTextbook): Promise<string> {
    try {
      console.log(`📚 Storing textbook: Class ${textbook.class} - ${textbook.subject} (${textbook.language})`);
      
      const textbookData = {
        ...textbook,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use a compound key for better organization
      const key = `class_${textbook.class}/${textbook.subject.toLowerCase().replace(/\s+/g, '_')}/${textbook.language.toLowerCase()}`;
      
      await this.dbRef.child(key).set(textbookData);
      
      console.log(`✅ Textbook stored successfully with key: ${key}`);
      return key;
    } catch (error) {
      console.error('❌ Error storing textbook:', error);
      throw new Error(`Failed to store textbook: ${error.message}`);
    }
  }

  async getAllTextbooks(): Promise<NCERTTextbook[]> {
    try {
      console.log('📖 Fetching all textbooks from Firebase Realtime Database...');
      
      const snapshot = await this.dbRef.once('value');
      const data = snapshot.val();
      
      if (!data) {
        console.log('📚 No textbooks found in database');
        return [];
      }

      // Convert nested object structure to flat array
      const textbooks: NCERTTextbook[] = [];
      
      Object.keys(data).forEach(classKey => {
        Object.keys(data[classKey]).forEach(subjectKey => {
          Object.keys(data[classKey][subjectKey]).forEach(languageKey => {
            const textbook = data[classKey][subjectKey][languageKey];
            textbook.id = `${classKey}/${subjectKey}/${languageKey}`;
            textbooks.push(textbook);
          });
        });
      });

      console.log(`✅ Retrieved ${textbooks.length} textbooks from Firebase Realtime Database`);
      return textbooks;
    } catch (error) {
      console.error('❌ Error fetching textbooks:', error);
      throw new Error(`Failed to fetch textbooks: ${error.message}`);
    }
  }

  async getTextbooksByClass(classNumber: number): Promise<NCERTTextbook[]> {
    try {
      const snapshot = await this.dbRef.child(`class_${classNumber}`).once('value');
      const data = snapshot.val();
      
      if (!data) {
        return [];
      }

      const textbooks: NCERTTextbook[] = [];
      Object.keys(data).forEach(subjectKey => {
        Object.keys(data[subjectKey]).forEach(languageKey => {
          const textbook = data[subjectKey][languageKey];
          textbook.id = `class_${classNumber}/${subjectKey}/${languageKey}`;
          textbooks.push(textbook);
        });
      });

      return textbooks;
    } catch (error) {
      console.error('❌ Error fetching textbooks by class:', error);
      throw new Error(`Failed to fetch textbooks for class ${classNumber}: ${error.message}`);
    }
  }

  async updateTextbook(id: string, updates: Partial<NCERTTextbook>): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await this.dbRef.child(id).update(updateData);
      console.log(`✅ Textbook ${id} updated successfully`);
    } catch (error) {
      console.error('❌ Error updating textbook:', error);
      throw new Error(`Failed to update textbook: ${error.message}`);
    }
  }

  async deleteTextbook(id: string): Promise<void> {
    try {
      await this.dbRef.child(id).remove();
      console.log(`✅ Textbook ${id} deleted successfully`);
    } catch (error) {
      console.error('❌ Error deleting textbook:', error);
      throw new Error(`Failed to delete textbook: ${error.message}`);
    }
  }

  async searchTextbooks(query: {
    class?: number;
    subject?: string;
    language?: string;
    contentExtracted?: boolean;
  }): Promise<NCERTTextbook[]> {
    try {
      const allTextbooks = await this.getAllTextbooks();
      
      return allTextbooks.filter(textbook => {
        if (query.class && textbook.class !== query.class) return false;
        if (query.subject && !textbook.subject.toLowerCase().includes(query.subject.toLowerCase())) return false;
        if (query.language && !textbook.language.toLowerCase().includes(query.language.toLowerCase())) return false;
        if (query.contentExtracted !== undefined && textbook.contentExtracted !== query.contentExtracted) return false;
        return true;
      });
    } catch (error) {
      console.error('❌ Error searching textbooks:', error);
      throw new Error(`Failed to search textbooks: ${error.message}`);
    }
  }

  async initializeDatabase(): Promise<boolean> {
    try {
      console.log('🔥 Testing Firebase Realtime Database connection...');
      
      // Test write operation
      const testRef = adminDatabase.ref('test_connection');
      await testRef.set({
        message: 'Hello Firebase Realtime Database!',
        timestamp: new Date().toISOString(),
        initialized: true
      });
      
      console.log('✅ Test write successful');
      
      // Test read operation
      const snapshot = await testRef.once('value');
      const data = snapshot.val();
      
      if (data && data.message) {
        console.log('✅ Test read successful:', data.message);
        
        // Clean up test data
        await testRef.remove();
        console.log('✅ Test data cleaned up');
        
        return true;
      } else {
        throw new Error('Test read failed - no data received');
      }
    } catch (error) {
      console.error('❌ Firebase Realtime Database test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseRealtimeStorage = new FirebaseRealtimeNCERTStorage();