import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, BookOpen, Download, FileText, Globe, GraduationCap, Languages, ArrowLeft, CheckCircle, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface ContentGenerationRequest {
  prompt: string;
  grades: number[];
  languages: string[];
  contentSource: string;
  userId?: number;
  generatePDF?: boolean;
}

interface ContentGenerationResponse {
  success: boolean;
  message: string;
  content: string;
  pdf?: {
    fileName: string;
    downloadUrl: string;
  };
  metadata: {
    culturallyRelevant: boolean;
    ncertAligned: boolean;
  };
}

export default function ContentGenerator() {
  const [prompt, setPrompt] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
  const [contentSource, setContentSource] = useState("prebook");
  const [generatedContent, setGeneratedContent] = useState<ContentGenerationResponse | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const generateContentMutation = useMutation({
    mutationFn: async (request: ContentGenerationRequest): Promise<ContentGenerationResponse> => {
      const response = await fetch('/api/agents/content-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error('Content generation failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setGenerationProgress(100);
      toast({
        title: "Content Generated Successfully!",
        description: data.pdf ? `PDF created: ${data.pdf.fileName}` : "Content ready for review",
      });
    },
    onError: (error) => {
      setGenerationProgress(0);
      toast({
        title: "Generation Failed",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a topic or prompt for content generation",
        variant: "destructive",
      });
      return;
    }

    if (selectedGrades.length === 0) {
      toast({
        title: "Missing Information", 
        description: "Please select at least one grade level",
        variant: "destructive",
      });
      return;
    }

    setGenerationProgress(0);
    setGeneratedContent(null);
    
    // Start progress simulation
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 2000);

    generateContentMutation.mutate({
      prompt,
      grades: selectedGrades,
      languages: selectedLanguages,
      contentSource,
      userId: 1,
      generatePDF: true
    });
  };

  const toggleGrade = (grade: number) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade].sort((a, b) => a - b)
    );
  };

  const toggleLanguage = (language: string) => {
    setSelectedLanguages(prev => 
      prev.includes(language)
        ? prev.filter(l => l !== language)
        : [...prev, language]
    );
  };

  const availableGrades = Array.from({ length: 12 }, (_, i) => i + 1);
  const availableLanguages = ['English', 'Hindi', 'Urdu', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'];

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
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hyper-Local Content Generator
            </h1>
            <p className="text-muted-foreground">
              Generate culturally relevant educational content with AI - now with PDF output
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Content Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure your educational content generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Topic or Learning Objective</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., 'Explain photosynthesis with Indian cultural examples for multi-grade classroom'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Grade Selection */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Target Grades ({selectedGrades.length} selected)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableGrades.map((grade) => (
                    <Button
                      key={grade}
                      variant={selectedGrades.includes(grade) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleGrade(grade)}
                      className="min-w-[40px]"
                    >
                      {grade}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-3">
                <Label className="flex items-center space-x-2">
                  <Languages className="w-4 h-4" />
                  <span>Languages ({selectedLanguages.length} selected)</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((language) => (
                    <Badge
                      key={language}
                      variant={selectedLanguages.includes(language) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLanguage(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Source */}
              <div className="space-y-2">
                <Label>Content Source</Label>
                <Select value={contentSource} onValueChange={setContentSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prebook">NCERT Textbooks (Recommended)</SelectItem>
                    <SelectItem value="external">External Educational Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generation Progress */}
              {generationProgress > 0 && generationProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating Content...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generateContentMutation.isPending}
                size="lg"
                className="w-full"
              >
                {generateContentMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Educational Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Generated Content</span>
              </CardTitle>
              <CardDescription>
                AI-generated educational content ready for classroom use
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedContent ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Content Generated Yet</h3>
                  <p className="text-muted-foreground">
                    Configure your settings and click "Generate Educational Content" to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Success Alert */}
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {generatedContent.message}
                    </AlertDescription>
                  </Alert>

                  {/* Document Download */}
                  {generatedContent.pdf && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">Document Ready for Download</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Structured educational content with Indian cultural examples
                            </p>
                          </div>
                        </div>
                        <Button 
                          asChild 
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <a href={generatedContent.pdf.downloadUrl} download>
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${generatedContent.metadata.culturallyRelevant ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Culturally Relevant</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${generatedContent.metadata.ncertAligned ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">NCERT Aligned</span>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="space-y-4">
                    <div className="max-h-64 overflow-y-auto p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="prose prose-sm max-w-none">
                        {generatedContent.content.split('\n').slice(0, 15).map((line, index) => (
                          <p key={index} className="mb-2">{line.length > 100 ? line.substring(0, 100) + '...' : line}</p>
                        ))}
                        {generatedContent.content.split('\n').length > 15 && (
                          <p className="text-muted-foreground italic">... and more content available in the downloadable document</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Generation Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div>
                        <strong>Grades:</strong> {selectedGrades.join(', ')}
                      </div>
                      <div>
                        <strong>Languages:</strong> {selectedLanguages.join(', ')}
                      </div>
                      <div>
                        <strong>Source:</strong> {contentSource === 'prebook' ? 'NCERT Textbooks' : 'External Resources'}
                      </div>
                      <div>
                        <strong>AI Model:</strong> Gemini 2.5 Flash
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Content Generator Features</CardTitle>
            <CardDescription>
              Powered by Gemini AI with access to 228 NCERT textbooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium">Cultural Relevance</h4>
                  <p className="text-sm text-muted-foreground">
                    Indian festivals, examples, and cultural context
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Languages className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Multi-Language</h4>
                  <p className="text-sm text-muted-foreground">
                    Content in 8+ Indian languages
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <GraduationCap className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium">Grade Differentiation</h4>
                  <p className="text-sm text-muted-foreground">
                    Adapted for classes 1-12
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Download className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-medium">PDF Export</h4>
                  <p className="text-sm text-muted-foreground">
                    Beautiful, structured downloadable PDFs
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}