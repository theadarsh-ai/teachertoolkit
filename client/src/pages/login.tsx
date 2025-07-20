import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, handleRedirectResult, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { GraduationCap, Mail, Lock } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle Firebase redirect result
    handleRedirectResult().then((result) => {
      if (result) {
        toast({
          title: "Welcome!",
          description: "Successfully signed in to EduAI Platform",
        });
        setLocation("/dashboard");
      }
    }).catch((error) => {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLocation("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [setLocation, toast]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <Card className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">EduAI Platform</h1>
            <p className="text-white/80">Empowering Multi-Grade Classrooms</p>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-6">
            <div>
              <label className="block text-white/90 font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white/50"
                  placeholder="teacher@school.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/90 font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60 focus:border-white/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
              disabled={loading}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/60 text-sm">or</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-6 text-center">
            <p className="text-white/70 text-sm">
              Forgot your password?{" "}
              <a href="#" className="text-orange-300 hover:text-orange-200 underline">
                Reset here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
