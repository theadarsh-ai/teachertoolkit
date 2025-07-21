import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Download, Database, Play, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Link } from 'wouter';

interface NCERTTextbook {
  id: string;
  class: number;
  subject: string;
  bookTitle: string;
  language: string;
  pdfUrl: string;
  contentExtracted: boolean;
  createdAt: Date;
}

interface TextbooksResponse {
  success: boolean;
  count: number;
  data: NCERTTextbook[];
}

export default function NCERTManagement() {
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const queryClient = useQueryClient();

  // Fetch all stored textbooks
  const { data: textbooksData, isLoading, error } = useQuery<TextbooksResponse>({
    queryKey: ['/api/ncert/textbooks'],
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  // Scrape NCERT textbooks mutation
  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ncert/scrape', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Scraping failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "NCERT Scraping Complete!",
        description: `Successfully scraped ${data.count} textbooks from NCERT website`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ncert/textbooks'] });
      setScrapingProgress(100);
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: `Error: ${error}`,
        variant: "destructive",
      });
      setScrapingProgress(0);
    },
  });

  const startScraping = () => {
    setScrapingProgress(0);
    scrapeMutation.mutate();
    
    // Simulate progress for UI feedback
    const progressInterval = setInterval(() => {
      setScrapingProgress(prev => {
        if (prev >= 90 || scrapeMutation.isSuccess) {
          clearInterval(progressInterval);
          return scrapeMutation.isSuccess ? 100 : prev;
        }
        return prev + 10;
      });
    }, 2000);
  };

  const textbooks = textbooksData?.data || [];
  const totalBooks = textbooks.length;
  const extractedBooks = textbooks.filter((book: NCERTTextbook) => book.contentExtracted).length;

  // Group textbooks by class
  const booksByClass = textbooks.reduce((acc: Record<number, NCERTTextbook[]>, book: NCERTTextbook) => {
    if (!acc[book.class]) acc[book.class] = [];
    acc[book.class].push(book);
    return acc;
  }, {});

  // Group textbooks by subject
  const booksBySubject = textbooks.reduce((acc: Record<string, NCERTTextbook[]>, book: NCERTTextbook) => {
    if (!acc[book.subject]) acc[book.subject] = [];
    acc[book.subject].push(book);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Navigation */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">NCERT Textbooks Management</h1>
            <p className="text-muted-foreground">
              Scrape, store, and manage all NCERT textbooks from official website for AI agent integration
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Textbooks</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBooks}</div>
              <p className="text-xs text-muted-foreground">
                Across all classes and subjects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Content Extracted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{extractedBooks}</div>
              <p className="text-xs text-muted-foreground">
                Ready for AI agent processing
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalBooks > 0 ? Math.round((extractedBooks / totalBooks) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Content processing progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scraping Control */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>NCERT Textbook Scraping</span>
            </CardTitle>
            <CardDescription>
              Scrape all NCERT textbooks (Classes 1-12) from the official website and store in Firebase database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scrapingProgress > 0 && scrapingProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scraping Progress</span>
                  <span>{scrapingProgress}%</span>
                </div>
                <Progress value={scrapingProgress} className="w-full" />
              </div>
            )}
            
            <Button 
              onClick={startScraping}
              disabled={scrapeMutation.isPending}
              size="lg"
              className="w-full"
            >
              {scrapeMutation.isPending ? (
                <>
                  <Play className="w-4 h-4 mr-2 animate-spin" />
                  Scraping NCERT Website...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start NCERT Scraping
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Textbooks Display */}
        {totalBooks > 0 && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Stored Textbooks ({totalBooks})</CardTitle>
              <CardDescription>
                View textbooks organized by class and subject - connected to all AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="by-class" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="by-class">By Class</TabsTrigger>
                  <TabsTrigger value="by-subject">By Subject</TabsTrigger>
                </TabsList>
                
                <TabsContent value="by-class" className="space-y-4">
                  {Object.entries(booksByClass)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([classNum, books]) => (
                    <Card key={classNum} className="bg-white/50 dark:bg-gray-900/50">
                      <CardHeader>
                        <CardTitle className="text-lg">Class {classNum}</CardTitle>
                        <CardDescription>{books.length} textbooks</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {books.map((book: NCERTTextbook) => (
                            <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800">
                              <div className="flex-1">
                                <p className="font-medium">{book.subject}</p>
                                <p className="text-sm text-muted-foreground">{book.bookTitle}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {book.contentExtracted ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-600" />
                                )}
                                <Badge variant="outline">{book.language}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="by-subject" className="space-y-4">
                  {Object.entries(booksBySubject).map(([subject, books]) => (
                    <Card key={subject} className="bg-white/50 dark:bg-gray-900/50">
                      <CardHeader>
                        <CardTitle className="text-lg">{subject}</CardTitle>
                        <CardDescription>{books.length} textbooks across different classes</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {books.map((book: NCERTTextbook) => (
                            <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg bg-white dark:bg-gray-800">
                              <div className="flex-1">
                                <p className="font-medium">Class {book.class}</p>
                                <p className="text-sm text-muted-foreground">{book.bookTitle}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {book.contentExtracted ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-amber-600" />
                                )}
                                <Badge variant="outline">{book.language}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <Play className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                <p>Loading NCERT textbooks from Firebase...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center p-8">
              <div className="text-center space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
                <p className="text-red-600">Failed to load textbooks from Firebase</p>
                <Button 
                  variant="outline" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/ncert/textbooks'] })}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {totalBooks === 0 && !isLoading && (
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-dashed border-2">
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No NCERT Textbooks Found</h3>
              <p className="text-muted-foreground mb-6">
                Click "Start NCERT Scraping" to fetch all textbooks from the official NCERT website
              </p>
              <p className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                Once scraped, all 11 AI agents will have access to NCERT textbook content for generating 
                culturally relevant educational materials aligned with Indian curriculum standards.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}