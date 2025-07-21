import axios from 'axios';
import { firebaseRealtimeStorage, NCERTTextbook } from './firebase-realtime-ncert';

// NCERT Official URLs and structure
const NCERT_BASE_URL = 'https://ncert.nic.in/textbook.php';
const NCERT_PDF_BASE = 'https://ncert.nic.in/textbook/pdf/';

// Comprehensive NCERT textbook catalog
const NCERT_CATALOG = {
  1: {
    Mathematics: { english: 'aemh1dd.zip', hindi: 'aemh1hd.zip' },
    English: { english: 'aeen1dd.zip', hindi: 'aeen1hd.zip' },
    Hindi: { hindi: 'aehi1dd.zip' },
    EVS: { english: 'aeaa1dd.zip', hindi: 'aeaa1hd.zip' }
  },
  2: {
    Mathematics: { english: 'aemh2dd.zip', hindi: 'aemh2hd.zip' },
    English: { english: 'aeen2dd.zip', hindi: 'aeen2hd.zip' },
    Hindi: { hindi: 'aehi2dd.zip' },
    EVS: { english: 'aeaa2dd.zip', hindi: 'aeaa2hd.zip' }
  },
  3: {
    Mathematics: { english: 'aemh3dd.zip', hindi: 'aemh3hd.zip' },
    English: { english: 'aeen3dd.zip', hindi: 'aeen3hd.zip' },
    Hindi: { hindi: 'aehi3dd.zip' },
    EVS: { english: 'aeaa3dd.zip', hindi: 'aeaa3hd.zip' }
  },
  4: {
    Mathematics: { english: 'aemh4dd.zip', hindi: 'aemh4hd.zip' },
    English: { english: 'aeen4dd.zip', hindi: 'aeen4hd.zip' },
    Hindi: { hindi: 'aehi4dd.zip' },
    EVS: { english: 'aeaa4dd.zip', hindi: 'aeaa4hd.zip' }
  },
  5: {
    Mathematics: { english: 'aemh5dd.zip', hindi: 'aemh5hd.zip' },
    English: { english: 'aeen5dd.zip', hindi: 'aeen5hd.zip' },
    Hindi: { hindi: 'aehi5dd.zip' },
    EVS: { english: 'aeaa5dd.zip', hindi: 'aeaa5hd.zip' }
  },
  6: {
    Mathematics: { english: 'femh1dd.zip', hindi: 'femh1hd.zip' },
    Science: { english: 'fesc1dd.zip', hindi: 'fesc1hd.zip' },
    'Social Science': { english: 'fess1dd.zip', hindi: 'fess1hd.zip' },
    English: { english: 'feen1dd.zip' },
    Hindi: { hindi: 'fehi1dd.zip' },
    Sanskrit: { english: 'fesa1dd.zip', hindi: 'fesa1hd.zip' }
  },
  7: {
    Mathematics: { english: 'gemh1dd.zip', hindi: 'gemh1hd.zip' },
    Science: { english: 'gesc1dd.zip', hindi: 'gesc1hd.zip' },
    'Social Science': { english: 'gess1dd.zip', hindi: 'gess1hd.zip' },
    English: { english: 'geen1dd.zip' },
    Hindi: { hindi: 'gehi1dd.zip' },
    Sanskrit: { english: 'gesa1dd.zip', hindi: 'gesa1hd.zip' }
  },
  8: {
    Mathematics: { english: 'hemh1dd.zip', hindi: 'hemh1hd.zip' },
    Science: { english: 'hesc1dd.zip', hindi: 'hesc1hd.zip' },
    'Social Science': { english: 'hess1dd.zip', hindi: 'hess1hd.zip' },
    English: { english: 'heen1dd.zip' },
    Hindi: { hindi: 'hehi1dd.zip' },
    Sanskrit: { english: 'hesa1dd.zip', hindi: 'hesa1hd.zip' }
  },
  9: {
    Mathematics: { english: 'iemh1dd.zip', hindi: 'iemh1hd.zip' },
    Science: { english: 'iesc1dd.zip', hindi: 'iesc1hd.zip' },
    'Social Science': { english: 'iess1dd.zip', hindi: 'iess1hd.zip' },
    English: { english: 'ieen1dd.zip' },
    Hindi: { hindi: 'iehi1dd.zip' },
    Sanskrit: { english: 'iesa1dd.zip', hindi: 'iesa1hd.zip' },
    Economics: { english: 'ieec1dd.zip', hindi: 'ieec1hd.zip' }
  },
  10: {
    Mathematics: { english: 'jemh1dd.zip', hindi: 'jemh1hd.zip' },
    Science: { english: 'jesc1dd.zip', hindi: 'jesc1hd.zip' },
    'Social Science': { english: 'jess1dd.zip', hindi: 'jess1hd.zip' },
    English: { english: 'jeen1dd.zip' },
    Hindi: { hindi: 'jehi1dd.zip' },
    Sanskrit: { english: 'jesa1dd.zip', hindi: 'jesa1hd.zip' },
    Economics: { english: 'jeec1dd.zip', hindi: 'jeec1hd.zip' }
  },
  11: {
    Mathematics: { english: 'kemh1dd.zip', hindi: 'kemh1hd.zip' },
    Physics: { english: 'keph1dd.zip', hindi: 'keph1hd.zip' },
    Chemistry: { english: 'kech1dd.zip', hindi: 'kech1hd.zip' },
    Biology: { english: 'kebi1dd.zip', hindi: 'kebi1hd.zip' },
    History: { english: 'kehi1dd.zip', hindi: 'kehi1hd.zip' },
    Geography: { english: 'kege1dd.zip', hindi: 'kege1hd.zip' },
    'Political Science': { english: 'keps1dd.zip', hindi: 'keps1hd.zip' },
    Economics: { english: 'keec1dd.zip', hindi: 'keec1hd.zip' },
    English: { english: 'keen1dd.zip' },
    Hindi: { hindi: 'kehi1dd.zip' },
    Sanskrit: { english: 'kesa1dd.zip', hindi: 'kesa1hd.zip' }
  },
  12: {
    Mathematics: { english: 'lemh1dd.zip', hindi: 'lemh1hd.zip' },
    Physics: { english: 'leph1dd.zip', hindi: 'leph1hd.zip' },
    Chemistry: { english: 'lech1dd.zip', hindi: 'lech1hd.zip' },
    Biology: { english: 'lebi1dd.zip', hindi: 'lebi1hd.zip' },
    History: { english: 'lehi1dd.zip', hindi: 'lehi1hd.zip' },
    Geography: { english: 'lege1dd.zip', hindi: 'lege1hd.zip' },
    'Political Science': { english: 'leps1dd.zip', hindi: 'leps1hd.zip' },
    Economics: { english: 'leec1dd.zip', hindi: 'leec1hd.zip' },
    English: { english: 'leen1dd.zip' },
    Hindi: { hindi: 'lehi1dd.zip' },
    Sanskrit: { english: 'lesa1dd.zip', hindi: 'lesa1hd.zip' }
  }
};

