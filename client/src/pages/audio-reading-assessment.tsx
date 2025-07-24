import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mic, MicOff, Upload, Play, Pause, Square, Download, 
  ArrowLeft, Volume2, FileAudio, Languages, BarChart3, 
  CheckCircle, AlertCircle, Clock, Target, TrendingUp
} from "lucide-react";
import { Link } from "wouter";

interface WordAnalysis {
  word: string;
  index: number;
  correct: boolean;
  pronunciationScore: number;
  timingMs: number;
  issues: string[];
}

interface Mistake {
  word: string;
  position: number;
  type: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
  correctPronunciation: string;
}

interface AudioAssessmentResult {
  overallScore: number;
  wordAccuracy: {
    totalWords: number;
    correctWords: number;
    incorrectWords: number;
    accuracyPercentage: number;
  };
  transcript: {
    original: string;
    detected: string;
    confidence: number;
  };
  wordAnalysis: WordAnalysis[];
  mistakes: Mistake[];
  pronunciation: {
    score: number;
    feedback: string;
    improvements: string[];
  };
  fluency: {
    score: number;
    wpm: number;
    pace: string;
    feedback: string;
  };
  comprehension: {
    score: number;
    accuracy: number;
    feedback: string;
  };
  detailedAnalysis: string;
  recommendations: string[];
  nextSteps: string[];
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

const LANGUAGES = [
  { value: "english", label: "English", flag: "🇺🇸" },
  { value: "hindi", label: "हिंदी (Hindi)", flag: "🇮🇳" },
  { value: "tamil", label: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { value: "telugu", label: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { value: "marathi", label: "मराठी (Marathi)", flag: "🇮🇳" },
  { value: "bengali", label: "বাংলা (Bengali)", flag: "🇮🇳" },
  { value: "gujarati", label: "ગુજરાતી (Gujarati)", flag: "🇮🇳" },
  { value: "kannada", label: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { value: "punjabi", label: "ਪੰਜਾਬੀ (Punjabi)", flag: "🇮🇳" },
  { value: "urdu", label: "اردو (Urdu)", flag: "🇮🇳" }
];

const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);

export default function AudioReadingAssessment() {
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedGrade, setSelectedGrade] = useState<number>(5);
  const [readingText, setReadingText] = useState("");
  const [assessmentType, setAssessmentType] = useState<"reading" | "speaking">("reading");
  
  // Recording states
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null
  });

