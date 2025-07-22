import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Gamepad2, Trophy, Star, Target, Clock, Users, 
  Play, Pause, RotateCcw, Zap, Award, Crown,
  ChevronRight, Plus, Sparkles, Timer, Gift
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface GameConfig {
  topic: string;
  grade: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gameType: 'quiz' | 'memory' | 'puzzle' | 'racing' | 'adventure';
  duration: number;
  playerCount: 'single' | 'multiplayer';
}

interface GeneratedGame {
  id: string;
  title: string;
  description: string;
  gameType: string;
  questions: GameQuestion[];
  rewards: GameReward[];
  challenges: GameChallenge[];
  metadata: {
    estimatedTime: number;
    difficulty: string;
    points: number;
  };
}

interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
  timeLimit: number;
}

interface GameReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsRequired: number;
}

interface GameChallenge {
  id: string;
  title: string;
  description: string;
  objective: string;
  reward: string;
  difficulty: string;
}

interface GameSession {
  id: string;
  score: number;
  timeElapsed: number;
  currentQuestion: number;
  isActive: boolean;
  rewards: string[];
}

export default function GamifiedTeaching() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Game Configuration State
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    topic: '',
    grade: 5,
    difficulty: 'medium',
    gameType: 'quiz',
    duration: 10,
    playerCount: 'single'
  });

  // Game Session State
  const [currentGame, setCurrentGame] = useState<GeneratedGame | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Game Generation Mutation
  const generateGameMutation = useMutation({
    mutationFn: async (config: GameConfig) => {
      return await apiRequest('/api/agents/gamified-teaching/generate-game', {
        method: 'POST',
        body: JSON.stringify(config)
      });
    },
    onSuccess: (data) => {
      setCurrentGame(data.game);
      toast({
        title: "Game Generated!",
        description: `${data.game.title} is ready to play`,
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: "Could not generate game. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && gameSession) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameSession]);

  const handleGenerateGame = () => {
    if (!gameConfig.topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your game",
        variant: "destructive",
      });
      return;
    }
    generateGameMutation.mutate(gameConfig);
  };

  const startGame = () => {
    if (!currentGame) return;
    
    const newSession: GameSession = {
      id: Date.now().toString(),
      score: 0,
      timeElapsed: 0,
      currentQuestion: 0,
      isActive: true,
      rewards: []
    };
    
    setGameSession(newSession);
    setIsPlaying(true);
    setTimer(0);
    setSelectedAnswer(null);
    
    toast({
      title: "Game Started!",
      description: "Good luck with your educational adventure!",
    });
  };

  const pauseGame = () => {
    setIsPlaying(!isPlaying);
  };

  const resetGame = () => {
    setIsPlaying(false);
    setGameSession(null);
    setTimer(0);
    setSelectedAnswer(null);
  };

  const submitAnswer = () => {
    if (!currentGame || !gameSession || selectedAnswer === null) return;
    
    const currentQuestion = currentGame.questions[gameSession.currentQuestion];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    let newScore = gameSession.score;
    const newRewards = [...gameSession.rewards];
    
    if (isCorrect) {
      newScore += currentQuestion.points;
      
      // Check for rewards
      if (newScore > 0 && newScore % 100 === 0) {
        newRewards.push(`${newScore} Points Milestone`);
      }
    }
    
    const updatedSession = {
      ...gameSession,
      score: newScore,
      currentQuestion: gameSession.currentQuestion + 1,
      rewards: newRewards,
      timeElapsed: timer
    };
    
    setGameSession(updatedSession);
    setSelectedAnswer(null);
    
    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect ? 
        `+${currentQuestion.points} points! ${currentQuestion.explanation}` : 
        `The correct answer was: ${currentQuestion.options[currentQuestion.correctAnswer]}`,
      variant: isCorrect ? "default" : "destructive",
    });
    
    // Check if game is complete
    if (updatedSession.currentQuestion >= currentGame.questions.length) {
      setIsPlaying(false);
      toast({
        title: "Game Complete!",
        description: `Final Score: ${updatedSession.score} points in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    if (!currentGame || !gameSession) return null;
    return currentGame.questions[gameSession.currentQuestion];
  };

  const getProgressPercentage = () => {
    if (!currentGame || !gameSession) return 0;
    return (gameSession.currentQuestion / currentGame.questions.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Gamepad2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gamified Teaching Agent</h1>
          <p className="text-gray-600">Create engaging educational games on-the-fly</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Generate New Game</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject
                  </label>
                  <Input
                    placeholder="e.g., Multiplication Tables, Solar System"
                    value={gameConfig.topic}
                    onChange={(e) => setGameConfig({...gameConfig, topic: e.target.value})}
                    className="focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade Level
                    </label>
                    <select
                      value={gameConfig.grade}
                      onChange={(e) => setGameConfig({...gameConfig, grade: parseInt(e.target.value)})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={gameConfig.difficulty}
                      onChange={(e) => setGameConfig({...gameConfig, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'quiz', label: 'Quiz', icon: '🧠' },
                      { value: 'memory', label: 'Memory', icon: '🃏' },
                      { value: 'puzzle', label: 'Puzzle', icon: '🧩' },
                      { value: 'racing', label: 'Racing', icon: '🏁' }
                    ].map(type => (
                      <button
                        key={type.value}
                        onClick={() => setGameConfig({...gameConfig, gameType: type.value as any})}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          gameConfig.gameType === type.value 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 hover:border-yellow-300'
                        }`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <div className="text-xs font-medium">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (min)
                    </label>
                    <Input
                      type="number"
                      value={gameConfig.duration}
                      onChange={(e) => setGameConfig({...gameConfig, duration: parseInt(e.target.value)})}
                      className="focus:ring-yellow-500 focus:border-yellow-500"
                      min="5"
                      max="60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Players
                    </label>
                    <select
                      value={gameConfig.playerCount}
                      onChange={(e) => setGameConfig({...gameConfig, playerCount: e.target.value as 'single' | 'multiplayer'})}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="single">Single Player</option>
                      <option value="multiplayer">Multiplayer</option>
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerateGame}
                  disabled={generateGameMutation.isPending}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                >
                  {generateGameMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Game</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Game Stats */}
            {gameSession && (
              <Card className="mt-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Game Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Score</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-lg">{gameSession.score}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Time</span>
                      <div className="flex items-center space-x-1">
                        <Timer className="w-4 h-4 text-blue-500" />
                        <span className="font-mono">{formatTime(timer)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Progress</span>
                      <span className="font-bold">{gameSession.currentQuestion}/{currentGame?.questions.length || 0}</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>

                    {gameSession.rewards.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-medium">Recent Rewards</span>
                        {gameSession.rewards.slice(-3).map((reward, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm bg-yellow-50 p-2 rounded-lg">
                            <Gift className="w-4 h-4 text-yellow-600" />
                            <span>{reward}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            {!currentGame ? (
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm h-full">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Gamepad2 className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-4">Ready to Create Magic?</h3>
                  <p className="text-gray-600 mb-6">
                    Configure your game settings and click "Generate Game" to create an engaging educational experience instantly.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: Target, label: "Interactive Quizzes" },
                      { icon: Trophy, label: "Achievement System" },
                      { icon: Users, label: "Multiplayer Support" },
                      { icon: Crown, label: "Leaderboards" }
                    ].map((feature, index) => (
                      <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                        <feature.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">{feature.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : !isPlaying && !gameSession ? (
              // Game Preview
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>{currentGame.title}</span>
                    </div>
                    <Badge className="bg-white/20 text-white">
                      {currentGame.gameType.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6">{currentGame.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="font-semibold">{currentGame.metadata.estimatedTime} min</p>
                      <p className="text-sm text-gray-600">Estimated Time</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="font-semibold">{currentGame.questions.length} Questions</p>
                      <p className="text-sm text-gray-600">Total Questions</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="font-semibold">{currentGame.metadata.points} Points</p>
                      <p className="text-sm text-gray-600">Max Points</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      onClick={startGame}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </Button>
                    <Button 
                      onClick={() => setCurrentGame(null)}
                      variant="outline"
                      className="px-6 py-3 rounded-xl border-2 border-gray-300 hover:border-gray-400"
                    >
                      Generate New
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Active Game
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      {isPlaying ? <Zap className="w-5 h-5 animate-pulse" /> : <Pause className="w-5 h-5" />}
                      <span>Question {(gameSession?.currentQuestion || 0) + 1}</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={pauseGame}
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button 
                        onClick={resetGame}
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {getCurrentQuestion() && gameSession && gameSession.currentQuestion < currentGame.questions.length ? (
                    <div className="space-y-6">
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                          {getCurrentQuestion()?.question}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Points: {getCurrentQuestion()?.points}</span>
                          <span>Time Limit: {getCurrentQuestion()?.timeLimit}s</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getCurrentQuestion()?.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedAnswer(index)}
                            disabled={!isPlaying}
                            className={`p-4 text-left rounded-xl border-2 transition-all transform hover:scale-105 ${
                              selectedAnswer === index
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            } ${!isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}>
                                {selectedAnswer === index && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>
                              <span className="font-medium">{option}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <Button 
                        onClick={submitAnswer}
                        disabled={selectedAnswer === null || !isPlaying}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 disabled:scale-100"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Submit Answer</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </Button>
                    </div>
                  ) : (
                    // Game Complete
                    <div className="text-center py-8">
                      <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-800 mb-4">Game Complete!</h3>
                      <p className="text-xl text-gray-600 mb-2">Final Score: {gameSession?.score} points</p>
                      <p className="text-gray-600 mb-6">Time: {formatTime(timer)}</p>
                      
                      <div className="flex space-x-4 justify-center">
                        <Button 
                          onClick={resetGame}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Play Again
                        </Button>
                        <Button 
                          onClick={() => {setCurrentGame(null); resetGame();}}
                          variant="outline"
                          className="px-6 py-3 rounded-xl border-2"
                        >
                          Generate New Game
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}