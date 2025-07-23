import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { GradientCard, GradientIcon, Badge } from "@/components/ui/gradient-card";
import { AgentConfigModal } from "@/components/agent-config-modal";
import { AgentWorkspace } from "@/components/agent-workspace";
import { MasterChatbot } from "@/components/master-chatbot";
import { Bell, Users, Book, TrendingUp, Clock, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { AGENTS, type Agent } from "@/types/agents";
import { auth, signOutUser } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showMasterChat, setShowMasterChat] = useState(false);
  const [workspaceAgent, setWorkspaceAgent] = useState<Agent | null>(null);
  const [workspaceConfig, setWorkspaceConfig] = useState<{
    grades: number[];
    languages: string[];
    contentSource: 'prebook' | 'external';
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Check if we're in demo mode or redirect to login
        const isDemoMode = window.location.pathname === '/dashboard' && !currentUser;
        if (isDemoMode) {
          // Set demo user
          setUser({
            displayName: 'Demo Teacher',
            email: 'demo@eduai.platform',
            uid: 'demo-uid'
          });
        } else {
          setLocation("/");
        }
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  const handleAgentClick = (agent: Agent) => {
    if (agent.id === 'master-chatbot') {
      setShowMasterChat(true);
    } else if (agent.id === 'content-generation') {
      // Direct navigation to Content Generator page
      setLocation('/content-generator');
    } else if (agent.id === 'differentiated-materials') {
      // Direct navigation to Differentiated Materials page
      setLocation('/differentiated-materials');
    } else if (agent.id === 'visual-aids') {
      // Direct navigation to Visual Aids page
      setLocation('/visual-aids');
    } else if (agent.id === 'ar-integration') {
      // Direct navigation to AR Integration page
      setLocation('/ar-integration');
    } else {
      setSelectedAgent(agent);
      setShowAgentModal(true);
    }
  };

  const handleLaunchWorkspace = (config: {
    grades: number[];
    languages: string[];
    contentSource: 'prebook' | 'external';
  }) => {
    setWorkspaceAgent(selectedAgent);
    setWorkspaceConfig(config);
    setShowAgentModal(false);
  };

  const handleCloseWorkspace = () => {
    setWorkspaceAgent(null);
    setWorkspaceConfig(null);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of EduAI Platform",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getBadgeVariant = (badge?: string) => {
    switch (badge) {
      case 'Popular': return 'blue';
      case 'Essential': return 'green';
      case 'Fun': return 'yellow';
      case 'Central Hub': return 'gray';
      case '3D': return 'emerald';
      default: return 'blue';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white"></i>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">EduAI Platform</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/ncert">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>NCERT Database</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user?.displayName || user?.email || "Teacher"}
                </span>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {(user?.displayName || user?.email || "T")[0].toUpperCase()}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Teacher'}!
          </h2>
          <p className="text-gray-600">Choose an AI agent to enhance your multi-grade classroom experience</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">142</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Content Generated</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Performance</p>
                <p className="text-2xl font-bold text-gray-900">87%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent) => (
            <GradientCard
              key={agent.id}
              gradient={agent.color}
              onClick={() => handleAgentClick(agent)}
              className="group"
            >
              <div className="flex items-start justify-between mb-4">
                <GradientIcon icon={agent.icon} gradient={agent.color} />
                {agent.badge && (
                  <Badge variant={getBadgeVariant(agent.badge)}>
                    {agent.badge}
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {agent.name}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {agent.description}
              </p>
              
              <div className="flex items-center text-sm text-gray-500">
                <i className={`${agent.features[0].includes('Language') ? 'fas fa-language' : 
                  agent.features[0].includes('Support') ? 'fas fa-file-alt' : 
                  agent.features[0].includes('Analytics') ? 'fas fa-chart-bar' :
                  agent.features[0].includes('Available') ? 'fas fa-question-circle' :
                  agent.features[0].includes('AR') ? 'fas fa-cube' :
                  agent.features[0].includes('Achievement') ? 'fas fa-trophy' :
                  agent.features[0].includes('Real-time') ? 'fas fa-tachometer-alt' :
                  agent.features[0].includes('Voice') ? 'fas fa-volume-up' :
                  agent.features[0].includes('Context') ? 'fas fa-comments' :
                  agent.features[0].includes('Personalized') ? 'fas fa-user-graduate' :
                  'fas fa-magic'} mr-2`}></i>
                <span>{agent.features[0]}</span>
              </div>
            </GradientCard>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showAgentModal && selectedAgent && (
        <AgentConfigModal
          agent={selectedAgent}
          onClose={() => {
            setShowAgentModal(false);
            setSelectedAgent(null);
          }}
          onLaunch={handleLaunchWorkspace}
        />
      )}

      {showMasterChat && (
        <MasterChatbot onClose={() => setShowMasterChat(false)} />
      )}

      {/* Agent Workspace */}
      {workspaceAgent && workspaceConfig && (
        <AgentWorkspace
          agent={workspaceAgent}
          configuration={workspaceConfig}
          onClose={handleCloseWorkspace}
        />
      )}
    </div>
  );
}
