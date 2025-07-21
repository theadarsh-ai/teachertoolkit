import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore, Timestamp } from 'firebase-admin/firestore';
import { IStorage } from './storage';

// Initialize Firebase Admin SDK
let adminApp;
if (getApps().length === 0) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: "key_id",
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: "client_id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
  };

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);

// Firestore Collections
export const COLLECTIONS = {
  USERS: 'users',
  AGENT_CONFIGURATIONS: 'agent_configurations', 
  CHAT_SESSIONS: 'chat_sessions',
  CHAT_MESSAGES: 'chat_messages',
  GENERATED_CONTENT: 'generated_content',
  NCERT_TEXTBOOKS: 'ncert_textbooks',
  NCERT_CHAPTERS: 'ncert_chapters',
  NCERT_TOPICS: 'ncert_topics'
} as const;

// Type definitions matching PostgreSQL schema
export interface User {
  id?: string;
  email: string;
  name: string;
  firebaseUid: string;
  createdAt: Date;
}

export interface AgentConfiguration {
  id?: string;
  userId: string;
  agentType: string;
  grades: number[];
  contentSource: string;
  languages?: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface ChatSession {
  id?: string;
  userId: string;
  sessionName: string;
  createdAt: Date;
}

export interface ChatMessage {
  id?: string;
  sessionId: string;
  role: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface GeneratedContent {
  id?: string;
  userId: string;
  agentType: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface NCERTTextbook {
  id?: string;
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  downloadedAt?: Date;
  contentExtracted: boolean;
  metadata?: Record<string, any>;
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
  difficulty: string;
  concepts?: string[];
  examples?: string[];
  exercises?: string[];
  createdAt: Date;
}

// Firebase Storage Implementation
export class FirebaseStorage implements IStorage {
  private db: Firestore;

  constructor() {
    this.db = adminDb;
  }

  // Helper to convert Firestore timestamp to Date
  private convertTimestamp(data: any): any {
    if (data && typeof data === 'object') {
      for (const key in data) {
        if (data[key] instanceof Timestamp) {
          data[key] = data[key].toDate();
        } else if (typeof data[key] === 'object') {
          data[key] = this.convertTimestamp(data[key]);
        }
      }
    }
    return data;
  }

  // User management
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const docRef = this.db.collection(COLLECTIONS.USERS).doc();
    const user: User = {
      ...userData,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(user);
    return user;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const snapshot = await this.db.collection(COLLECTIONS.USERS)
      .where('firebaseUid', '==', firebaseUid)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return this.convertTimestamp({ id: doc.id, ...doc.data() } as User);
  }

  async getUserById(userId: string): Promise<User | null> {
    const doc = await this.db.collection(COLLECTIONS.USERS).doc(userId).get();
    if (!doc.exists) return null;
    return this.convertTimestamp({ id: doc.id, ...doc.data() } as User);
  }

  // Agent configurations
  async createAgentConfiguration(config: Omit<AgentConfiguration, 'id' | 'createdAt'>): Promise<AgentConfiguration> {
    const docRef = this.db.collection(COLLECTIONS.AGENT_CONFIGURATIONS).doc();
    const agentConfig: AgentConfiguration = {
      ...config,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(agentConfig);
    return agentConfig;
  }

  async getAgentConfigurations(userId: string): Promise<AgentConfiguration[]> {
    const snapshot = await this.db.collection(COLLECTIONS.AGENT_CONFIGURATIONS)
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as AgentConfiguration)
    );
  }

  async updateAgentConfiguration(id: string, updates: Partial<AgentConfiguration>): Promise<void> {
    await this.db.collection(COLLECTIONS.AGENT_CONFIGURATIONS).doc(id).update(updates);
  }

  // Chat sessions
  async createChatSession(session: Omit<ChatSession, 'id' | 'createdAt'>): Promise<ChatSession> {
    const docRef = this.db.collection(COLLECTIONS.CHAT_SESSIONS).doc();
    const chatSession: ChatSession = {
      ...session,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(chatSession);
    return chatSession;
  }

  async getChatSessions(userId: string): Promise<ChatSession[]> {
    const snapshot = await this.db.collection(COLLECTIONS.CHAT_SESSIONS)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as ChatSession)
    );
  }

  // Chat messages
  async createChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
    const docRef = this.db.collection(COLLECTIONS.CHAT_MESSAGES).doc();
    const chatMessage: ChatMessage = {
      ...message,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(chatMessage);
    return chatMessage;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    const snapshot = await this.db.collection(COLLECTIONS.CHAT_MESSAGES)
      .where('sessionId', '==', sessionId)
      .orderBy('createdAt', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as ChatMessage)
    );
  }

  // Generated content
  async createGeneratedContent(content: Omit<GeneratedContent, 'id' | 'createdAt'>): Promise<GeneratedContent> {
    const docRef = this.db.collection(COLLECTIONS.GENERATED_CONTENT).doc();
    const generatedContent: GeneratedContent = {
      ...content,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(generatedContent);
    return generatedContent;
  }

  async getGeneratedContent(userId: string, agentType?: string): Promise<GeneratedContent[]> {
    let query = this.db.collection(COLLECTIONS.GENERATED_CONTENT)
      .where('userId', '==', userId);
    
    if (agentType) {
      query = query.where('agentType', '==', agentType);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as GeneratedContent)
    );
  }

