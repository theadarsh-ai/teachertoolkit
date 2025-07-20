// Gemini AI integration for LangGraph functionality
// Powered by Google's Gemini for multilingual Indian education context

export interface ContentGenerationRequest {
  prompt: string;
  grades: number[];
  languages: string[];
  contentSource: 'prebook' | 'external';
}

export interface AgentResponse {
  content: string;
  metadata: Record<string, any>;
  agentType: string;
}

export class EduAIService {
  private baseURL = '/api';

  async generateContent(request: ContentGenerationRequest): Promise<AgentResponse> {
    const response = await fetch(`${this.baseURL}/agents/content-generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate content');
    }

    return response.json();
  }

  async createDifferentiatedMaterials(sourceContent: string, grades: number[]): Promise<AgentResponse> {
    const response = await fetch(`${this.baseURL}/agents/differentiated-materials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceContent, grades }),
    });

    if (!response.ok) {
      throw new Error('Failed to create differentiated materials');
    }

    return response.json();
  }

  async createLessonPlan(subject: string, grades: number[], timeframe: string): Promise<AgentResponse> {
    const response = await fetch(`${this.baseURL}/agents/lesson-planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subject, grades, timeframe }),
    });

    if (!response.ok) {
      throw new Error('Failed to create lesson plan');
    }

    return response.json();
  }

  async generateVisualAids(prompt: string, grades: number[]): Promise<AgentResponse> {
    const response = await fetch(`${this.baseURL}/agents/visual-aids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, grades }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate visual aids');
    }

    return response.json();
  }

  async analyzePerformance(studentData: any, grades: number[]): Promise<AgentResponse> {
    const response = await fetch(`${this.baseURL}/agents/performance-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentData, grades }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze performance');
    }

    return response.json();
  }

  // Speech-to-text functionality with multilingual support
  async startSpeechRecognition(language: string = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        reject(new Error(event.error));
      };

      recognition.start();
    });
  }
}

export const eduAIService = new EduAIService();

// Note: This service integrates with Gemini AI on the backend
// All AI processing is powered by Google's Gemini models for 
// culturally relevant, multilingual Indian education content