  // Assessment states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<AudioAssessmentResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setRecording(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false
        }));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(1000); // Collect data every second
      
      setRecording(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0
      }));

      // Start timer
      timerRef.current = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);

      toast({
        title: "Recording Started",
        description: `Recording in ${LANGUAGES.find(l => l.value === selectedLanguage)?.label}`,
      });

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setRecording(prev => ({ ...prev, isPaused: true }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setRecording(prev => ({ ...prev, isPaused: false }));
      
      timerRef.current = setInterval(() => {
        setRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast({
        title: "Recording Completed",
        description: `${formatTime(recording.duration)} recorded successfully`,
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File Too Large",
          description: "Please upload a file smaller than 50MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      const audioUrl = URL.createObjectURL(file);
      setRecording(prev => ({
        ...prev,
        audioBlob: file as any,
        audioUrl
      }));

      toast({
        title: "File Uploaded",
        description: `${file.name} ready for analysis`,
      });
    }
  };

  const assessmentMutation = useMutation({
    mutationFn: async (data: {
      audioFile: Blob;
      language: string;
      grade: number;
      readingText: string;
      assessmentType: string;
    }) => {
      const formData = new FormData();
      formData.append('audio', data.audioFile, 'recording.webm');
      formData.append('language', data.language);
      formData.append('grade', data.grade.toString());
      formData.append('readingText', data.readingText);
      formData.append('assessmentType', data.assessmentType);

      const response = await fetch('/api/agents/audio-reading-assessment/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Assessment result received:", data);
      setAssessmentResult(data);
      setAnalysisProgress(100);
      setIsAnalyzing(false);
      toast({
        title: "Assessment Complete!",
        description: `Analysis completed for ${data.wordAccuracy?.totalWords || 0} words`,
      });
    },
    onError: (error) => {
      console.error("Assessment error:", error);
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : 'Analysis failed',
        variant: "destructive",
      });
    }
  });

  const runAssessment = () => {
    if (!recording.audioBlob) {
      toast({
        title: "No Audio Found",
        description: "Please record or upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    if (assessmentType === "reading" && !readingText.trim()) {
      toast({
        title: "Missing Reading Text",
        description: "Please provide the text that was read aloud",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAssessmentResult(null);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 1500);

    assessmentMutation.mutate({
      audioFile: recording.audioBlob,
      language: selectedLanguage,
      grade: selectedGrade,
      readingText: readingText,
      assessmentType: assessmentType
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-green-100 text-green-800" };
    if (score >= 80) return { label: "Good", color: "bg-blue-100 text-blue-800" };
    if (score >= 70) return { label: "Average", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const clearRecording = () => {
    setRecording({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null
    });
    setUploadedFile(null);
    setAssessmentResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
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
            <Volume2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Audio Reading Assessment
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Analyze pronunciation, fluency, and comprehension across multiple languages
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recording & Configuration Panel */}
          <div className="space-y-6">
            {/* Configuration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Languages className="w-5 h-5" />
                  <span>Assessment Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center space-x-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Grade Level</label>
                    <Select value={selectedGrade.toString()} onValueChange={(value) => setSelectedGrade(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADES.map((grade) => (
                          <SelectItem key={grade} value={grade.toString()}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Assessment Type</label>
                  <Select value={assessmentType} onValueChange={(value) => setAssessmentType(value as "reading" | "speaking")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading Assessment</SelectItem>
                      <SelectItem value="speaking">Speaking Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {assessmentType === "reading" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reading Text *</label>
                    <Textarea
                      placeholder="Enter the text that will be read aloud for assessment..."
                      value={readingText}
                      onChange={(e) => setReadingText(e.target.value)}
                      rows={4}
                      className={readingText.trim().length === 0 ? "border-red-300" : ""}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This text will be used to analyze pronunciation and accuracy word-by-word
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recording Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-5 h-5" />
                    <span>Audio Recording</span>
                  </div>
                  {recording.duration > 0 && (
                    <div className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {formatTime(recording.duration)}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Recording Controls */}
                <div className="flex justify-center space-x-4">
                  {!recording.isRecording && !recording.audioUrl ? (
                    <Button onClick={startRecording} size="lg" className="bg-red-500 hover:bg-red-600">
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : recording.isRecording ? (
                    <div className="flex space-x-2">
                      {!recording.isPaused ? (
                        <Button onClick={pauseRecording} variant="outline" size="lg">
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </Button>
                      ) : (
                        <Button onClick={resumeRecording} size="lg">
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </Button>
                      )}
                      <Button onClick={stopRecording} variant="destructive" size="lg">
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={clearRecording} variant="outline">
                        Clear
                      </Button>
                      {recording.audioUrl && (
                        <audio controls src={recording.audioUrl} className="max-w-xs" />
                      )}
                    </div>
                  )}
                </div>

                {/* Recording Status */}
                {recording.isRecording && (
                  <div className="text-center">
                    <div className="flex justify-center items-center space-x-2 text-red-600">
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                      <span className="font-medium">
                        {recording.isPaused ? "Recording Paused" : "Recording..."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Upload Option */}
                <div className="border-t pt-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Or upload an audio file</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio File
                    </Button>
                    {uploadedFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {uploadedFile.name} uploaded
                      </p>
                    )}
                  </div>
                </div>

                {/* Analysis Button */}
                {(recording.audioUrl || uploadedFile) && (
                  <Button 
                    onClick={runAssessment}
                    disabled={isAnalyzing}
                    className="w-full"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Audio...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Analyze Audio
                      </>
                    )}
                  </Button>
                )}

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="space-y-2">
                    <Progress value={analysisProgress} className="w-full" />
                    <p className="text-sm text-center text-gray-600">
                      Analyzing pronunciation, fluency, and comprehension... {analysisProgress}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {assessmentResult ? (
              <>
                {/* Overall Score Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Overall Assessment</span>
                      <div className="flex items-center space-x-2">
                        <div className={`text-3xl font-bold ${getScoreColor(assessmentResult.overallScore)}`}>
                          {assessmentResult.overallScore}%
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreBadge(assessmentResult.overallScore).color}`}>
                          {getScoreBadge(assessmentResult.overallScore).label}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>

                {/* Detailed Scores */}
                <div className="grid gap-4">
                  {/* Pronunciation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Pronunciation</span>
                        <span className={`text-xl font-bold ${getScoreColor(assessmentResult.pronunciation.score)}`}>
                          {assessmentResult.pronunciation.score}%
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-3">{assessmentResult.pronunciation.feedback}</p>
                      {assessmentResult.pronunciation.improvements.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Areas for Improvement:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {assessmentResult.pronunciation.improvements.map((improvement, index) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Fluency */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>Fluency</span>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(assessmentResult.fluency.score)}`}>
                            {assessmentResult.fluency.score}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {assessmentResult.fluency.wpm} WPM
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Pace: {assessmentResult.fluency.pace}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{assessmentResult.fluency.feedback}</p>
                    </CardContent>
                  </Card>

                  {/* Comprehension */}
                  {assessmentType === "reading" && assessmentResult.comprehension && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>Comprehension</span>
                          <span className={`text-xl font-bold ${getScoreColor(assessmentResult.comprehension.score)}`}>
                            {assessmentResult.comprehension.score}%
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span className="text-sm">Accuracy: {assessmentResult.comprehension.accuracy}%</span>
                          </div>
                        </div>
                        <p className="text-gray-600">{assessmentResult.comprehension.feedback}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Word Accuracy Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-blue-500" />
                      <span>Word Accuracy</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{assessmentResult.wordAccuracy.correctWords}</div>
                        <div className="text-sm text-gray-600">Correct Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{assessmentResult.wordAccuracy.incorrectWords}</div>
                        <div className="text-sm text-gray-600">Incorrect Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{assessmentResult.wordAccuracy.totalWords}</div>
                        <div className="text-sm text-gray-600">Total Words</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{assessmentResult.wordAccuracy.accuracyPercentage}%</div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                    </div>
                    <Progress value={assessmentResult.wordAccuracy.accuracyPercentage} className="w-full" />
                  </CardContent>
                </Card>

                {/* Transcript Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Transcript Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">Original Text:</label>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm">
                          {assessmentResult.transcript.original}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600 mb-1 block">
                          Detected Speech (Confidence: {Math.round(assessmentResult.transcript.confidence)}%):
                        </label>
                        <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-sm">
                          {assessmentResult.transcript.detected}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mistakes and Corrections */}
                {assessmentResult.mistakes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span>Identified Mistakes ({assessmentResult.mistakes.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assessmentResult.mistakes.map((mistake, index) => (
                          <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            mistake.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            mistake.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                            'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">"{mistake.word}"</span>
                                <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                  Position {mistake.position}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  mistake.severity === 'high' ? 'bg-red-200 text-red-800' :
                                  mistake.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                  'bg-blue-200 text-blue-800'
                                }`}>
                                  {mistake.severity}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong>Issue:</strong> {mistake.type}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <strong>Correct pronunciation:</strong> {mistake.correctPronunciation}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              <strong>Suggestion:</strong> {mistake.suggestion}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Word-by-Word Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Word-by-Word Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 max-h-64 overflow-y-auto">
                      {assessmentResult.wordAnalysis.map((word, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 rounded ${
                          word.correct ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-500 w-8">#{word.index}</span>
                            <span className="font-medium">{word.word}</span>
                            {word.correct ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{word.pronunciationScore}%</span>
                            {word.issues.length > 0 && (
                              <div className="flex space-x-1">
                                {word.issues.map((issue, i) => (
                                  <span key={i} className="text-xs bg-red-200 text-red-800 px-1 py-0.5 rounded">
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-line">{assessmentResult.detailedAnalysis}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span>Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Immediate Actions:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {assessmentResult.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Next Steps:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {assessmentResult.nextSteps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button onClick={() => window.print()} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button onClick={clearRecording} variant="outline" className="flex-1">
                    New Assessment
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileAudio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for Assessment</h3>
                  <p className="text-gray-600">
                    Record or upload an audio file to begin comprehensive analysis of pronunciation, fluency, and comprehension across multiple languages.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}