// Import Firebase storage as primary storage
import { firebaseStorage } from './firebase-storage';
import type { 
  User, 
  AgentConfiguration, 
  ChatSession, 
  ChatMessage, 
  GeneratedContent, 
  NCERTTextbook, 
  NCERTChapter, 
  NCERTTopic 
} from './firebase-storage';

export interface IStorage {
  // User management
  createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | null>;
  getUserById(userId: string): Promise<User | null>;
  
  // Agent configurations
  createAgentConfiguration(config: Omit<AgentConfiguration, 'id' | 'createdAt'>): Promise<AgentConfiguration>;
  getAgentConfigurations(userId: string): Promise<AgentConfiguration[]>;
  updateAgentConfiguration(id: string, updates: Partial<AgentConfiguration>): Promise<void>;
  
  // Chat sessions
  createChatSession(session: Omit<ChatSession, 'id' | 'createdAt'>): Promise<ChatSession>;
  getChatSessions(userId: string): Promise<ChatSession[]>;
  
  // Chat messages
  createChatMessage(message: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // Generated content
  createGeneratedContent(content: Omit<GeneratedContent, 'id' | 'createdAt'>): Promise<GeneratedContent>;
  getGeneratedContent(userId: string, agentType?: string): Promise<GeneratedContent[]>;
  
  // NCERT Textbooks
  createNCERTTextbook(textbook: Omit<NCERTTextbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<NCERTTextbook>;
  getNCERTTextbooks(classLevel?: number, subject?: string): Promise<NCERTTextbook[]>;
  updateNCERTTextbook(id: string, updates: Partial<NCERTTextbook>): Promise<void>;
  
  // NCERT Chapters
  createNCERTChapter(chapter: Omit<NCERTChapter, 'id' | 'createdAt'>): Promise<NCERTChapter>;
  getNCERTChapters(textbookId: string): Promise<NCERTChapter[]>;
  
  // NCERT Topics
  createNCERTTopic(topic: Omit<NCERTTopic, 'id' | 'createdAt'>): Promise<NCERTTopic>;
  getNCERTTopics(chapterId: string): Promise<NCERTTopic[]>;
  
  // Search functionality
  searchNCERTContent(query: string, classLevel?: number): Promise<{
    textbooks: NCERTTextbook[];
    chapters: NCERTChapter[];
    topics: NCERTTopic[];
  }>;

  // Initialize demo data
  initializeDemoData?(): Promise<void>;
}

// Legacy MemStorage class kept for reference but not used
export class MemStorage {
  // Implementation preserved for fallback scenarios
}

// Use Firebase storage as the primary storage
export const storage = firebaseStorage;
