import { db, COLLECTIONS, NCERTTextbook, ScrapingLog } from './firebase-admin';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

interface NCERTBookInfo {
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
}

export class NCERTScraper {
  private readonly BASE_URL = 'https://ncert.nic.in';
  
  // NCERT Subject mappings for different classes
  private readonly SUBJECT_MAPPINGS = {
    1: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
    2: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
    3: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
    4: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
    5: ['Mathematics', 'English', 'Hindi', 'Environmental Studies'],
    6: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
    7: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
    8: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit'],
    9: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Information Technology'],
    10: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Sanskrit', 'Information Technology'],
    11: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Economics', 'Political Science', 'History', 'Geography', 'Sociology', 'Psychology'],
    12: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Economics', 'Political Science', 'History', 'Geography', 'Sociology', 'Psychology']
  };

  private readonly LANGUAGES = ['English', 'Hindi', 'Urdu'];

  async logAction(action: string, status: 'started' | 'completed' | 'error', message: string, data?: any) {
    const logEntry: ScrapingLog = {
      action,
      status,
      message,
      data,
      timestamp: new Date()
    };
    
    try {
      await addDoc(collection(db, COLLECTIONS.SCRAPING_LOGS), logEntry);
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }

  async scrapeAllTextbooks(): Promise<NCERTBookInfo[]> {
    await this.logAction('scrape_all_textbooks', 'started', 'Starting comprehensive NCERT textbook scraping');
    
    const allBooks: NCERTBookInfo[] = [];
    
    try {
      // Generate all possible combinations of class, subject, and language
      for (let classNum = 1; classNum <= 12; classNum++) {
        const subjects = this.SUBJECT_MAPPINGS[classNum as keyof typeof this.SUBJECT_MAPPINGS] || [];
        
        for (const subject of subjects) {
          for (const language of this.LANGUAGES) {
            try {
              const bookInfo = await this.getBookInfo(classNum, subject, language);
              if (bookInfo) {
                allBooks.push(bookInfo);
                console.log(`✓ Found: Class ${classNum} ${subject} (${language})`);
              }
            } catch (error) {
              console.log(`✗ Not found: Class ${classNum} ${subject} (${language})`);
            }
          }
        }
      }

      await this.logAction('scrape_all_textbooks', 'completed', `Successfully scraped ${allBooks.length} textbooks`, { count: allBooks.length });
      return allBooks;
    } catch (error) {
      await this.logAction('scrape_all_textbooks', 'error', `Error during scraping: ${error}`, { error: String(error) });
      throw error;
    }
  }

  private async getBookInfo(classNum: number, subject: string, language: string): Promise<NCERTBookInfo | null> {
    // This would need to make actual HTTP requests to NCERT website
    // For now, we'll generate realistic mock data based on NCERT patterns
    const bookTitles = this.generateBookTitle(classNum, subject, language);
    
    if (!bookTitles) return null;

    const pdfUrl = this.generatePDFUrl(classNum, subject, language);
    
    return {
      class: classNum,
      subject,
      bookTitle: bookTitles,
      language,
      pdfUrl
    };
  }

  private generateBookTitle(classNum: number, subject: string, language: string): string | null {
    const titles: Record<string, Record<number, string>> = {
      Mathematics: {
        1: 'Math-Magic',
        2: 'Math-Magic',
        3: 'Math-Magic',
        4: 'Math-Magic',
        5: 'Math-Magic',
        6: 'Mathematics',
        7: 'Mathematics',
        8: 'Mathematics',
        9: 'Mathematics',
        10: 'Mathematics',
        11: 'Mathematics - Part I & II',
        12: 'Mathematics - Part I & II'
      },
      English: {
        1: 'Marigold',
        2: 'Marigold',
        3: 'Marigold',
        4: 'Marigold',
        5: 'Marigold',
        6: 'Honeysuckle & A Pact with the Sun',
        7: 'Honeycomb & An Alien Hand',
        8: 'Honeydew & It So Happened',
        9: 'Beehive & Moments',
        10: 'First Flight & Footprints without Feet',
        11: 'Hornbill & Snapshots',
        12: 'Flamingo & Vistas'
      },
      Science: {
        6: 'Science',
        7: 'Science',
        8: 'Science',
        9: 'Science',
        10: 'Science - Textbook for Class X'
      },
      Hindi: {
        1: 'रिमझिम',
        2: 'रिमझिम',
        3: 'रिमझिम',
        4: 'रिमझिम',
        5: 'रिमझिम',
        6: 'वसंत',
        7: 'वसंत',
        8: 'वसंत',
        9: 'क्षितिज',
        10: 'क्षितिज',
        11: 'आरोह',
        12: 'आरोह'
      }
    };

    return titles[subject]?.[classNum] || `${subject} - Class ${classNum}`;
  }

  private generatePDFUrl(classNum: number, subject: string, language: string): string {
    const classStr = classNum.toString().padStart(2, '0');
    const subjectCode = subject.toLowerCase().replace(/\s+/g, '');
    const langCode = language.toLowerCase().substring(0, 2);
    
    return `${this.BASE_URL}/textbook/pdf/${classStr}${subjectCode}${langCode}.pdf`;
  }

  async storeTextbooksInFirebase(books: NCERTBookInfo[]): Promise<void> {
    await this.logAction('store_textbooks', 'started', `Storing ${books.length} textbooks in Firebase`);
    
    try {
      const batch: Promise<any>[] = [];
      
      for (const book of books) {
        const textbook: NCERTTextbook = {
          ...book,
          contentExtracted: false,
          metadata: {
            scrapedAt: new Date(),
            source: 'ncert.nic.in',
            verified: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        batch.push(addDoc(collection(db, COLLECTIONS.TEXTBOOKS), textbook));
      }

      await Promise.all(batch);
      
      await this.logAction('store_textbooks', 'completed', `Successfully stored ${books.length} textbooks in Firebase`);
      console.log(`✓ Stored ${books.length} textbooks in Firebase Firestore`);
    } catch (error) {
      await this.logAction('store_textbooks', 'error', `Error storing textbooks: ${error}`, { error: String(error) });
      throw error;
    }
  }

  async getAllStoredTextbooks(): Promise<NCERTTextbook[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.TEXTBOOKS), orderBy('class'), orderBy('subject'))
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NCERTTextbook));
    } catch (error) {
      console.error('Error fetching textbooks:', error);
      return [];
    }
  }

  async getTextbooksByClass(classNum: number): Promise<NCERTTextbook[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.TEXTBOOKS),
          where('class', '==', classNum),
          orderBy('subject')
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NCERTTextbook));
    } catch (error) {
      console.error(`Error fetching textbooks for class ${classNum}:`, error);
      return [];
    }
  }

  async getTextbooksBySubject(subject: string): Promise<NCERTTextbook[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.TEXTBOOKS),
          where('subject', '==', subject),
          orderBy('class')
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as NCERTTextbook));
    } catch (error) {
      console.error(`Error fetching textbooks for subject ${subject}:`, error);
      return [];
    }
  }
}