import { db } from "./db";
import { ncertTextbooks, ncertChapters } from "../shared/schema";
import { eq } from "drizzle-orm";

export interface NCERTTextbook {
  id?: number;
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  contentExtracted: boolean;
  metadata: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export class NCERTStorage {
  
  async getAllTextbooks(): Promise<NCERTTextbook[]> {
    try {
      const textbooks = await db.select().from(ncertTextbooks);
      return textbooks;
    } catch (error) {
      console.error("Error fetching all NCERT textbooks:", error);
      return [];
    }
  }

  async getTextbooksByClass(classNum: number): Promise<NCERTTextbook[]> {
    try {
      const textbooks = await db
        .select()
        .from(ncertTextbooks)
        .where(eq(ncertTextbooks.class, classNum));
      return textbooks;
    } catch (error) {
      console.error(`Error fetching textbooks for class ${classNum}:`, error);
      return [];
    }
  }

  async getTextbooksBySubject(subject: string): Promise<NCERTTextbook[]> {
    try {
      const textbooks = await db
        .select()
        .from(ncertTextbooks)
        .where(eq(ncertTextbooks.subject, subject));
      return textbooks;
    } catch (error) {
      console.error(`Error fetching textbooks for subject ${subject}:`, error);
      return [];
    }
  }

  async storeTextbook(textbook: Omit<NCERTTextbook, 'id' | 'createdAt' | 'updatedAt'>): Promise<NCERTTextbook | null> {
    try {
      const [inserted] = await db
        .insert(ncertTextbooks)
        .values({
          class: textbook.class,
          subject: textbook.subject,
          bookTitle: textbook.bookTitle,
          language: textbook.language,
          pdfUrl: textbook.pdfUrl,
          contentExtracted: textbook.contentExtracted,
          metadata: textbook.metadata,
        })
        .returning();
      
      console.log(`✓ Stored: Class ${textbook.class} ${textbook.subject} (${textbook.language})`);
      return inserted;
    } catch (error) {
      // Handle duplicate entries gracefully
      if (error.code === '23505') { // Unique constraint violation
        console.log(`• Duplicate: Class ${textbook.class} ${textbook.subject} (${textbook.language})`);
        return null;
      }
      console.error(`Error storing textbook: ${textbook.bookTitle}`, error);
      return null;
    }
  }

  async updateTextbook(id: number, updates: Partial<NCERTTextbook>): Promise<NCERTTextbook | null> {
    try {
      const [updated] = await db
        .update(ncertTextbooks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(ncertTextbooks.id, id))
        .returning();
      
      return updated;
    } catch (error) {
      console.error(`Error updating textbook ${id}:`, error);
      return null;
    }
  }

  async getTextbookCount(): Promise<number> {
    try {
      const result = await db.select().from(ncertTextbooks);
      return result.length;
    } catch (error) {
      console.error("Error counting textbooks:", error);
      return 0;
    }
  }

  async clearAllTextbooks(): Promise<boolean> {
    try {
      await db.delete(ncertTextbooks);
      console.log("✓ Cleared all NCERT textbooks from database");
      return true;
    } catch (error) {
      console.error("Error clearing textbooks:", error);
      return false;
    }
  }
}

// Export singleton instance
export const ncertStorage = new NCERTStorage();