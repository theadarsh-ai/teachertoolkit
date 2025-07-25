import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Brain, 
  Search, 
  BookOpen, 
  Globe,
  Lightbulb,
  MessageCircle,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Book,
  Sparkles,
  Languages,
  GraduationCap,
  History,
  Clock,
  HelpCircle,
  BookOpenCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface KnowledgeQuery {
  question: string;
  grade: number;
  subject: string;
  language: string;
  searchNCERT: boolean;
  searchExternal: boolean;
}

interface KnowledgeResponse {
  question: string;
  answer: string;
  explanation: string; // Detailed step-by-step explanation
  sources: {
    ncert: Array<{
      title: string;
      class: number;
      subject: string;
      chapter: string;
      page?: number;
    }>;
    external: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  };
  analogies: string[];
  followUpQuestions: string[];
  confidence: number;
  language: string;
  gradeLevel: number;
}

interface HistoryItem {
  id: number;
  question: string;
  answer: string;
  explanation: string;
  grade: number;
  subject: string;
  language: string;
  confidence: number;
  sources: KnowledgeResponse['sources'];
  analogies: string[];
  followUpQuestions: string[];
  createdAt: string;
}

export default function InstantKnowledgePage() {
  const { toast } = useToast();
  
  const [query, setQuery] = useState<KnowledgeQuery>({
    question: "",
    grade: 8,
    subject: "Science",
    language: "English",
    searchNCERT: true,
    searchExternal: true
  });

  const [responses, setResponses] = useState<KnowledgeResponse[]>([]);  
  const [currentResponse, setCurrentResponse] = useState<KnowledgeResponse | null>(null);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ask");
  const userId = 1; // In a real app, this would come from authentication

  // Sample knowledge base queries for suggestions
  const SAMPLE_QUERIES = {
    Science: [
      "What is photosynthesis and how does it work?",
      "Explain the water cycle in simple terms",
      "How do magnets work?",
      "What causes earthquakes?",
      "Difference between acids and bases"
    ],
    Mathematics: [
      "What are prime numbers?",
      "How to calculate area of a circle?",
      "What is the Pythagorean theorem?",
      "Explain fractions with examples",
      "What are square roots?"
    ],
    History: [
      "Who was Chandragupta Maurya?",
      "What was the Indian Independence Movement?",
      "Explain the Mughal Empire",
      "What was the significance of the Salt March?",
      "Who was Rani Lakshmibai?"
    ],
    Geography: [
      "What are monsoons?",
      "Explain the formation of mountains",
      "What is the difference between weather and climate?",
      "What are rivers and how do they form?",
      "Explain the solar system"
    ]
  };

  // Knowledge query mutation
  const knowledgeQueryMutation = useMutation({
    mutationFn: async (queryData: KnowledgeQuery) => {
      const response = await fetch("/api/agents/knowledge-base/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: queryData.question,
          grade: queryData.grade,
          subject: queryData.subject,
          language: queryData.language,
          userId: userId,
          options: {
            searchNCERT: queryData.searchNCERT,
            searchExternal: queryData.searchExternal
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Knowledge query failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Knowledge query failed');
      }
      
      return data.response;
    },
    onSuccess: (response) => {
      console.log("Knowledge query successful:", response);
      setResponses(prev => [response, ...prev]);
      setCurrentResponse(response);
      toast({
        title: "Question Answered!",
        description: `Found comprehensive answer with ${response.sources.ncert.length} NCERT sources and ${response.sources.external.length} external sources`,
      });
    },
    onError: (error) => {
      toast({
        title: "Query Failed",
        description: error instanceof Error ? error.message : "Please check your question and try again.",
        variant: "destructive",
      });
    }
  });

  // History query
  const historyQuery = useQuery({
    queryKey: ['/api/agents/knowledge-base/history', userId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/knowledge-base/history/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      const result = await response.json();
      return result.history as HistoryItem[];
    },
    enabled: activeTab === "history"
  });

  // Search history mutation
  const searchHistoryMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch(`/api/agents/knowledge-base/search/${userId}?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error("Failed to search history");
      const result = await response.json();
      return result.results as HistoryItem[];
    }
  });

  const handleQuerySubmit = () => {
    if (!query.question.trim()) {
      toast({
        title: "Question Required",
        description: "Please enter a question to get an answer.",
        variant: "destructive",
      });
      return;
    }

    knowledgeQueryMutation.mutate(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(prev => ({ ...prev, question: suggestion }));
    toast({
      title: "Suggestion Selected",
      description: "Question added. Click 'Search Knowledge Base' to get the answer.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Instant Knowledge Base</h1>
                <p className="text-gray-600">AI-powered Q&A with NCERT textbooks & external sources</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Powered by Gemini
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Query Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>Ask Your Question</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Get comprehensive answers from NCERT textbooks and external educational sources
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={query.subject} 
                      onValueChange={(value) => setQuery(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Science">Science</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="History">History</SelectItem>
                        <SelectItem value="Geography">Geography</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select 
                      value={query.grade.toString()} 
                      onValueChange={(value) => setQuery(prev => ({ ...prev, grade: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select 
                      value={query.language} 
                      onValueChange={(value) => setQuery(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">हिंदी</SelectItem>
                        <SelectItem value="Tamil">தமிழ்</SelectItem>
                        <SelectItem value="Telugu">తెలుగు</SelectItem>
                        <SelectItem value="Marathi">मराठी</SelectItem>
                        <SelectItem value="Bengali">বাংলা</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Search Options */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Search Sources</Label>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={query.searchNCERT}
                        onChange={(e) => setQuery(prev => ({ ...prev, searchNCERT: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700 flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        NCERT Textbooks
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={query.searchExternal}
                        onChange={(e) => setQuery(prev => ({ ...prev, searchExternal: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700 flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        External Sources
                      </span>
                    </label>
                  </div>
                </div>

                {/* Question Input */}
                <div>
                  <Label htmlFor="question">Your Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Ask any educational question. For example: 'Explain photosynthesis in simple terms' or 'What is the Pythagorean theorem?'"
                    value={query.question}
                    onChange={(e) => setQuery(prev => ({ ...prev, question: e.target.value }))}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleQuerySubmit}
                  disabled={knowledgeQueryMutation.isPending || !query.question.trim() || (!query.searchNCERT && !query.searchExternal)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                >
                  {knowledgeQueryMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Searching Knowledge Base...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Search Knowledge Base
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Answer Display */}
            {currentResponse && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-600" />
                      <span>Answer</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      {Math.round(currentResponse.confidence * 100)}% Confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Question */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">❓ Question:</h4>
                      <p className="text-blue-700">{currentResponse.question}</p>
                    </div>

                    {/* Main Answer */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3">💡 Comprehensive Answer:</h4>
                      <div className="text-green-700 whitespace-pre-wrap leading-relaxed mb-4">
                        {currentResponse.answer}
                      </div>
                      
                      {/* Detailed Step-by-Step Explanation */}
                      {currentResponse.explanation && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <BookOpenCheck className="w-4 h-4 mr-2" />
                            📖 Step-by-Step Explanation
                          </h4>
                          <div className="text-blue-700 whitespace-pre-wrap leading-relaxed">
                            {currentResponse.explanation}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* NCERT Sources */}
                      {currentResponse.sources.ncert.length > 0 && (
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                            <BookOpen className="w-4 h-4 mr-2" />
                            NCERT References ({currentResponse.sources.ncert.length})
                          </h4>
                          <div className="space-y-2">
                            {currentResponse.sources.ncert.map((source, index) => (
                              <div key={index} className="text-sm bg-white rounded p-2 border border-orange-100">
                                <div className="font-medium text-orange-800">
                                  Class {source.class} {source.subject}
                                </div>
                                <div className="text-orange-700">
                                  {source.title} - {source.chapter}
                                  {source.page && ` (Page ${source.page})`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* External Sources */}
                      {currentResponse.sources.external.length > 0 && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                            <Globe className="w-4 h-4 mr-2" />
                            External Sources ({currentResponse.sources.external.length})
                          </h4>
                          <div className="space-y-2">
                            {currentResponse.sources.external.map((source, index) => (
                              <div key={index} className="text-sm bg-white rounded p-2 border border-purple-100">
                                <div className="font-medium text-purple-800 flex items-center">
                                  {source.title}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </div>
                                <div className="text-purple-700">
                                  {source.type} - {source.url}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Analogies */}
                    {currentResponse.analogies.length > 0 && (
                      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                        <h4 className="font-semibold text-pink-800 mb-3 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Simple Analogies & Examples
                        </h4>
                        <div className="space-y-2">
                          {currentResponse.analogies.map((analogy, index) => (
                            <div key={index} className="text-sm text-pink-700 bg-white rounded p-2 border border-pink-100">
                              {analogy}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Follow-up Questions */}
                    {currentResponse.followUpQuestions.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Related Questions to Explore
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {currentResponse.followUpQuestions.map((question, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(question)}
                              className="text-sm text-left text-gray-700 bg-white rounded p-2 border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Suggestions Panel */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="w-5 h-5 text-indigo-600" />
                  <span>Sample Questions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {SAMPLE_QUERIES[query.subject as keyof typeof SAMPLE_QUERIES]?.map((suggestion, index) => (
                    <div 
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                    >
                      <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Questions */}
            {responses.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-green-600" />
                    <span>Recent Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {responses.slice(0, 5).map((response, index) => (
                      <div 
                        key={index}
                        onClick={() => setCurrentResponse(response)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {response.question.length > 50 
                                ? response.question.substring(0, 50) + "..." 
                                : response.question}
                            </p>
                            <p className="text-xs text-gray-600">
                              {response.sources.ncert.length + response.sources.external.length} sources
                            </p>
                          </div>
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                          >
                            {Math.round(response.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}