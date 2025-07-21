import { 
  users, 
  agentConfigurations, 
  chatSessions, 
  chatMessages, 
  generatedContent,
  type User, 
  type InsertUser,
  type AgentConfiguration,
  type InsertAgentConfiguration,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type GeneratedContent,
  type InsertGeneratedContent
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Agent configuration operations
  getAgentConfigurations(userId: number): Promise<AgentConfiguration[]>;
  createAgentConfiguration(config: InsertAgentConfiguration): Promise<AgentConfiguration>;
  updateAgentConfiguration(id: number, config: Partial<AgentConfiguration>): Promise<AgentConfiguration>;
  
  // Chat operations
  getChatSessions(userId: number): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Generated content operations
  getGeneratedContent(userId: number, agentType?: string): Promise<GeneratedContent[]>;
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  
  // NCERT textbook operations
  getNCERTTextbooks(): Promise<any[]>;
  getNCERTTextbooksByClass(classNum: number): Promise<any[]>;
  getNCERTTextbooksBySubject(subject: string): Promise<any[]>;
  storeNCERTTextbook(textbook: any): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agentConfigurations: Map<number, AgentConfiguration>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  private generatedContent: Map<number, GeneratedContent>;
  private currentUserId: number;
  private currentConfigId: number;
  private currentSessionId: number;
  private currentMessageId: number;
  private currentContentId: number;

  constructor() {
    this.users = new Map();
    this.agentConfigurations = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.generatedContent = new Map();
    this.currentUserId = 1;
    this.currentConfigId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    this.currentContentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getAgentConfigurations(userId: number): Promise<AgentConfiguration[]> {
    return Array.from(this.agentConfigurations.values()).filter(config => config.userId === userId);
  }

  async createAgentConfiguration(insertConfig: InsertAgentConfiguration): Promise<AgentConfiguration> {
    const id = this.currentConfigId++;
    const config: AgentConfiguration = { 
      id,
      userId: insertConfig.userId,
      agentType: insertConfig.agentType,
      grades: insertConfig.grades as number[],
      contentSource: insertConfig.contentSource,
      languages: insertConfig.languages as string[] | null,
      isActive: true,
      createdAt: new Date() 
    };
    this.agentConfigurations.set(id, config);
    return config;
  }

  async updateAgentConfiguration(id: number, updateData: Partial<AgentConfiguration>): Promise<AgentConfiguration> {
    const existing = this.agentConfigurations.get(id);
    if (!existing) {
      throw new Error('Configuration not found');
    }
    const updated = { ...existing, ...updateData };
    this.agentConfigurations.set(id, updated);
    return updated;
  }

  async getChatSessions(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(session => session.userId === userId);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const session: ChatSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date() 
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(message => message.sessionId === sessionId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      metadata: insertMessage.metadata || null,
      createdAt: new Date() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getGeneratedContent(userId: number, agentType?: string): Promise<GeneratedContent[]> {
    let results = Array.from(this.generatedContent.values()).filter(content => content.userId === userId);
    if (agentType) {
      results = results.filter(content => content.agentType === agentType);
    }
    return results;
  }

  async createGeneratedContent(insertContent: InsertGeneratedContent): Promise<GeneratedContent> {
    const id = this.currentContentId++;
    const content: GeneratedContent = { 
      ...insertContent, 
      id, 
      metadata: insertContent.metadata || null,
      createdAt: new Date() 
    };
    this.generatedContent.set(id, content);
    return content;
  }
}

export const storage = new MemStorage();
