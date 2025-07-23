import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, Clock, BookOpen, Target, Users, TrendingUp,
  Plus, Edit3, Trash2, Download, Share2, ChevronRight,
  CheckCircle, AlertCircle, BarChart3, FileText, Sparkles
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface WeeklyPlan {
  id: string;
  title: string;
  grade: number;
  subject: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  objectives: string[];
  dailyLessons: DailyLesson[];
  assessments: Assessment[];
  resources: string[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  ncertAlignment?: NCERTAlignment;
}

interface DailyLesson {
  day: string;
  topic: string;
  duration: number;
  activities: string[];
  materials: string[];
  objectives: string[];
  homework: string;
  notes: string;
  ncertReference?: string;
}

interface NCERTAlignment {
  textbooks: NCERTTextbook[];
  chapters: string;
  learningOutcomes: string;
}

interface NCERTTextbook {
  title: string;
  language: string;
  pdfUrl: string;
}

interface Assessment {
  type: 'quiz' | 'assignment' | 'project' | 'test';
  title: string;
  description: string;
  dueDate: string;
  points: number;
}

interface PlanConfig {
  subject: string;
  grade: number;
  curriculum: string;
  weekNumber: number;
  focusAreas: string[];
  lessonDuration: number;
  selectedLessons: NCERTLesson[];
}

interface NCERTLesson {
  id: string;
  title: string;
  chapter: string;
  subject: string;
  grade: number;
  textbookTitle: string;
  pdfUrl?: string;
  content?: string;
}

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Hindi', 'Social Science',
  'Sanskrit', 'Computer Science', 'Art & Craft', 'Physical Education',
  'Environmental Science', 'Moral Science'
];

