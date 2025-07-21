import axios from 'axios';
import { firebaseNCERTStorage } from './firebase-admin-ncert';

interface NCERTBookInfo {
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  metadata?: Record<string, any>;
}

export class FirebaseNCERTScraper {
  private readonly BASE_URL = 'https://ncert.nic.in';
  
  // NCERT Subject mappings for different classes
  private readonly SUBJECT_MAPPINGS: Record<number, string[]> = {
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

  async scrapeAllTextbooks(): Promise<{ textbooks: NCERTBookInfo[], scrapedCount: number, storedCount: number }> {
    console.log('🚀 Starting comprehensive NCERT textbook scraping to Firebase Firestore');
    
    console.log('📚 Beginning NCERT textbook scraping process');
    
    const allBooks: NCERTBookInfo[] = [];
    let storedCount = 0;
    
    try {
      // Generate all possible combinations of class, subject, and language
      for (let classNum = 1; classNum <= 12; classNum++) {
        const subjects = this.SUBJECT_MAPPINGS[classNum] || [];
        
        for (const subject of subjects) {
          for (const language of this.LANGUAGES) {
            try {
              const book = await this.findTextbookPDF(classNum, subject, language);
              if (book) {
                allBooks.push(book);
                
                // Store immediately in Firebase
                const stored = await firebaseNCERTStorage.storeTextbook({
                  class: book.class,
                  subject: book.subject,
                  bookTitle: book.bookTitle,
                  language: book.language,
                  pdfUrl: book.pdfUrl,
                  contentExtracted: false,
                  chapterCount: 0,
                  metadata: book.metadata || {}
                });
                
                if (stored) {
                  storedCount++;
                }
                
                console.log(`✓ Found & Stored: Class ${classNum} ${subject} (${language})`);
              }
              
              // Small delay to avoid overwhelming the server
              await new Promise(resolve => setTimeout(resolve, 100));
              
            } catch (error) {
              console.log(`• Skip: Class ${classNum} ${subject} (${language}) - ${error.message}`);
            }
          }
        }
      }
      
      await firebaseNCERTStorage.logScrapingActivity(
        'scrape_complete', 
        'success', 
        `Successfully scraped ${allBooks.length} textbooks, stored ${storedCount} in Firebase`,
        { totalFound: allBooks.length, totalStored: storedCount }
      );
      
      console.log(`📚 Successfully found ${allBooks.length} NCERT textbooks`);
      console.log(`💾 Successfully stored ${storedCount} textbooks in Firebase Firestore`);
      
      return {
        textbooks: allBooks,
        scrapedCount: allBooks.length,
        storedCount
      };
      
    } catch (error) {
      await firebaseNCERTStorage.logScrapingActivity('scrape_error', 'error', `Scraping failed: ${error.message}`);
      console.error('Error during NCERT scraping:', error);
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  private async findTextbookPDF(classNum: number, subject: string, language: string): Promise<NCERTBookInfo | null> {
    try {
      // NCERT URL patterns for different textbook types
      const urlPatterns = [
        `${this.BASE_URL}/textbook/pdf/${this.formatSubjectForUrl(subject)}${classNum}${this.getLanguageCode(language)}.pdf`,
        `${this.BASE_URL}/textbook/pdf/${this.formatSubjectForUrl(subject)}${classNum}.pdf`,
        `${this.BASE_URL}/textbooks/pdf/${this.formatSubjectForUrl(subject)}${classNum}${this.getLanguageCode(language)}.pdf`,
        `${this.BASE_URL}/publication/textbooks/pdf/${this.formatSubjectForUrl(subject)}${classNum}.pdf`
      ];

      for (const url of urlPatterns) {
        try {
          const response = await axios.head(url, { timeout: 5000 });
          
          if (response.status === 200) {
            return {
              class: classNum,
              subject: subject,
              bookTitle: `${subject} - Class ${classNum}`,
              language: language,
              pdfUrl: url,
              metadata: {
                contentType: response.headers['content-type'],
                contentLength: response.headers['content-length'],
                lastModified: response.headers['last-modified'],
                scrapedAt: new Date().toISOString(),
                urlPattern: url,
                source: 'ncert.nic.in'
              }
            };
          }
        } catch (error) {
          // Continue to next URL pattern
          continue;
        }
      }
      
      return null;
    } catch (error) {
      throw new Error(`Failed to find PDF for Class ${classNum} ${subject} (${language})`);
    }
  }

  private formatSubjectForUrl(subject: string): string {
    // Convert subject names to NCERT URL format
    const subjectMappings: Record<string, string> = {
      'Mathematics': 'math',
      'English': 'english',
      'Hindi': 'hindi',
      'Science': 'science',
      'Social Science': 'social',
      'Environmental Studies': 'evs',
      'Physics': 'physics',
      'Chemistry': 'chemistry',
      'Biology': 'biology',
      'Economics': 'economics',
      'Political Science': 'politics',
      'History': 'history',
      'Geography': 'geography',
      'Sociology': 'sociology',
      'Psychology': 'psychology',
      'Sanskrit': 'sanskrit',
      'Information Technology': 'it'
    };
    
    return subjectMappings[subject] || subject.toLowerCase().replace(/\s+/g, '');
  }

  private getLanguageCode(language: string): string {
    const languageCodes: Record<string, string> = {
      'English': 'en',
      'Hindi': 'hi',
      'Urdu': 'ur'
    };
    
    return languageCodes[language] || '';
  }
}

// Export function for use in routes
export async function scrapeNCERTTextbooksToFirebase() {
  const scraper = new FirebaseNCERTScraper();
  return await scraper.scrapeAllTextbooks();
}