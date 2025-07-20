import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/gradient-card";
import { X, Book, Cloud } from "lucide-react";
import { type Agent, GRADES, SUPPORTED_LANGUAGES } from "@/types/agents";
import { useToast } from "@/hooks/use-toast";

interface AgentConfigModalProps {
  agent: Agent;
  onClose: () => void;
  onLaunch?: (config: {
    grades: number[];
    languages: string[];
    contentSource: 'prebook' | 'external';
  }) => void;
}

export function AgentConfigModal({ agent, onClose, onLaunch }: AgentConfigModalProps) {
  const { toast } = useToast();
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [contentSource, setContentSource] = useState<'prebook' | 'external'>('prebook');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const handleGradeToggle = (grade: number, checked: boolean) => {
    if (checked) {
      setSelectedGrades([...selectedGrades, grade]);
    } else {
      setSelectedGrades(selectedGrades.filter(g => g !== grade));
    }
  };

  const handleLanguageToggle = (language: string, checked: boolean) => {
    if (checked) {
      setSelectedLanguages([...selectedLanguages, language]);
    } else {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    }
  };

  const handleLaunchAgent = async () => {
    if (selectedGrades.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one grade level.",
        variant: "destructive",
      });
      return;
    }

    if (agent.supportedLanguages && selectedLanguages.length === 0) {
      toast({
        title: "Language Required",
        description: "Please select at least one language.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save configuration to backend
      const config = {
        agentType: agent.id,
        grades: selectedGrades,
        contentSource,
        languages: selectedLanguages.length > 0 ? selectedLanguages : null,
        userId: 1 // This would come from authentication context
      };

      const response = await fetch('/api/agent-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      toast({
        title: "Agent Configured!",
        description: `${agent.name} is ready to launch with your settings.`,
      });

      // Pass configuration to parent for workspace launch
      onLaunch?.({
        grades: selectedGrades,
        languages: selectedLanguages,
        contentSource
      });

    } catch (error) {
      toast({
        title: "Configuration Error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const showLanguageSelection = agent.supportedLanguages && agent.supportedLanguages.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{agent.name}</h2>
              <p className="text-gray-600 mt-1">{agent.description}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Grade Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Grade Levels</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {GRADES.map((grade) => {
                const isSupported = agent.supportsGrades.includes(grade);
                return (
                  <label 
                    key={grade}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      isSupported 
                        ? 'hover:bg-gray-50 cursor-pointer' 
                        : 'opacity-50 cursor-not-allowed'
                    } ${
                      selectedGrades.includes(grade) 
                        ? 'bg-indigo-50 border-indigo-300' 
                        : 'border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={selectedGrades.includes(grade)}
                      onCheckedChange={(checked) => 
                        isSupported && handleGradeToggle(grade, checked === true)
                      }
                      disabled={!isSupported}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Grade {grade}
                    </span>
                  </label>
                );
              })}
            </div>
            {selectedGrades.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedGrades.map((grade) => (
                  <Badge key={grade} variant="blue">
                    Grade {grade}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content Source Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Source</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="contentSource"
                  value="prebook"
                  checked={contentSource === 'prebook'}
                  onChange={(e) => setContentSource(e.target.value as 'prebook')}
                  className="sr-only"
                />
                <div className={`border-2 rounded-xl p-4 transition-colors ${
                  contentSource === 'prebook' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}>
                  <div className="flex items-center mb-3">
                    <Book className="text-indigo-600 mr-3 h-5 w-5" />
                    <h4 className="font-semibold text-gray-900">NCERT Prebook</h4>
                  </div>
                  <p className="text-sm text-gray-600">Use pre-uploaded NCERT curriculum books and materials</p>
                </div>
              </label>
              
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="contentSource"
                  value="external"
                  checked={contentSource === 'external'}
                  onChange={(e) => setContentSource(e.target.value as 'external')}
                  className="sr-only"
                />
                <div className={`border-2 rounded-xl p-4 transition-colors ${
                  contentSource === 'external' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-indigo-300'
                }`}>
                  <div className="flex items-center mb-3">
                    <Cloud className="text-green-600 mr-3 h-5 w-5" />
                    <h4 className="font-semibold text-gray-900">External Search</h4>
                  </div>
                  <p className="text-sm text-gray-600">Search and integrate external educational resources</p>
                </div>
              </label>
            </div>
          </div>

          {/* Language Selection */}
          {showLanguageSelection && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Languages</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {agent.supportedLanguages!.map((language) => (
                  <label 
                    key={language}
                    className={`flex items-center space-x-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedLanguages.includes(language) 
                        ? 'bg-indigo-50 border-indigo-300' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedLanguages.includes(language)}
                      onCheckedChange={(checked) => 
                        handleLanguageToggle(language, checked === true)
                      }
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {language}
                    </span>
                  </label>
                ))}
              </div>
              {selectedLanguages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedLanguages.map((language) => (
                    <Badge key={language} variant="green">
                      {language}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleLaunchAgent}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              Launch Agent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
