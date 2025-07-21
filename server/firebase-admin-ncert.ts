import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with environment variables if not already initialized
let adminApp;
try {
  adminApp = getApp();
} catch {
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

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error);
    console.log('Private key format issue. The FIREBASE_PRIVATE_KEY should include the full PEM format including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY----- lines.');
    throw new Error('Firebase Admin credentials are invalid. Please ensure FIREBASE_PRIVATE_KEY is in proper PEM format.');
  }
}

export const adminDb = getFirestore(adminApp);

// NCERT Textbook interface for Firebase
export interface NCERTTextbook {
  id?: string;
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  contentExtracted: boolean;
  chapterCount?: number;
  metadata: Record<string, any>;
  createdAt: any;
  updatedAt: any;
}

// NCERT Collection names
export const COLLECTIONS = {
  NCERT_TEXTBOOKS: 'ncert_textbooks',
  NCERT_CHAPTERS: 'ncert_chapters',
  SCRAPING_LOGS: 'scraping_logs'
};

export class FirebaseNCERTStorage {
  
  async getAllTextbooks(): Promise<NCERTTextbook[]> {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.NCERT_TEXTBOOKS).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NCERTTextbook[];
    } catch (error) {
      console.error("Error fetching NCERT textbooks from Firebase:", error);
      // If database doesn't exist, return empty array instead of failing
      if (error.code === 5 && error.details === '') {
        console.log("Firestore collection doesn't exist yet, returning empty array");
        console.log("Please create the Firestore database in Firebase Console:");
        console.log("https://console.firebase.google.com/project/genzion-ai/firestore");
        return [];
      }
      return [];
    }
  }

  async getTextbooksByClass(classNum: number): Promise<NCERTTextbook[]> {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.NCERT_TEXTBOOKS)
        .where('class', '==', classNum)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NCERTTextbook[];
    } catch (error) {
      console.error(`Error fetching textbooks for class ${classNum}:`, error);
      return [];
    }
  }

  async getTextbooksBySubject(subject: string): Promise<NCERTTextbook[]> {
    try {
      const snapshot = await adminDb
        .collection(COLLECTIONS.NCERT_TEXTBOOKS)
        .where('subject', '==', subject)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NCERTTextbook[];
    } catch (error) {
      console.error(`Error fetching textbooks for subject ${subject}:`, error);
      return [];
    }
  }

  async storeTextbook(textbook: Omit<NCERTTextbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<NCERTTextbook | null> {
    try {
      // Clean the textbook data to remove any undefined values
      const cleanTextbook = Object.fromEntries(
        Object.entries(textbook).filter(([_, v]) => v !== undefined && v !== null)
      );
      
      // Create a unique ID based on class, subject, and language to prevent duplicates
      const docId = `${cleanTextbook.class}_${(cleanTextbook.subject as string).replace(/\s+/g, '_')}_${cleanTextbook.language}`;
      
      const docRef = adminDb.collection(COLLECTIONS.NCERT_TEXTBOOKS).doc(docId);
      
      // Check if document already exists
      const existingDoc = await docRef.get();
      if (existingDoc.exists) {
        console.log(`• Duplicate: Class ${cleanTextbook.class} ${cleanTextbook.subject} (${cleanTextbook.language})`);
        return { id: docId, ...existingDoc.data() } as NCERTTextbook;
      }

      const now = new Date();
      const textbookData = {
        ...cleanTextbook,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(textbookData);
      console.log(`✓ Stored: Class ${cleanTextbook.class} ${cleanTextbook.subject} (${cleanTextbook.language})`);
      
      return { id: docId, ...textbookData } as NCERTTextbook;
    } catch (error) {
      console.error(`Error storing textbook: ${(textbook as any).bookTitle}`, error);
      return null;
    }
  }

  async updateTextbook(id: string, updates: Partial<NCERTTextbook>): Promise<NCERTTextbook | null> {
    try {
      const docRef = adminDb.collection(COLLECTIONS.NCERT_TEXTBOOKS).doc(id);
      
      await docRef.update({
        ...updates,
        updatedAt: new Date(),
      });
      
      const updated = await docRef.get();
      return { id, ...updated.data() } as NCERTTextbook;
    } catch (error) {
      console.error(`Error updating textbook ${id}:`, error);
      return null;
    }
  }

  async getTextbookCount(): Promise<number> {
    try {
      const snapshot = await adminDb.collection(COLLECTIONS.NCERT_TEXTBOOKS).get();
      return snapshot.size;
    } catch (error) {
      console.error("Error counting textbooks:", error);
      return 0;
    }
  }

  async clearAllTextbooks(): Promise<boolean> {
    try {
      const batch = adminDb.batch();
      const snapshot = await adminDb.collection(COLLECTIONS.NCERT_TEXTBOOKS).get();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log("✓ Cleared all NCERT textbooks from Firebase");
      return true;
    } catch (error) {
      console.error("Error clearing textbooks:", error);
      return false;
    }
  }

  async logScrapingActivity(action: string, status: string, message: string, data?: any) {
    try {
      // Temporarily disabled logging to avoid undefined value issues
      console.log(`📋 Log: ${action} - ${status} - ${message}`);
    } catch (error) {
      console.error('Failed to log scraping activity:', error);
    }
  }
}

// Export singleton instance
export const firebaseNCERTStorage = new FirebaseNCERTStorage();