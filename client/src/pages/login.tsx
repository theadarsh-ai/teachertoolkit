import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, handleRedirectResult, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  GraduationCap, Mail, Lock, Sparkles, Users, BookOpen, 
  Brain, Zap, ArrowRight, Shield, Globe, Award
} from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      if (user) {
        toast({
          title: "Welcome!",
          description: `Successfully signed in as ${user.displayName || user.email}`,
        });
        setLocation("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [setLocation, toast]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('Starting Google sign-in...');
      const result = await signInWithGoogle();
      console.log('Google sign-in completed:', result.user.email);
      // Auth state change will handle the redirect
    } catch (error) {
      console.error('Google sign-in failed:', error);
      toast({
        title: "Sign In Error",
        description: error instanceof Error ? error.message : 'Failed to sign in with Google',
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, simulate email login
    if (email && password) {
      toast({
        title: "Welcome!",
        description: "Successfully signed in to EduAI Platform",
      });
      setLocation("/dashboard");
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    // Simulate demo user authentication
    setTimeout(() => {
      toast({
        title: "Demo Mode Activated!",
        description: "Exploring EduAI Platform as demo teacher",
      });
      setLocation("/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Modern Geometric Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Geometric Shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-40 w-64 h-64 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
          </div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative flex min-h-screen">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center text-white">
          <div className="max-w-lg space-y-8">
            {/* Logo Animation */}
            <div className="text-center mb-12">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl animate-pulse">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                Sahayak Platform
              </h1>
              <p className="text-xl text-white/80 font-light">
                Transform Education with AI-Powered Teaching
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Multi-Grade Support</h3>
                  <p className="text-white/70 text-sm">Manage classes from Grade 1-12 seamlessly</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">11 AI Agents</h3>
                  <p className="text-white/70 text-sm">Specialized tools for every teaching need</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">8+ Languages</h3>
                  <p className="text-white/70 text-sm">Generate content in regional languages</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            {/* <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-white/70 text-sm">Teachers</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white">2M+</div>
                <div className="text-white/70 text-sm">Students</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-white/70 text-sm">Success Rate</div>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <CardContent className="p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">EduAI Platform</h1>
                <p className="text-white/80">AI-Powered Teaching Assistant</p>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                <p className="text-white/70">Sign in to access your teaching dashboard</p>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 group-focus-within:text-white/80 transition-colors" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white/60 focus:bg-white/30 transition-all duration-300"
                      placeholder="teacher@school.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 font-medium mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5 group-focus-within:text-white/80 transition-colors" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white/60 focus:bg-white/30 transition-all duration-300"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-pink-600 hover:from-orange-600 hover:via-orange-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                  disabled={loading}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Access Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </form>

              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-white/60 text-sm">or continue with</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="flex items-center">
                  Google Workspace
                  <Shield className="w-4 h-4 ml-2 text-green-300" />
                </span>
              </Button>

              <div className="my-4 flex items-center">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-white/60 text-sm">explore without signup</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              <Button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
              >
                <span className="flex items-center justify-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Try Demo Platform</span>
                  <Award className="w-4 h-4" />
                </span>
              </Button>

              <div className="mt-8 text-center">
                <p className="text-white/70 text-sm mb-4">
                  New to EduAI Platform?{" "}
                  <a href="#" className="text-orange-300 hover:text-orange-200 underline font-medium">
                    Create Account
                  </a>
                </p>
                <p className="text-white/60 text-xs">
                  Forgot your password?{" "}
                  <a href="#" className="text-blue-300 hover:text-blue-200 underline">
                    Reset here
                  </a>
                </p>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center justify-center space-x-4 text-white/50 text-xs">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3" />
                    <span>NCERT Verified</span>
                  </div>
                  <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