const CURRICULUM_OPTIONS = [
  'CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function LessonPlanner() {
  const [activeTab, setActiveTab] = useState('create');
  const [planConfig, setPlanConfig] = useState<PlanConfig>({
    subject: '',
    grade: 1,
    curriculum: 'CBSE',
    weekNumber: 1,
    focusAreas: [],
    lessonDuration: 40,
    selectedLessons: []
  });
  const [selectedPlan, setSelectedPlan] = useState<WeeklyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [focusAreaInput, setFocusAreaInput] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [availableLessons, setAvailableLessons] = useState<NCERTLesson[]>([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing lesson plans
  const { data: lessonPlans = [], isLoading } = useQuery<WeeklyPlan[]>({
    queryKey: ['/api/agents/lesson-planner/plans'],
    enabled: activeTab === 'view'
  });

  // Generate lesson plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async (config: PlanConfig) => {
      const response = await fetch('/api/agents/lesson-planner/generate-weekly-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result as { success: boolean; plan: WeeklyPlan };
    },
    onSuccess: (data) => {
      if (data.success && data.plan) {
        toast({
          title: "Weekly Plan Generated!",
          description: `Created comprehensive lesson plan for Grade ${planConfig.grade} ${planConfig.subject}`,
        });
        setSelectedPlan(data.plan);
        setActiveTab('view');
        queryClient.invalidateQueries({ queryKey: ['/api/agents/lesson-planner/plans'] });
      } else {
        throw new Error('Invalid response format');
      }
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Unable to generate lesson plan. Please try again.",
        variant: "destructive"
      });
    }
  });

  // PDF generation mutation
  const generatePDFMutation = useMutation({
    mutationFn: async (plan: WeeklyPlan) => {
      const response = await fetch('/api/agents/lesson-planner/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "PDF Generated Successfully!",
          description: "Your lesson plan PDF is ready for download",
        });
        
        // Trigger download
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setIsGeneratingPDF(false);
    },
    onError: (error) => {
      toast({
        title: "PDF Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate PDF",
        variant: "destructive",
      });
      setIsGeneratingPDF(false);
    }
  });

  const handleDownloadPDF = () => {
    if (selectedPlan) {
      setIsGeneratingPDF(true);
      generatePDFMutation.mutate(selectedPlan);
    }
  };

  // Load NCERT lessons when subject or grade changes
  const loadNCERTLessons = async (subject: string, grade: number) => {
    if (!subject || !grade) return;
    
    setIsLoadingLessons(true);
    try {
      const response = await fetch(`/api/ncert/lessons?subject=${encodeURIComponent(subject)}&grade=${grade}`);
      if (response.ok) {
        const lessons = await response.json();
        setAvailableLessons(lessons);
      } else {
        console.error('Failed to load NCERT lessons');
        setAvailableLessons([]);
      }
    } catch (error) {
      console.error('Error loading NCERT lessons:', error);
      setAvailableLessons([]);
    } finally {
      setIsLoadingLessons(false);
    }
  };

  // Load lessons when subject or grade changes
  const handleSubjectOrGradeChange = (newConfig: Partial<PlanConfig>) => {
    setPlanConfig(prev => {
      const updated = { ...prev, ...newConfig };
      
      // Clear selected lessons when subject or grade changes
      if (newConfig.subject !== undefined || newConfig.grade !== undefined) {
        updated.selectedLessons = [];
        
        // Load new lessons
        if (updated.subject && updated.grade) {
          loadNCERTLessons(updated.subject, updated.grade);
        }
      }
      
      return updated;
    });
  };

  // Toggle lesson selection
  const toggleLessonSelection = (lesson: NCERTLesson) => {
    setPlanConfig(prev => ({
      ...prev,
      selectedLessons: prev.selectedLessons.some(l => l.id === lesson.id)
        ? prev.selectedLessons.filter(l => l.id !== lesson.id)
        : [...prev.selectedLessons, lesson]
    }));
  };

  const handleGeneratePlan = async () => {
    if (!planConfig.subject) {
      toast({
        title: "Missing Information",
        description: "Please select a subject to generate lesson plan",
        variant: "destructive"
      });
      return;
    }

    if (planConfig.selectedLessons.length === 0) {
      toast({
        title: "No Lessons Selected",
        description: "Please select at least one NCERT lesson to include in your plan",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generatePlanMutation.mutate(planConfig);
    setIsGenerating(false);
  };

  const addFocusArea = () => {
    if (focusAreaInput.trim() && !planConfig.focusAreas.includes(focusAreaInput.trim())) {
      setPlanConfig(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, focusAreaInput.trim()]
      }));
      setFocusAreaInput('');
    }
  };

  const removeFocusArea = (area: string) => {
    setPlanConfig(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter(a => a !== area)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl mb-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Lesson Planner</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create comprehensive weekly lesson plans tailored to your curriculum and grade level
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Plan</span>
            </TabsTrigger>
            <TabsTrigger value="view" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>My Plans</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Create Plan Tab */}
          <TabsContent value="create">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuration Panel */}
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Plan Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                      <Select 
                        value={planConfig.subject} 
                        onValueChange={(value) => handleSubjectOrGradeChange({ subject: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Grade Level</label>
                      <Select 
                        value={planConfig.grade.toString()} 
                        onValueChange={(value) => handleSubjectOrGradeChange({ grade: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                            <SelectItem key={grade} value={grade.toString()}>Grade {grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Curriculum</label>
                      <Select 
                        value={planConfig.curriculum} 
                        onValueChange={(value) => setPlanConfig(prev => ({...prev, curriculum: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRICULUM_OPTIONS.map(curriculum => (
                            <SelectItem key={curriculum} value={curriculum}>{curriculum}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Week Number</label>
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={planConfig.weekNumber}
                        onChange={(e) => setPlanConfig(prev => ({...prev, weekNumber: parseInt(e.target.value) || 1}))}
                      />
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Duration (minutes)</label>
                      <Input
                        type="number"
                        min="30"
                        max="90"
                        value={planConfig.lessonDuration}
                        onChange={(e) => setPlanConfig(prev => ({...prev, lessonDuration: parseInt(e.target.value) || 40}))}
                      />
                    </div>


                  </div>

                  {/* Focus Areas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas</label>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        placeholder="Enter focus area (e.g., Problem Solving, Critical Thinking)"
                        value={focusAreaInput}
                        onChange={(e) => setFocusAreaInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addFocusArea()}
                      />
                      <Button onClick={addFocusArea} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {planConfig.focusAreas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                          <span>{area}</span>
                          <button onClick={() => removeFocusArea(area)} className="ml-1 hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* NCERT Lesson Selection */}
                  {planConfig.subject && planConfig.grade && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        📖 Select NCERT Lessons ({planConfig.selectedLessons.length} selected)
                      </label>
                      {isLoadingLessons ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Loading NCERT lessons...</p>
                        </div>
                      ) : availableLessons.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                          <div className="space-y-2">
                            {availableLessons.map((lesson) => (
                              <div key={lesson.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-white transition-colors">
                                <input
                                  type="checkbox"
                                  id={`lesson-${lesson.id}`}
                                  checked={planConfig.selectedLessons.some(l => l.id === lesson.id)}
                                  onChange={() => toggleLessonSelection(lesson)}
                                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`lesson-${lesson.id}`} className="flex-1 cursor-pointer">
                                  <div className="font-medium text-gray-800">{lesson.title}</div>
                                  <div className="text-sm text-gray-600">Chapter: {lesson.chapter}</div>
                                  <div className="text-xs text-gray-500">{lesson.textbookTitle}</div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No NCERT lessons found for {planConfig.subject} Grade {planConfig.grade}</p>
                          <p className="text-xs">Lessons will be loaded from NCERT textbooks when available</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Button 
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || !planConfig.subject}
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold py-3 rounded-xl shadow-lg"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating Plan...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Weekly Plan</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview Panel */}
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="w-5 h-5" />
                    <span>Plan Preview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedPlan ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{selectedPlan.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Grade {selectedPlan.grade}</span>
                          <span>•</span>
                          <span>{selectedPlan.subject}</span>
                          <span>•</span>
                          <span>Week {selectedPlan.weekNumber}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Learning Objectives</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                          {selectedPlan.objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Daily Schedule</h4>
                        <div className="space-y-2">
                          {selectedPlan.dailyLessons.map((lesson, index) => (
                            <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">{lesson.day}</span>
                                <span className="text-sm text-gray-600">{lesson.duration} min</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{lesson.topic}</p>
                              {lesson.ncertReference && (
                                <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mt-2">
                                  📖 NCERT: {lesson.ncertReference}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedPlan.ncertAlignment && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">📖 NCERT Alignment</h4>
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
                            {selectedPlan.ncertAlignment.textbooks.length > 0 && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">Referenced Textbooks:</p>
                                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                                  {selectedPlan.ncertAlignment.textbooks.map((book, index) => (
                                    <li key={index}>{book.title} ({book.language})</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {selectedPlan.ncertAlignment.chapters && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-700">Chapters:</p>
                                <p className="text-xs text-gray-600">{selectedPlan.ncertAlignment.chapters}</p>
                              </div>
                            )}
                            {selectedPlan.ncertAlignment.learningOutcomes && (
                              <div>
                                <p className="text-sm font-medium text-gray-700">Learning Outcomes:</p>
                                <p className="text-xs text-gray-600">{selectedPlan.ncertAlignment.learningOutcomes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={handleDownloadPDF}
                          disabled={isGeneratingPDF}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Configure your lesson plan settings and click "Generate Weekly Plan" to see the preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* View Plans Tab */}
          <TabsContent value="view">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>My Lesson Plans</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading lesson plans...</p>
                  </div>
                ) : lessonPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessonPlans.map((plan) => (
                      <div key={plan.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-gray-800 line-clamp-2">{plan.title}</h3>
                          <Badge className={getStatusColor(plan.status)}>{plan.status}</Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>{plan.subject} - Grade {plan.grade}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Week {plan.weekNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{plan.dailyLessons.length} lessons</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" className="flex-1">
                            <ChevronRight className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No lesson plans created yet</p>
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span>Plans Created</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">
                    {lessonPlans.length}
                  </div>
                  <p className="text-sm text-gray-600">Total lesson plans</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span>Completed</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">
                    {lessonPlans.filter(p => p.status === 'completed').length}
                  </div>
                  <p className="text-sm text-gray-600">Completed plans</p>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    <span>In Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800">
                    {lessonPlans.filter(p => p.status === 'active').length}
                  </div>
                  <p className="text-sm text-gray-600">Active plans</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}