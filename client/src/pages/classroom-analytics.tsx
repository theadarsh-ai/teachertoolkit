import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Clock, 
  TrendingUp, 
  Activity,
  BookOpen,
  Gamepad2,
  Volume2,
  Eye,
  MessageSquare,
  FileText,
  Calendar,
  Target,
  Zap,
  Award,
  Timer,
  Video
} from "lucide-react";
import { AGENTS } from "@/types/agents";

// Hard-coded interactive analytics data for agent usage
const AGENT_USAGE_DATA = {
  'content-generation': {
    name: 'Hyper-Local Content Generator',
    icon: BookOpen,
    totalUses: 1247,
    weeklyUses: 89,
    avgSessionTime: '12 min',
    successRate: 94,
    topGrades: ['Grade 6', 'Grade 8', 'Grade 10'],
    recentActivity: [
      { date: '2025-01-24', uses: 23, grade: 'Grade 8', topic: 'Indian History' },
      { date: '2025-01-23', uses: 18, grade: 'Grade 6', topic: 'Science Experiments' },
      { date: '2025-01-22', uses: 31, grade: 'Grade 10', topic: 'Mathematics' },
    ],
    color: 'from-blue-500 to-indigo-600'
  },
  'differentiated-materials': {
    name: 'Differentiated Materials',
    icon: FileText,
    totalUses: 892,
    weeklyUses: 67,
    avgSessionTime: '15 min',
    successRate: 91,
    topGrades: ['Grade 3', 'Grade 7', 'Grade 9'],
    recentActivity: [
      { date: '2025-01-24', uses: 19, grade: 'Grade 7', topic: 'Reading Comprehension' },
      { date: '2025-01-23', uses: 25, grade: 'Grade 3', topic: 'Basic Math' },
      { date: '2025-01-22', uses: 23, grade: 'Grade 9', topic: 'Physics Problems' },
    ],
    color: 'from-green-500 to-emerald-600'
  },
  'lesson-planner': {
    name: 'AI Lesson Planner',
    icon: Calendar,
    totalUses: 634,
    weeklyUses: 45,
    avgSessionTime: '18 min',
    successRate: 96,
    topGrades: ['Grade 4', 'Grade 7', 'Grade 11'],
    recentActivity: [
      { date: '2025-01-24', uses: 12, grade: 'Grade 7', topic: 'Weekly Science Plan' },
      { date: '2025-01-23', uses: 16, grade: 'Grade 4', topic: 'English Literature' },
      { date: '2025-01-22', uses: 17, grade: 'Grade 11', topic: 'Chemistry Lab' },
    ],
    color: 'from-purple-500 to-violet-600'
  },
  'gamified-teaching': {
    name: 'Gamified Teaching',
    icon: Gamepad2,
    totalUses: 1156,
    weeklyUses: 94,
    avgSessionTime: '22 min',
    successRate: 89,
    topGrades: ['Grade 5', 'Grade 8', 'Grade 12'],
    recentActivity: [
      { date: '2025-01-24', uses: 28, grade: 'Grade 12', topic: 'Integral Formula' },
      { date: '2025-01-23', uses: 22, grade: 'Grade 5', topic: 'Solar System' },
      { date: '2025-01-22', uses: 44, grade: 'Grade 8', topic: 'Geography Quiz' },
    ],
    color: 'from-orange-500 to-red-600'
  },
  'visual-aids': {
    name: 'Visual Aids Designer',
    icon: Eye,
    totalUses: 743,
    weeklyUses: 56,
    avgSessionTime: '14 min',
    successRate: 87,
    topGrades: ['Grade 6', 'Grade 9', 'Grade 12'],
    recentActivity: [
      { date: '2025-01-24', uses: 15, grade: 'Grade 9', topic: 'Biology Diagrams' },
      { date: '2025-01-23', uses: 21, grade: 'Grade 6', topic: 'Math Flowcharts' },
      { date: '2025-01-22', uses: 20, grade: 'Grade 12', topic: 'Chemistry Models' },
    ],
    color: 'from-pink-500 to-rose-600'
  },
  'audio-reading-assessment': {
    name: 'Audio Reading Assessment',
    icon: Volume2,
    totalUses: 567,
    weeklyUses: 42,
    avgSessionTime: '8 min',
    successRate: 92,
    topGrades: ['Grade 2', 'Grade 4', 'Grade 6'],
    recentActivity: [
      { date: '2025-01-24', uses: 14, grade: 'Grade 4', topic: 'Hindi Reading' },
      { date: '2025-01-23', uses: 16, grade: 'Grade 2', topic: 'English Phonics' },
      { date: '2025-01-22', uses: 12, grade: 'Grade 6', topic: 'Tamil Poetry' },
    ],
    color: 'from-cyan-500 to-blue-600'
  },
  'master-chatbot': {
    name: 'Master Agent Chatbot',
    icon: MessageSquare,
    totalUses: 2134,
    weeklyUses: 156,
    avgSessionTime: '9 min',
    successRate: 95,
    topGrades: ['All Grades'],
    recentActivity: [
      { date: '2025-01-24', uses: 42, grade: 'Mixed', topic: 'General Queries' },
      { date: '2025-01-23', uses: 58, grade: 'Mixed', topic: 'Teaching Tips' },
      { date: '2025-01-22', uses: 56, grade: 'Mixed', topic: 'Curriculum Help' },
    ],
    color: 'from-gray-500 to-slate-600'
  },
  'video-generator': {
    name: 'AI Video Generator',
    icon: Video,
    totalUses: 234,
    weeklyUses: 28,
    avgSessionTime: '16 min',
    successRate: 88,
    topGrades: ['Grade 6', 'Grade 9', 'Grade 11'],
    recentActivity: [
      { date: '2025-01-24', uses: 8, grade: 'Grade 9', topic: 'Photosynthesis Animation' },
      { date: '2025-01-23', uses: 12, grade: 'Grade 6', topic: 'Solar System Tour' },
      { date: '2025-01-22', uses: 8, grade: 'Grade 11', topic: 'Chemistry Lab Simulation' },
    ],
    color: 'from-purple-500 to-pink-600'
  }
};

