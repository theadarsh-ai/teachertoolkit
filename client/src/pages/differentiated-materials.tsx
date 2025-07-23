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
import { AlertCircle, BookOpen, Download, FileText, Globe, GraduationCap, Upload, ArrowLeft, CheckCircle, Layers, Camera, FileImage, List } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface DifferentiatedMaterialsRequest {
  sourceContent?: string;
  uploadedImage?: File;
  grades: number[];
  questionType: 'multiple-choice' | 'worksheet';
  questionCount: number;
  userId?: number;
  generatePDF?: boolean;
}

interface DifferentiatedMaterialsResponse {
  success: boolean;
  message: string;
  materials: {
    questions: any[];
    answers: any[];
  };
  pdf?: {
    questionsFile: string;
    answersFile: string;
    questionsDownloadUrl: string;
    answersDownloadUrl: string;
  };
}

export default function DifferentiatedMaterials() {
  const [sourceContent, setSourceContent] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'worksheet'>('multiple-choice');
  const [questionCount, setQuestionCount] = useState(25);
  const [inputMode, setInputMode] = useState<'text' | 'upload'>('text');
  const [generatedMaterials, setGeneratedMaterials] = useState<DifferentiatedMaterialsResponse | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const generateMaterialsMutation = useMutation({
    mutationFn: async (request: DifferentiatedMaterialsRequest): Promise<DifferentiatedMaterialsResponse> => {
      const formData = new FormData();
      
      if (request.uploadedImage) {
        formData.append('uploadedImage', request.uploadedImage);
      }
      if (request.sourceContent) {
        formData.append('sourceContent', request.sourceContent);
      }
      formData.append('grades', JSON.stringify(request.grades));
      formData.append('questionType', request.questionType);
      formData.append('questionCount', request.questionCount.toString());
      formData.append('userId', (request.userId || 1).toString());
      formData.append('generatePDF', 'true');

      const response = await fetch('/api/agents/differentiated-materials', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Material generation failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log('🎯 Generated materials response:', data);
      console.log('🎯 PDF data:', data.pdf);
      console.log('🎯 Download URLs:', {
        questions: data.pdf?.questionsDownloadUrl,  
        answers: data.pdf?.answersDownloadUrl
      });
      setGeneratedMaterials(data);
      setGenerationProgress(100);
      toast({
        title: "Materials Generated Successfully!",
        description: `Created ${questionCount} questions with answer key`,
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploadedImage(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        
        toast({
          title: "Image Uploaded",
          description: `${file.name} ready for processing`,
        });
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleDownload = async (downloadUrl: string, filename: string) => {
    try {
      console.log('🎯 Attempting download:', downloadUrl);
      
      // Method 1: Try direct window.open
      window.open(downloadUrl, '_blank');
      
      // Method 2: Fallback fetch approach
      setTimeout(async () => {
        try {
          const response = await fetch(downloadUrl);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            console.log('✅ Download successful via fetch method');
          }
        } catch (fetchError) {
          console.error('❌ Fetch download failed:', fetchError);
          toast({
            title: "Download Failed",
            description: "Unable to download file. Please try again.",
            variant: "destructive",
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Download error:', error);
      toast({
        title: "Download Failed", 
        description: "Unable to download file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerate = () => {
    if (inputMode === 'text' && !sourceContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter content or upload an image to generate materials from",
        variant: "destructive",
      });
      return;
    }

    if (inputMode === 'upload' && !uploadedImage) {
      toast({
        title: "Missing Information", 
        description: "Please upload a textbook page image",
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
    setGeneratedMaterials(null);
    
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

    generateMaterialsMutation.mutate({
      sourceContent: inputMode === 'text' ? sourceContent : undefined,
      uploadedImage: inputMode === 'upload' ? uploadedImage : undefined,
      grades: selectedGrades,
      questionType,
      questionCount,
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

  const availableGrades = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-emerald-900">
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
          <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Differentiated Materials Generator
            </h1>
            <p className="text-muted-foreground">
              Create multiple choice worksheets from textbook pages or content - tailored for different grade levels
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Material Configuration</span>
              </CardTitle>
              <CardDescription>
                Upload a textbook page or enter content to generate differentiated worksheets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Mode Selection */}
              <div className="space-y-3">
                <Label>Input Method</Label>
                <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as 'text' | 'upload')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text" className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Text Content</span>
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>Upload Image</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Content Input */}
              {inputMode === 'text' ? (
                <div className="space-y-2">
                  <Label htmlFor="sourceContent">Source Content</Label>
                  <Textarea
                    id="sourceContent"
                    placeholder="Enter the textbook content, lesson text, or educational material you want to create worksheets from..."
                    value={sourceContent}
                    onChange={(e) => setSourceContent(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Upload Textbook Page</Label>
                  <div className="border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg p-6">
                    <div className="text-center">
                      <FileImage className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to upload or drag and drop a textbook page image
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports JPG, PNG, WebP up to 10MB
                        </p>
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button asChild className="mt-4">
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Image
                          </span>
                        </Button>
                      </Label>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium">Image Preview</span>
                        </div>
                        <img 
                          src={imagePreview} 
                          alt="Uploaded textbook page" 
                          className="max-h-48 mx-auto rounded border"
                        />
                        <p className="text-xs text-center text-gray-500 mt-2">
                          {uploadedImage?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

              {/* Worksheet Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select value={questionType} onValueChange={(value) => setQuestionType(value as 'multiple-choice' | 'worksheet')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice Questions</SelectItem>
                      <SelectItem value="worksheet">Mixed Worksheet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Number of Questions</Label>
                  <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 Questions</SelectItem>
                      <SelectItem value="15">15 Questions</SelectItem>
                      <SelectItem value="20">20 Questions</SelectItem>
                      <SelectItem value="25">25 Questions</SelectItem>
                      <SelectItem value="30">30 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generation Progress */}
              {generationProgress > 0 && generationProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating Worksheets...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generateMaterialsMutation.isPending}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {generateMaterialsMutation.isPending ? (
                  <>
                    <Layers className="w-4 h-4 mr-2 animate-spin" />
                    Generating Materials...
                  </>
                ) : (
                  <>
                    <Layers className="w-4 h-4 mr-2" />
                    Generate Differentiated Worksheets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <List className="w-5 h-5" />
                <span>Generated Materials</span>
              </CardTitle>
              <CardDescription>
                Download your differentiated worksheets and answer keys
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!generatedMaterials ? (
                <div className="text-center py-12">
                  <List className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No Materials Generated Yet</h3>
                  <p className="text-muted-foreground">
                    Upload an image or enter content, then click "Generate Differentiated Worksheets"
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Success Alert */}
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {generatedMaterials.message}
                    </AlertDescription>
                  </Alert>

                  {/* PDF Downloads */}
                  {generatedMaterials.pdf && (
                    <div className="space-y-4">
                      {/* Questions PDF */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-blue-800 dark:text-blue-200">Question Paper</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                {questionCount} {questionType === 'multiple-choice' ? 'multiple choice questions' : 'mixed questions'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleDownload(
                              generatedMaterials.pdf.questionsDownloadUrl, 
                              generatedMaterials.pdf.questionsFile || 'questions.pdf'
                            )}
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>

                      {/* Answers PDF */}
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-full">
                              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-emerald-800 dark:text-emerald-200">Answer Key</p>
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                Complete solutions and explanations
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => handleDownload(
                              generatedMaterials.pdf.answersDownloadUrl,
                              generatedMaterials.pdf.answersFile || 'answers.pdf'
                            )}
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Generation Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div>
                      <strong>Grades:</strong> {selectedGrades.join(', ')}
                    </div>
                    <div>
                      <strong>Question Type:</strong> {questionType === 'multiple-choice' ? 'Multiple Choice' : 'Mixed Worksheet'}
                    </div>
                    <div>
                      <strong>Input Method:</strong> {inputMode === 'text' ? 'Text Content' : 'Image Upload'}
                    </div>
                    <div>
                      <strong>AI Model:</strong> Gemini 2.5 Pro (Multimodal)
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
            <CardTitle>Differentiated Materials Features</CardTitle>
            <CardDescription>
              Powered by Gemini AI with multimodal image processing capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-start space-x-3">
                <Camera className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-medium">Image Processing</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload textbook pages for instant analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Layers className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-medium">Multi-Grade Adaptation</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically adjust difficulty levels
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <List className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-medium">Multiple Choice Questions</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate 10-30 questions with answer keys
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Download className="w-5 h-5 text-orange-600 mt-1" />
                <div>
                  <h4 className="font-medium">Separate PDFs</h4>
                  <p className="text-sm text-muted-foreground">
                    Questions and answers in separate files
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