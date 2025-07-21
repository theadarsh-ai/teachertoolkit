import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with environment variables if not already initialized
let adminApp;
try {
  adminApp = getApp();
} catch {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
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
      // Create a unique ID based on class, subject, and language to prevent duplicates
      const docId = `${textbook.class}_${textbook.subject.replace(/\s+/g, '_')}_${textbook.language}`;
      
      const docRef = adminDb.collection(COLLECTIONS.NCERT_TEXTBOOKS).doc(docId);
      
      // Check if document already exists
      const existingDoc = await docRef.get();
      if (existingDoc.exists) {
        console.log(`• Duplicate: Class ${textbook.class} ${textbook.subject} (${textbook.language})`);
        return { id: docId, ...existingDoc.data() } as NCERTTextbook;
      }

      const now = new Date();
      const textbookData = {
        ...textbook,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(textbookData);
      console.log(`✓ Stored: Class ${textbook.class} ${textbook.subject} (${textbook.language})`);
      
      return { id: docId, ...textbookData };
    } catch (error) {
      console.error(`Error storing textbook: ${textbook.bookTitle}`, error);
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
      await adminDb.collection(COLLECTIONS.SCRAPING_LOGS).add({
        action,
        status,
        message,
        data,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log scraping activity:', error);
    }
  }
}

// Export singleton instance
export const firebaseNCERTStorage = new FirebaseNCERTStorage();