const WEEKLY_OVERVIEW = {
  totalSessions: 549,
  totalTimeSpent: '4,234 min',
  mostUsedAgent: 'Master Agent Chatbot',
  peakUsageTime: '10:00 AM - 12:00 PM',
  averageSessionLength: '13.2 min',
  contentGenerated: 1247,
  studentsImpacted: 142,
  weeklyGrowth: 12.5
};

const PACING_DATA = {
  averageCompletionRate: 87,
  behindSchedule: [
    { grade: 'Grade 3', subject: 'Mathematics', delay: '2 days', reason: 'Complex fractions topic' },
    { grade: 'Grade 7', subject: 'Science', delay: '1 day', reason: 'Lab equipment unavailable' },
    { grade: 'Grade 11', subject: 'Chemistry', delay: '3 days', reason: 'Additional practice needed' }
  ],
  onTrack: [
    { grade: 'Grade 5', subject: 'English', progress: 95 },
    { grade: 'Grade 8', subject: 'History', progress: 92 },
    { grade: 'Grade 10', subject: 'Biology', progress: 88 }
  ],
  recommendations: [
    'Consider additional practice sessions for Grade 3 Mathematics',
    'Schedule makeup lab sessions for Grade 7 Science',
    'Implement peer tutoring for Grade 11 Chemistry',
    'Introduce gamified learning for slower topics'
  ]
};