class NCERTRealtimeScraper {
  private storage = firebaseRealtimeStorage;
  private scrapedCount = 0;
  private totalToScrape = 0;
  private errors: string[] = [];

  async scrapeAllTextbooks(): Promise<{ success: boolean; scrapedCount: number; errors: string[]; totalBooks: number }> {
    console.log('🚀 Starting comprehensive NCERT textbook scraping to Firebase Realtime Database');
    console.log('📚 Beginning NCERT textbook scraping process');
    
    this.scrapedCount = 0;
    this.errors = [];

    // Calculate total books to scrape
    this.totalToScrape = this.calculateTotalBooks();
    console.log(`📊 Total textbooks to scrape: ${this.totalToScrape}`);

    try {
      // Test database connection first
      const isConnected = await this.storage.initializeDatabase();
      if (!isConnected) {
        throw new Error('Firebase Realtime Database connection failed');
      }

      // Scrape all classes
      for (const classNum of Object.keys(NCERT_CATALOG)) {
        const classNumber = parseInt(classNum);
        console.log(`\n📚 Processing Class ${classNumber}...`);
        
        await this.scrapeClass(classNumber);
      }

      const finalCount = this.scrapedCount;
      const hasErrors = this.errors.length > 0;
      
      console.log('\n🎉 NCERT scraping completed!');
      console.log(`✅ Successfully scraped: ${finalCount} textbooks`);
      
      if (hasErrors) {
        console.log(`⚠️  Encountered ${this.errors.length} errors:`);
        this.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

      return {
        success: true,
        scrapedCount: finalCount,
        errors: this.errors,
        totalBooks: this.totalToScrape
      };
    } catch (error) {
      console.error('❌ NCERT scraping failed:', error);
      return {
        success: false,
        scrapedCount: this.scrapedCount,
        errors: [...this.errors, error.message],
        totalBooks: this.totalToScrape
      };
    }
  }

  private calculateTotalBooks(): number {
    let total = 0;
    Object.values(NCERT_CATALOG).forEach(classData => {
      Object.values(classData).forEach(subjectData => {
        total += Object.keys(subjectData).length;
      });
    });
    return total;
  }

  private async scrapeClass(classNumber: number) {
    const classData = NCERT_CATALOG[classNumber];
    
    for (const [subject, languages] of Object.entries(classData)) {
      for (const [language, filename] of Object.entries(languages)) {
        try {
          await this.scrapeTextbook(classNumber, subject, language, filename);
        } catch (error) {
          const errorMsg = `Class ${classNumber} - ${subject} (${language}): ${error.message}`;
          this.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
    }
  }

  private async scrapeTextbook(classNumber: number, subject: string, language: string, filename: string) {
    try {
      console.log(`  📖 Scraping: Class ${classNumber} - ${subject} (${language})`);
      
      const pdfUrl = `${NCERT_PDF_BASE}${filename}`;
      
      // Check if URL is accessible
      const isAccessible = await this.checkUrlAccessibility(pdfUrl);
      if (!isAccessible) {
        throw new Error(`PDF not accessible at ${pdfUrl}`);
      }

      const textbook: NCERTTextbook = {
        class: classNumber,
        subject,
        bookTitle: `NCERT ${subject} - Class ${classNumber}`,
        language: language.charAt(0).toUpperCase() + language.slice(1),
        pdfUrl,
        contentExtracted: false,
        chapterCount: 0,
        metadata: {
          extractionStatus: 'pending',
          lastUpdated: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in Firebase Realtime Database
      const textbookId = await this.storage.storeTextbook(textbook);
      this.scrapedCount++;
      
      console.log(`  ✅ Stored: ${textbookId} (${this.scrapedCount}/${this.totalToScrape})`);
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      throw new Error(`Failed to scrape ${subject} for Class ${classNumber}: ${error.message}`);
    }
  }

  private async checkUrlAccessibility(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      // Some servers don't support HEAD requests, try GET with range
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: { 'Range': 'bytes=0-1023' } // Just get first 1KB
        });
        return response.status === 206 || response.status === 200;
      } catch (error2) {
        console.warn(`  ⚠️  URL accessibility check failed for ${url}`);
        return false; // Assume accessible for now, will fail later if not
      }
    }
  }

  async getScrapingStatus(): Promise<{
    totalTextbooks: number;
    extractedCount: number;
    pendingCount: number;
    recentlyAdded: NCERTTextbook[];
  }> {
    try {
      const allTextbooks = await this.storage.getAllTextbooks();
      const extractedCount = allTextbooks.filter(book => book.contentExtracted).length;
      const pendingCount = allTextbooks.length - extractedCount;
      
      // Get 5 most recently added books
      const recentlyAdded = allTextbooks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      return {
        totalTextbooks: allTextbooks.length,
        extractedCount,
        pendingCount,
        recentlyAdded
      };
    } catch (error) {
      console.error('❌ Error getting scraping status:', error);
      throw error;
    }
  }
}

export const ncertRealtimeScraper = new NCERTRealtimeScraper();