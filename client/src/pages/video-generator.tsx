import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Video, 
  Play, 
  Download, 
  Clock, 
  Users, 
  Monitor,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Gamepad2,
  FlaskConical,
  Globe,
  Calculator
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

interface VideoGenerationRequest {
  prompt: string;
  grade: number;
  subject: string;
  duration: string;
  aspectRatio: string;
  style: string;
}

interface GeneratedVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  subject: string;
  grade: number;
  generatedAt: Date;
  status: 'generating' | 'completed' | 'failed';
}

// Hard-coded video suggestions for different subjects
const VIDEO_SUGGESTIONS = {
  Science: [
    "Water cycle process with animated clouds, rain, and evaporation",
    "Solar system planets orbiting around the sun with labels",
    "Photosynthesis in plants showing chloroplasts and sunlight",
    "Human digestive system with food journey animation",
    "States of matter - solid, liquid, gas transformation"
  ],
  Mathematics: [
    "Fraction visualization with pizza slices and parts",
    "Geometric shapes transformation and area calculation",
    "Number line addition and subtraction with moving objects",
    "Multiplication tables with visual counting objects",
    "Coordinate geometry plotting points on graph"
  ],
  History: [
    "Ancient Indian civilization timeline with monuments",
    "Freedom struggle heroes and important events",
    "Mughal empire expansion and architecture",
    "Independence movement with key dates and leaders",
    "Traditional Indian arts and cultural heritage"
  ],
  Geography: [
    "Mountain formation and tectonic plate movement",
    "River systems and watershed in Indian subcontinent",
    "Climate zones and monsoon patterns in India",
    "Rock cycle with igneous, sedimentary, metamorphic rocks",
    "Agriculture practices across different Indian states"
  ],
  English: [
    "Story narration with animated characters and scenes",
    "Grammar rules with interactive examples and exercises",
    "Poetry recitation with visual metaphors and imagery",
    "Vocabulary building with word associations",
    "Reading comprehension with visual story elements"
  ]
};

export default function VideoGenerator() {
  const { toast } = useToast();
  const [videoConfig, setVideoConfig] = useState<VideoGenerationRequest>({
    prompt: '',
    grade: 5,
    subject: 'Science',
    duration: '2-3 minutes',
    aspectRatio: '16:9',
    style: 'Educational Animation'
  });
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null);

  // Video generation mutation using the backend API
  const generateVideoMutation = useMutation({
    mutationFn: async (config: VideoGenerationRequest) => {
      const response = await apiRequest("/api/agents/video-generator/generate", {
        method: "POST",
        body: JSON.stringify(config),
      });
      
      if (!response.success) {
        throw new Error(response.error || 'Video generation failed');
      }
      
      return response.video;
    },
    onSuccess: (video) => {
      setGeneratedVideos(prev => [video, ...prev]);
      setCurrentVideo(video);
      toast({
        title: "Video Generated Successfully!",
        description: `Your ${video.subject} video is ready for Grade ${video.grade}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Video Generation Failed",
        description: "Please check your Vertex AI configuration and try again.",
        variant: "destructive",
      });
    }
  });

  const handleGenerateVideo = () => {
    if (!videoConfig.prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your video",
        variant: "destructive",
      });
      return;
    }
    generateVideoMutation.mutate(videoConfig);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setVideoConfig(prev => ({ ...prev, prompt: suggestion }));
    toast({
      title: "Suggestion Applied",
      description: "You can modify this prompt before generating the video",
    });
  };

  const subjectIcons = {
    Science: FlaskConical,
    Mathematics: Calculator,
    History: BookOpen,
    Geography: Globe,
    English: Sparkles
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
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
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI Video Generator</h1>
                <p className="text-gray-600">Create educational videos with Google Veo 3.0</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            Powered by Vertex AI
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>Video Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Select 
                      value={videoConfig.subject} 
                      onValueChange={(value) => setVideoConfig(prev => ({ ...prev, subject: value }))}
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="grade">Grade Level</Label>
                    <Select 
                      value={videoConfig.grade.toString()} 
                      onValueChange={(value) => setVideoConfig(prev => ({ ...prev, grade: parseInt(value) }))}
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
                </div>

                {/* Advanced Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Select 
                      value={videoConfig.duration} 
                      onValueChange={(value) => setVideoConfig(prev => ({ ...prev, duration: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 minutes">1-2 minutes</SelectItem>
                        <SelectItem value="2-3 minutes">2-3 minutes</SelectItem>
                        <SelectItem value="3-5 minutes">3-5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                    <Select 
                      value={videoConfig.aspectRatio} 
                      onValueChange={(value) => setVideoConfig(prev => ({ ...prev, aspectRatio: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                        <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="style">Video Style</Label>
                    <Select 
                      value={videoConfig.style} 
                      onValueChange={(value) => setVideoConfig(prev => ({ ...prev, style: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Educational Animation">Educational Animation</SelectItem>
                        <SelectItem value="Realistic Simulation">Realistic Simulation</SelectItem>
                        <SelectItem value="Cartoon Style">Cartoon Style</SelectItem>
                        <SelectItem value="Documentary Style">Documentary Style</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Video Prompt */}
                <div>
                  <Label htmlFor="prompt">Video Description</Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe what you want in your educational video. Be specific about the concepts, visual elements, and educational objectives..."
                    value={videoConfig.prompt}
                    onChange={(e) => setVideoConfig(prev => ({ ...prev, prompt: e.target.value }))}
                    className="min-h-[120px] resize-none"
                  />
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={handleGenerateVideo}
                  disabled={generateVideoMutation.isPending || !videoConfig.prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                >
                  {generateVideoMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5 mr-2" />
                      Generate Educational Video
                    </>
                  )}
                </Button>

                {generateVideoMutation.isPending && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-medium">Video Generation in Progress</span>
                    </div>
                    <p className="text-sm text-blue-600 mt-1">
                      Using Google Veo 3.0 to create your educational video. This may take a few minutes...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generated Video Preview */}
            {currentVideo && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Play className="w-5 h-5 text-green-600" />
                      <span>Generated Video</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Ready
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Video Preview</p>
                        <p className="text-sm text-gray-500">{currentVideo.title}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{currentVideo.title}</h3>
                        <p className="text-sm text-gray-600">{currentVideo.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
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
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>Video Ideas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {VIDEO_SUGGESTIONS[videoConfig.subject as keyof typeof VIDEO_SUGGESTIONS]?.map((suggestion, index) => {
                    const IconComponent = subjectIcons[videoConfig.subject as keyof typeof subjectIcons];
                    return (
                      <div 
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors border border-gray-200 hover:border-blue-300"
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 leading-relaxed">{suggestion}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Video Library */}
            {generatedVideos.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-purple-600" />
                    <span>My Videos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {generatedVideos.slice(0, 5).map((video) => (
                      <div 
                        key={video.id}
                        onClick={() => setCurrentVideo(video)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {video.subject} - Grade {video.grade}
                            </h4>
                            <p className="text-xs text-gray-600">{video.duration}</p>
                          </div>
                          <Badge 
                            variant={video.status === 'completed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {video.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro Tips */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-orange-700 space-y-2">
                <p>• Be specific about visual elements and educational concepts</p>
                <p>• Include grade-appropriate language and examples</p>
                <p>• Mention if you want labels, text, or narration</p>
                <p>• Consider cultural context for Indian students</p>
                <p>• Videos work best with clear learning objectives</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}