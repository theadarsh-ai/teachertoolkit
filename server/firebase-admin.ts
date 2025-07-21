import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// NCERT Textbook Collections
export const COLLECTIONS = {
  TEXTBOOKS: 'ncert_textbooks',
  CHAPTERS: 'ncert_chapters',
  TOPICS: 'ncert_topics',
  SCRAPING_LOGS: 'scraping_logs'
} as const;

// Firestore Data Types
export interface NCERTTextbook {
  id?: string;
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  downloadedAt?: Date;
  contentExtracted: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NCERTChapter {
  id?: string;
  textbookId: string;
  chapterNumber: number;
  chapterTitle: string;
  content?: string;
  pageStart?: number;
  pageEnd?: number;
  topics?: string[];
  keywords?: string[];
  learningObjectives?: string[];
  createdAt: Date;
}

export interface NCERTTopic {
  id?: string;
  chapterId: string;
  topicTitle: string;
  content: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  concepts?: string[];
  examples?: string[];
  exercises?: string[];
  createdAt: Date;
}

export interface ScrapingLog {
  id?: string;
  action: string;
  status: 'started' | 'completed' | 'error';
  message: string;
  data?: any;
  timestamp: Date;
}