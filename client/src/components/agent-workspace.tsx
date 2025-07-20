import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Send, Mic, Upload, Download, Sparkles, MicOff } from "lucide-react";
import { type Agent } from "@/types/agents";
import { useToast } from "@/hooks/use-toast";
import { eduAIService } from "@/lib/openai";

interface AgentWorkspaceProps {
  agent: Agent;
  configuration: {
    grades: number[];
    languages: string[];
    contentSource: 'prebook' | 'external';
  };
  onClose: () => void;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
}

export function AgentWorkspace({ agent, configuration, onClose }: AgentWorkspaceProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const getAgentWorkflow = () => {
    switch (agent.id) {
      case 'content-generation':
        return [
          { id: '1', name: 'Processing Language Preferences', status: 'pending' as const },
          { id: '2', name: 'Analyzing Cultural Context', status: 'pending' as const },
          { id: '3', name: 'Generating Content', status: 'pending' as const },
          { id: '4', name: 'Applying Grade-Level Adaptations', status: 'pending' as const },
        ];
      case 'differentiated-materials':
        return [
          { id: '1', name: 'Analyzing Source Material', status: 'pending' as const },
          { id: '2', name: 'Determining Complexity Levels', status: 'pending' as const },
          { id: '3', name: 'Creating Grade Variations', status: 'pending' as const },
          { id: '4', name: 'Formatting Materials', status: 'pending' as const },
        ];
      case 'lesson-planner':
        return [
          { id: '1', name: 'Curriculum Analysis', status: 'pending' as const },
          { id: '2', name: 'Learning Objective Mapping', status: 'pending' as const },
          { id: '3', name: 'Activity Planning', status: 'pending' as const },
          { id: '4', name: 'Assessment Integration', status: 'pending' as const },
        ];
      default:
        return [
          { id: '1', name: 'Initializing Agent', status: 'pending' as const },
          { id: '2', name: 'Processing Request', status: 'pending' as const },
          { id: '3', name: 'Generating Results', status: 'pending' as const },
        ];
    }
  };

  useEffect(() => {
    setWorkflow(getAgentWorkflow());
  }, [agent.id]);

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const language = configuration.languages.length > 0 ? 
        configuration.languages[0] === 'Hindi' ? 'hi-IN' : 'en-US' : 'en-US';
      
      const transcript = await eduAIService.startSpeechRecognition(language);
      setPrompt(transcript);
      setIsListening(false);
      
      toast({
        title: "Voice Input Captured",
        description: "Speech converted to text successfully.",
      });
    } catch (error) {
      setIsListening(false);
      toast({
        title: "Voice Input Error",
        description: error instanceof Error ? error.message : "Voice input failed",
        variant: "destructive",
      });
    }
  };

  const simulateWorkflow = async () => {
    setProgress(0);
    const steps = [...workflow];
    
    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'processing';
      setWorkflow([...steps]);
      setProgress((i / steps.length) * 100);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      steps[i].status = 'completed';
      setWorkflow([...steps]);
    }
    
    setProgress(100);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter a prompt or upload content to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    await simulateWorkflow();

    try {
      let result;
      
      switch (agent.id) {
        case 'content-generation':
          result = await eduAIService.generateContent({
            prompt,
            grades: configuration.grades,
            languages: configuration.languages,
            contentSource: configuration.contentSource
          });
          break;
          
        case 'differentiated-materials':
          result = await eduAIService.createDifferentiatedMaterials(prompt, configuration.grades);
          break;
          
        case 'lesson-planner':
          result = await eduAIService.createLessonPlan(
            prompt, 
            configuration.grades, 
            "4 weeks"
          );
          break;
          
        case 'visual-aids':
          result = await eduAIService.generateVisualAids(prompt, configuration.grades);
          break;
          
        case 'performance-analysis':
          result = await eduAIService.analyzePerformance(
            { subject: prompt, grades: configuration.grades }, 
            configuration.grades
          );
          break;
          
        default:
          result = await eduAIService.generateContent({
            prompt,
            grades: configuration.grades,
            languages: configuration.languages,
            contentSource: configuration.contentSource
          });
      }

      setResults(prev => [result, ...prev]);
      setPrompt("");
      
      toast({
        title: "Content Generated!",
        description: `${agent.name} has successfully processed your request.`,
      });
      
    } catch (error) {
      toast({
        title: "Generation Error",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setPrompt(`Uploaded file: ${file.name}`);
      toast({
        title: "File Uploaded",
        description: `${file.name} is ready for processing.`,
      });
    }
  };

  const downloadResult = (result: any, format: 'txt' | 'json' = 'txt') => {
    const content = format === 'json' ? JSON.stringify(result, null, 2) : result.content;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.id}-result.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${agent.color} rounded-lg flex items-center justify-center`}>
                  <i className={`${agent.icon} text-white`}></i>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{agent.name}</h2>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Configuration Display */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Grades:</span>
              {configuration.grades.map(grade => (
                <Badge key={grade} variant="blue">Grade {grade}</Badge>
              ))}
            </div>
            {configuration.languages.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-600">Languages:</span>
                {configuration.languages.map(lang => (
                  <Badge key={lang} variant="green">{lang}</Badge>
                ))}
              </div>
            )}
            <Badge variant={configuration.contentSource === 'prebook' ? 'blue' : 'emerald'}>
              {configuration.contentSource === 'prebook' ? 'NCERT Books' : 'External Sources'}
            </Badge>
          </div>
        </CardHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Input */}
          <div className="w-1/2 border-r flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-4">
                <TabsTrigger value="generate">Generate</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <TabsContent value="generate" className="mt-0 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Describe what you want to create:
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={`Example: Create a lesson about photosynthesis for ${configuration.grades.length > 1 ? 'multi-grade' : `grade ${configuration.grades[0]}`} students${configuration.languages.length > 0 ? ` in ${configuration.languages.join(' and ')}` : ''}...`}
                      className="min-h-32"
                      disabled={isProcessing}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleVoiceInput}
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      className={isListening ? 'text-red-600' : ''}
                    >
                      {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isListening ? 'Stop' : 'Voice Input'}
                    </Button>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={isProcessing || !prompt.trim()}
                      className="flex-1"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Generating...' : 'Generate Content'}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="mt-0 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Upload content to adapt:
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt,.csv"
                        className="hidden"
                        id="file-upload"
                        disabled={isProcessing}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          Click to upload PDF, DOC, TXT, or CSV files
                        </p>
                      </label>
                      {uploadedFile && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <strong>File:</strong> {uploadedFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-0">
                  <div className="space-y-2">
                    {results.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No generated content yet</p>
                    ) : (
                      results.map((result, index) => (
                        <Card key={index} className="p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {result.agentType || agent.id} - {new Date().toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {result.content?.substring(0, 100)}...
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadResult(result)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right Panel - Progress & Results */}
          <div className="w-1/2 flex flex-col">
            {/* Workflow Progress */}
            <div className="p-4 border-b">
              <h3 className="font-semibold mb-3">Processing Workflow</h3>
              <Progress value={progress} className="mb-3" />
              <div className="space-y-2">
                {workflow.map((step) => (
                  <div key={step.id} className="flex items-center space-x-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${
                      step.status === 'completed' ? 'bg-green-500' :
                      step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                      step.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                    }`}></div>
                    <span className={step.status === 'completed' ? 'text-green-700' : ''}>{step.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 p-4 overflow-y-auto">
              <h3 className="font-semibold mb-3">Generated Content</h3>
              {results.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated content will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Result #{results.length - index}</h4>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => downloadResult(result, 'txt')}>
                            <Download className="h-4 w-4 mr-1" />
                            TXT
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => downloadResult(result, 'json')}>
                            <Download className="h-4 w-4 mr-1" />
                            JSON
                          </Button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-3 text-sm">
                        <pre className="whitespace-pre-wrap">
                          {typeof result.content === 'string' ? result.content : JSON.stringify(result.content, null, 2)}
                        </pre>
                      </div>
                      {result.metadata && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <Badge key={key} variant="gray">
                              {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}