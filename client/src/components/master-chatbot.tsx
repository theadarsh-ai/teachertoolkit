import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/gradient-card";
import { X, Send, Mic, Paperclip, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eduAIService } from "@/lib/openai";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface MasterChatbotProps {
  onClose: () => void;
}

export function MasterChatbot({ onClose }: MasterChatbotProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: "Hello! I'm your Master Teaching Assistant. I can help you with content generation, lesson planning, student assessments, and more. What would you like to work on today?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    "Create Lesson Plan",
    "Generate Quiz", 
    "Analyze Performance",
    "Differentiate Materials"
  ];

  const availableAgents = [
    { name: "Content Generation", status: "active" },
    { name: "Lesson Planner", status: "active" },
    { name: "Knowledge Base", status: "active" },
    { name: "Visual Aids", status: "busy" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(messageText),
        metadata: {
          processedAgents: ["Content Generation", "Differentiated Materials"],
          confidence: 0.92
        },
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const transcript = await eduAIService.startSpeechRecognition();
      setInput(transcript);
      setIsListening(false);
      
      toast({
        title: "Voice Input Captured",
        description: "Speech converted to text successfully.",
      });
    } catch (error) {
      setIsListening(false);
      toast({
        title: "Voice Input Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('worksheet') || input.includes('quiz')) {
      return "I'll help you create differentiated materials! I'm routing your request to the **Content Generation** and **Differentiated Materials** agents.\n\n**Processing:**\n✓ Analyzing grade levels and subject matter\n✓ Generating culturally relevant examples\n✓ Creating multiple difficulty versions\n⏳ Finalizing worksheets...\n\nWould you like me to include any specific local examples or themes?";
    }
    
    if (input.includes('lesson plan')) {
      return "Perfect! I'm connecting you with the **AI Lesson Planner** agent to create a structured teaching schedule.\n\n**Current Progress:**\n✓ Analyzing curriculum requirements\n✓ Mapping learning objectives\n✓ Scheduling optimal lesson timing\n⏳ Generating weekly breakdown...\n\nWhat subject and time period are you planning for?";
    }
    
    if (input.includes('performance') || input.includes('analytics')) {
      return "I'm routing your request to the **Performance Analysis** agent for comprehensive student insights.\n\n**Analyzing:**\n✓ Recent assessment data\n✓ Learning pattern identification\n✓ Progress tracking across grades\n⏳ Generating recommendations...\n\nWould you like me to focus on specific students or the entire class?";
    }
    
    return "I understand you need assistance with teaching tasks. Let me connect you with the most suitable agent for your request. Could you provide more details about what you'd like to accomplish?";
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <i className="fas fa-robot mr-3 text-orange-400"></i>
              Master Agent
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <Card className="bg-gray-700 p-3">
              <h3 className="text-white font-medium mb-2">Available Agents</h3>
              <div className="space-y-2 text-sm">
                {availableAgents.map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between">
                    <span className="text-gray-300">{agent.name}</span>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        agent.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <span className={`text-xs ${
                        agent.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-white font-medium">Ready to assist with your teaching needs</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-900">
          <div className="space-y-6 max-w-4xl">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {message.role !== 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-3 max-w-lg ${
                  message.role === 'user' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800 text-white'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.metadata && message.metadata.processedAgents && (
                    <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center mb-2">
                        <i className="fas fa-cog text-orange-400 mr-2"></i>
                        <span className="text-orange-400 font-medium text-sm">
                          Processing with {message.metadata.processedAgents.length} agents
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {message.metadata.processedAgents.map((agent: string) => (
                          <Badge key={agent} variant="blue">
                            {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">T</span>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
                <div className="bg-gray-800 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-gray-800 border-t border-gray-700 p-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceInput}
              className={`text-gray-400 hover:text-white ${isListening ? 'text-red-400' : ''}`}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 pr-12"
                placeholder="Ask me anything about teaching, planning, or student assessment..."
                disabled={isLoading || isListening}
              />
              <Button
                onClick={() => handleSendMessage()}
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 h-8 w-8"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
            <span>Quick actions:</span>
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="bg-gray-700 hover:bg-gray-600 px-2 py-1 text-gray-300 text-xs h-6"
                disabled={isLoading}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
