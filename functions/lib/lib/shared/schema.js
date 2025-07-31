import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name").notNull(),
    firebaseUid: text("firebase_uid").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const agentConfigurations = pgTable("agent_configurations", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    agentType: text("agent_type").notNull(),
    grades: jsonb("grades").$type().notNull(),
    contentSource: text("content_source").notNull(), // 'prebook' or 'external'
    languages: jsonb("languages").$type(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const chatSessions = pgTable("chat_sessions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    sessionName: text("session_name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const chatMessages = pgTable("chat_messages", {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").references(() => chatSessions.id).notNull(),
    role: text("role").notNull(), // 'user' or 'assistant' or 'system'
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const generatedContent = pgTable("generated_content", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    agentType: text("agent_type").notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// Knowledge Base Q&A History Schema
export const knowledgeBaseHistory = pgTable("knowledge_base_history", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    question: text("question").notNull(),
    answer: text("answer").notNull(),
    explanation: text("explanation").notNull(), // Detailed step-by-step explanation
    grade: integer("grade").notNull(),
    subject: text("subject").notNull(),
    language: text("language").notNull(),
    confidence: integer("confidence").notNull(), // 1-100 confidence score
    sources: jsonb("sources").$type().notNull(),
    analogies: jsonb("analogies").$type().notNull(),
    followUpQuestions: jsonb("follow_up_questions").$type().notNull(),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
// NCERT Textbooks Database Schema
export const ncertTextbooks = pgTable("ncert_textbooks", {
    id: serial("id").primaryKey(),
    class: integer("class").notNull(), // 1-12
    subject: text("subject").notNull(),
    bookTitle: text("book_title").notNull(),
    language: text("language").notNull(), // Hindi, English, Urdu
    pdfUrl: text("pdf_url").notNull(),
    downloadedAt: timestamp("downloaded_at"),
    contentExtracted: boolean("content_extracted").default(false).notNull(),
    metadata: jsonb("metadata").$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const ncertChapters = pgTable("ncert_chapters", {
    id: serial("id").primaryKey(),
    textbookId: integer("textbook_id").references(() => ncertTextbooks.id).notNull(),
    chapterNumber: integer("chapter_number").notNull(),
    chapterTitle: text("chapter_title").notNull(),
    content: text("content"), // Extracted text content
    pageStart: integer("page_start"),
    pageEnd: integer("page_end"),
    topics: jsonb("topics").$type(),
    keywords: jsonb("keywords").$type(),
    learningObjectives: jsonb("learning_objectives").$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const ncertTopics = pgTable("ncert_topics", {
    id: serial("id").primaryKey(),
    chapterId: integer("chapter_id").references(() => ncertChapters.id).notNull(),
    topicTitle: text("topic_title").notNull(),
    content: text("content").notNull(),
    difficulty: text("difficulty").notNull(), // basic, intermediate, advanced
    concepts: jsonb("concepts").$type(),
    examples: jsonb("examples").$type(),
    exercises: jsonb("exercises").$type(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const insertUserSchema = createInsertSchema(users).pick({
    email: true,
    name: true,
    firebaseUid: true,
});
export const insertAgentConfigSchema = createInsertSchema(agentConfigurations).pick({
    userId: true,
    agentType: true,
    grades: true,
    contentSource: true,
    languages: true,
});
export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
    userId: true,
    sessionName: true,
});
export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
    sessionId: true,
    role: true,
    content: true,
    metadata: true,
});
export const insertGeneratedContentSchema = createInsertSchema(generatedContent).pick({
    userId: true,
    agentType: true,
    title: true,
    content: true,
    metadata: true,
});
export const insertNCERTTextbookSchema = createInsertSchema(ncertTextbooks).pick({
    class: true,
    subject: true,
    bookTitle: true,
    language: true,
    pdfUrl: true,
    downloadedAt: true,
    contentExtracted: true,
    metadata: true,
});
export const insertNCERTChapterSchema = createInsertSchema(ncertChapters).pick({
    textbookId: true,
    chapterNumber: true,
    chapterTitle: true,
    content: true,
    pageStart: true,
    pageEnd: true,
    topics: true,
    keywords: true,
    learningObjectives: true,
});
export const insertNCERTTopicSchema = createInsertSchema(ncertTopics).pick({
    chapterId: true,
    topicTitle: true,
    content: true,
    difficulty: true,
    concepts: true,
    examples: true,
    exercises: true,
});
export const insertKnowledgeBaseHistorySchema = createInsertSchema(knowledgeBaseHistory).pick({
    userId: true,
    question: true,
    answer: true,
    explanation: true,
    grade: true,
    subject: true,
    language: true,
    confidence: true,
    sources: true,
    analogies: true,
    followUpQuestions: true,
    metadata: true,
});
//# sourceMappingURL=schema.js.map