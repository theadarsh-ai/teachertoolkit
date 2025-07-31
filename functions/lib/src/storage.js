export class MemStorage {
    constructor() {
        this.users = new Map();
        this.agentConfigurations = new Map();
        this.chatSessions = new Map();
        this.chatMessages = new Map();
        this.generatedContent = new Map();
        this.ncertTextbooks = new Map();
        this.knowledgeBaseHistory = new Map();
        this.currentUserId = 1;
        this.currentConfigId = 1;
        this.currentSessionId = 1;
        this.currentMessageId = 1;
        this.currentContentId = 1;
        this.currentTextbookId = 1;
        this.currentKnowledgeHistoryId = 1;
    }
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByFirebaseUid(firebaseUid) {
        return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
    }
    async createUser(insertUser) {
        const id = this.currentUserId++;
        const user = {
            ...insertUser,
            id,
            createdAt: new Date()
        };
        this.users.set(id, user);
        return user;
    }
    async getAgentConfigurations(userId) {
        return Array.from(this.agentConfigurations.values()).filter(config => config.userId === userId);
    }
    async createAgentConfiguration(insertConfig) {
        const id = this.currentConfigId++;
        const config = {
            id,
            userId: insertConfig.userId,
            agentType: insertConfig.agentType,
            grades: insertConfig.grades,
            contentSource: insertConfig.contentSource,
            languages: insertConfig.languages,
            isActive: true,
            createdAt: new Date()
        };
        this.agentConfigurations.set(id, config);
        return config;
    }
    async updateAgentConfiguration(id, updateData) {
        const existing = this.agentConfigurations.get(id);
        if (!existing) {
            throw new Error('Configuration not found');
        }
        const updated = { ...existing, ...updateData };
        this.agentConfigurations.set(id, updated);
        return updated;
    }
    async getChatSessions(userId) {
        return Array.from(this.chatSessions.values()).filter(session => session.userId === userId);
    }
    async createChatSession(insertSession) {
        const id = this.currentSessionId++;
        const session = {
            ...insertSession,
            id,
            createdAt: new Date()
        };
        this.chatSessions.set(id, session);
        return session;
    }
    async getChatMessages(sessionId) {
        return Array.from(this.chatMessages.values()).filter(message => message.sessionId === sessionId);
    }
    async createChatMessage(insertMessage) {
        const id = this.currentMessageId++;
        const message = {
            ...insertMessage,
            id,
            metadata: insertMessage.metadata || null,
            createdAt: new Date()
        };
        this.chatMessages.set(id, message);
        return message;
    }
    async getGeneratedContent(userId, agentType) {
        let results = Array.from(this.generatedContent.values()).filter(content => content.userId === userId);
        if (agentType) {
            results = results.filter(content => content.agentType === agentType);
        }
        return results;
    }
    async createGeneratedContent(insertContent) {
        const id = this.currentContentId++;
        const content = {
            ...insertContent,
            id,
            metadata: insertContent.metadata || null,
            createdAt: new Date()
        };
        this.generatedContent.set(id, content);
        return content;
    }
    // NCERT Textbook operations
    async getAllNCERTTextbooks() {
        return Array.from(this.ncertTextbooks.values());
    }
    async getNCERTTextbooks() {
        return Array.from(this.ncertTextbooks.values());
    }
    async getNCERTTextbooksByClass(classNum) {
        return Array.from(this.ncertTextbooks.values()).filter(textbook => textbook.class === classNum);
    }
    async getNCERTTextbooksBySubject(subject) {
        return Array.from(this.ncertTextbooks.values()).filter(textbook => textbook.subject === subject);
    }
    async storeNCERTTextbook(textbook) {
        const id = this.currentTextbookId++;
        const storedTextbook = {
            ...textbook,
            id,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.ncertTextbooks.set(id, storedTextbook);
        return storedTextbook;
    }
    // Knowledge Base History operations
    async createKnowledgeBaseHistory(insertHistory) {
        const id = this.currentKnowledgeHistoryId++;
        const history = {
            ...insertHistory,
            id,
            metadata: insertHistory.metadata || null,
            createdAt: new Date()
        };
        this.knowledgeBaseHistory.set(id, history);
        return history;
    }
    async getKnowledgeBaseHistoryByUser(userId, limit = 50) {
        const userHistory = Array.from(this.knowledgeBaseHistory.values())
            .filter(history => history.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
        return userHistory;
    }
    async searchKnowledgeBaseHistory(userId, query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.knowledgeBaseHistory.values())
            .filter(history => history.userId === userId &&
            (history.question.toLowerCase().includes(searchTerm) ||
                history.answer.toLowerCase().includes(searchTerm) ||
                history.explanation.toLowerCase().includes(searchTerm)))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
}
export const storage = new MemStorage();
//# sourceMappingURL=storage.js.map