  // NCERT Textbooks
  async createNCERTTextbook(textbook: Omit<NCERTTextbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<NCERTTextbook> {
    const docRef = this.db.collection(COLLECTIONS.NCERT_TEXTBOOKS).doc();
    const ncertTextbook: NCERTTextbook = {
      ...textbook,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await docRef.set(ncertTextbook);
    return ncertTextbook;
  }

  async getNCERTTextbooks(classLevel?: number, subject?: string): Promise<NCERTTextbook[]> {
    let query = this.db.collection(COLLECTIONS.NCERT_TEXTBOOKS);
    
    if (classLevel) {
      query = query.where('class', '==', classLevel);
    }
    if (subject) {
      query = query.where('subject', '==', subject);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as NCERTTextbook)
    );
  }

  async updateNCERTTextbook(id: string, updates: Partial<NCERTTextbook>): Promise<void> {
    await this.db.collection(COLLECTIONS.NCERT_TEXTBOOKS).doc(id).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  // NCERT Chapters
  async createNCERTChapter(chapter: Omit<NCERTChapter, 'id' | 'createdAt'>): Promise<NCERTChapter> {
    const docRef = this.db.collection(COLLECTIONS.NCERT_CHAPTERS).doc();
    const ncertChapter: NCERTChapter = {
      ...chapter,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(ncertChapter);
    return ncertChapter;
  }

  async getNCERTChapters(textbookId: string): Promise<NCERTChapter[]> {
    const snapshot = await this.db.collection(COLLECTIONS.NCERT_CHAPTERS)
      .where('textbookId', '==', textbookId)
      .orderBy('chapterNumber', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as NCERTChapter)
    );
  }

  // NCERT Topics
  async createNCERTTopic(topic: Omit<NCERTTopic, 'id' | 'createdAt'>): Promise<NCERTTopic> {
    const docRef = this.db.collection(COLLECTIONS.NCERT_TOPICS).doc();
    const ncertTopic: NCERTTopic = {
      ...topic,
      id: docRef.id,
      createdAt: new Date()
    };
    await docRef.set(ncertTopic);
    return ncertTopic;
  }

  async getNCERTTopics(chapterId: string): Promise<NCERTTopic[]> {
    const snapshot = await this.db.collection(COLLECTIONS.NCERT_TOPICS)
      .where('chapterId', '==', chapterId)
      .orderBy('createdAt', 'asc')
      .get();
    
    return snapshot.docs.map(doc => 
      this.convertTimestamp({ id: doc.id, ...doc.data() } as NCERTTopic)
    );
  }

  // Search functionality
  async searchNCERTContent(query: string, classLevel?: number): Promise<{
    textbooks: NCERTTextbook[];
    chapters: NCERTChapter[];
    topics: NCERTTopic[];
  }> {
    // Note: Firestore doesn't support full-text search out of the box
    // For production, consider using Algolia or Elasticsearch integration
    const results = {
      textbooks: [] as NCERTTextbook[],
      chapters: [] as NCERTChapter[],
      topics: [] as NCERTTopic[]
    };

    // Simple keyword matching for textbooks
    let textbookQuery = this.db.collection(COLLECTIONS.NCERT_TEXTBOOKS);
    if (classLevel) {
      textbookQuery = textbookQuery.where('class', '==', classLevel);
    }
    
    const textbookSnapshot = await textbookQuery.get();
    results.textbooks = textbookSnapshot.docs
      .map(doc => this.convertTimestamp({ id: doc.id, ...doc.data() } as NCERTTextbook))
      .filter(book => 
        book.bookTitle.toLowerCase().includes(query.toLowerCase()) ||
        book.subject.toLowerCase().includes(query.toLowerCase())
      );

    return results;
  }

  // Initialize demo data
  async initializeDemoData(): Promise<void> {
    console.log('🔥 Initializing Firebase demo data...');
    
    // Create demo user
    try {
      const demoUser = await this.createUser({
        email: 'demo@eduai.com',
        name: 'Demo Teacher',
        firebaseUid: 'demo-firebase-uid'
      });
      console.log('✅ Demo user created:', demoUser.id);

      // Create sample NCERT textbooks
      const sampleBooks = [
        {
          class: 1,
          subject: 'Mathematics',
          bookTitle: 'Mathematics - Class 1',
          language: 'English',
          pdfUrl: 'https://ncert.nic.in/textbook/pdf/math1.pdf',
          contentExtracted: true,
          metadata: { chapters: 10, pages: 120 }
        },
        {
          class: 5,
          subject: 'Science',
          bookTitle: 'Looking Around - Class 5',
          language: 'English', 
          pdfUrl: 'https://ncert.nic.in/textbook/pdf/science5.pdf',
          contentExtracted: true,
          metadata: { chapters: 22, pages: 180 }
        },
        {
          class: 10,
          subject: 'Biology',
          bookTitle: 'Life Processes - Class 10',
          language: 'English',
          pdfUrl: 'https://ncert.nic.in/textbook/pdf/biology10.pdf', 
          contentExtracted: true,
          metadata: { chapters: 16, pages: 250 }
        }
      ];

      for (const book of sampleBooks) {
        const textbook = await this.createNCERTTextbook(book);
        console.log(`✅ Sample textbook created: ${textbook.bookTitle}`);
        
        // Add sample chapter
        const chapter = await this.createNCERTChapter({
          textbookId: textbook.id!,
          chapterNumber: 1,
          chapterTitle: 'Introduction',
          content: `Sample content for ${textbook.bookTitle} - Chapter 1`,
          pageStart: 1,
          pageEnd: 15,
          topics: ['Basic concepts', 'Learning objectives'],
          keywords: ['introduction', 'basics', 'foundation']
        });
        console.log(`✅ Sample chapter created: ${chapter.chapterTitle}`);
      }

      console.log('🎉 Firebase demo data initialization complete!');
    } catch (error) {
      console.error('❌ Demo data initialization failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const firebaseStorage = new FirebaseStorage();