export default function ClassroomAnalytics() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  const getSortedAgents = () => {
    return Object.entries(AGENT_USAGE_DATA).sort((a, b) => b[1].totalUses - a[1].totalUses);
  };

  const getUsageColor = (uses: number) => {
    if (uses > 1000) return 'text-green-600 bg-green-50';
    if (uses > 500) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-blue-600';
    return 'text-orange-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
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
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Classroom Analytics & Pacing</h1>
                <p className="text-gray-600">Track agent usage and classroom pacing insights</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={timeRange === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              This Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              This Month
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agent Usage</TabsTrigger>
            <TabsTrigger value="pacing">Pacing Insights</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
                    <Activity className="w-4 h-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{WEEKLY_OVERVIEW.totalSessions}</div>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">+{WEEKLY_OVERVIEW.weeklyGrowth}% from last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Time Spent</CardTitle>
                    <Timer className="w-4 h-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{WEEKLY_OVERVIEW.totalTimeSpent}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Avg: {WEEKLY_OVERVIEW.averageSessionLength} per session
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Students Impacted</CardTitle>
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{WEEKLY_OVERVIEW.studentsImpacted}</div>
                  <div className="text-sm text-gray-600 mt-2">Across all grade levels</div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Content Generated</CardTitle>
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{WEEKLY_OVERVIEW.contentGenerated}</div>
                  <div className="text-sm text-gray-600 mt-2">Educational materials</div>
                </CardContent>
              </Card>
            </div>

            {/* Most Used Agents Chart */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span>Top Performing Agents This Week</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getSortedAgents().slice(0, 5).map(([agentId, data], index) => {
                    const IconComponent = data.icon;
                    return (
                      <div key={agentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${data.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{data.name}</div>
                            <div className="text-sm text-gray-600">{data.weeklyUses} uses this week</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={index === 0 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{data.totalUses}</div>
                            <div className="text-sm text-gray-600">total uses</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent Usage Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(AGENT_USAGE_DATA).map(([agentId, data]) => {
                const IconComponent = data.icon;
                return (
                  <Card key={agentId} className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${data.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{data.name}</CardTitle>
                            <p className="text-sm text-gray-600">Last used today</p>
                          </div>
                        </div>
                        <Badge className={getUsageColor(data.totalUses)}>
                          {data.totalUses} uses
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-gray-900">{data.weeklyUses}</div>
                          <div className="text-xs text-gray-600">This Week</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">{data.avgSessionTime}</div>
                          <div className="text-xs text-gray-600">Avg Session</div>
                        </div>
                        <div>
                          <div className={`text-lg font-bold ${getSuccessRateColor(data.successRate)}`}>
                            {data.successRate}%
                          </div>
                          <div className="text-xs text-gray-600">Success Rate</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Popular Grades</h4>
                        <div className="flex flex-wrap gap-1">
                          {data.topGrades.map((grade, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {grade}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                        <div className="space-y-2">
                          {data.recentActivity.slice(0, 2).map((activity, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{activity.grade} - {activity.topic}</span>
                              <span className="font-medium text-gray-900">{activity.uses} uses</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Pacing Insights Tab */}
          <TabsContent value="pacing" className="space-y-6">
            <div className="grid gap-6">
              {/* Overall Progress */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-green-600" />
                    <span>Overall Curriculum Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Average Completion Rate</span>
                      <span className="font-bold">{PACING_DATA.averageCompletionRate}%</span>
                    </div>
                    <Progress value={PACING_DATA.averageCompletionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {PACING_DATA.onTrack.map((item, index) => (
                      <div key={index} className="p-4 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">{item.grade}</div>
                        <div className="text-sm text-green-600">{item.subject}</div>
                        <div className="text-lg font-bold text-green-900 mt-1">{item.progress}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Behind Schedule */}
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span>Behind Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {PACING_DATA.behindSchedule.map((item, index) => (
                      <div key={index} className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-orange-800">{item.grade} - {item.subject}</div>
                            <div className="text-sm text-orange-600 mt-1">{item.reason}</div>
                          </div>
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            {item.delay} behind
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>AI-Powered Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PACING_DATA.recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <div className="text-blue-800">{recommendation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>Suggested Action Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800">Schedule additional practice sessions for struggling topics</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800">Implement more gamified learning for low-engagement areas</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800">Create differentiated materials for mixed-ability classes</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-800">Review and adjust pacing for subjects running behind schedule</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}