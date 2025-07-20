export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
  features: string[];
  supportedLanguages?: string[];
  supportsGrades: number[];
}

export const AGENTS: Agent[] = [
  {
    id: 'content-generation',
    name: 'Hyper-Local Content Generation',
    description: 'Generate culturally relevant materials in students\' mother tongues with speech-to-text input.',
    icon: 'fas fa-globe-asia',
    color: 'from-blue-500 to-cyan-500',
    badge: 'Popular',
    features: ['8 Languages Supported', 'Speech-to-Text', 'Cultural Relevance'],
    supportedLanguages: ['Hindi', 'Marathi', 'Tamil', 'Kannada', 'Malayalam', 'English', 'Telugu', 'Bengali'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'differentiated-materials',
    name: 'Create Differentiated Materials',
    description: 'Automatically adapt content into multiple grade-level versions from any source.',
    icon: 'fas fa-layer-group',
    color: 'from-green-500 to-emerald-500',
    badge: 'Essential',
    features: ['PDF, DOCX, CSV Support', 'Multi-Grade Adaptation', 'Template Generation'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'lesson-planner',
    name: 'AI Lesson Planner',
    description: 'Structure syllabus into efficient teaching schedules with progress tracking.',
    icon: 'fas fa-calendar-alt',
    color: 'from-purple-500 to-violet-500',
    features: ['Weekly Analytics', 'Progress Tracking', 'Automated Scheduling'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'knowledge-base',
    name: 'Instant Knowledge Base',
    description: 'Bilingual Q&A engine with analogy-rich answers for teachers and students.',
    icon: 'fas fa-brain',
    color: 'from-orange-500 to-red-500',
    features: ['24/7 Available', 'Bilingual Support', 'Analogy-Rich Answers'],
    supportedLanguages: ['Hindi', 'English', 'Regional Languages'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'visual-aids',
    name: 'Design Visual Aids',
    description: 'Generate diagrams, flowcharts, and AR content to illustrate complex concepts.',
    icon: 'fas fa-palette',
    color: 'from-pink-500 to-rose-500',
    features: ['AR Integration', 'Diagram Generation', 'Interactive Content'],
    supportsGrades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'gamified-teaching',
    name: 'Gamified Teaching Agent',
    description: 'Incorporate quizzes, badges, and leaderboards to boost engagement across grades.',
    icon: 'fas fa-gamepad',
    color: 'from-yellow-500 to-orange-500',
    badge: 'Fun',
    features: ['Achievement System', 'Leaderboards', 'Interactive Quizzes'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'classroom-analytics',
    name: 'Classroom Analytics & Pacing',
    description: 'Monitor performance data and get real-time pacing adjustments.',
    icon: 'fas fa-analytics',
    color: 'from-indigo-500 to-purple-500',
    features: ['Real-time Insights', 'Performance Tracking', 'Pacing Recommendations'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'audio-assessment',
    name: 'Audio Reading Assessment',
    description: 'Evaluate pronunciation, fluency, and comprehension through voice analysis.',
    icon: 'fas fa-microphone',
    color: 'from-teal-500 to-cyan-500',
    features: ['Voice Recognition', 'Fluency Analysis', 'Pronunciation Check'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'master-chatbot',
    name: 'Master Agent Chatbot',
    description: 'Central conversational interface to route requests to appropriate agents.',
    icon: 'fas fa-robot',
    color: 'from-gray-700 to-gray-900',
    badge: 'Central Hub',
    features: ['Context Aware', 'Multi-Agent Routing', 'Session Memory'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'performance-analysis',
    name: 'Performance Analysis',
    description: 'Generate personalized learning paths and end-of-term reports.',
    icon: 'fas fa-chart-pie',
    color: 'from-red-500 to-pink-500',
    features: ['Personalized Reports', 'Learning Paths', 'Progress Analytics'],
    supportsGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  },
  {
    id: 'ar-integration',
    name: 'AR using Sketchfab',
    description: 'Create immersive 3D learning experiences using Sketchfab integration.',
    icon: 'fas fa-vr-cardboard',
    color: 'from-emerald-500 to-teal-500',
    badge: '3D',
    features: ['3D Models', 'AR Experience', 'Interactive Learning'],
    supportsGrades: [6, 7, 8, 9, 10, 11, 12]
  }
];

export const SUPPORTED_LANGUAGES = [
  'Hindi',
  'Marathi', 
  'Tamil',
  'Kannada',
  'Malayalam',
  'English',
  'Telugu',
  'Bengali'
];

export const GRADES = Array.from({ length: 12 }, (_, i) => i + 1);
