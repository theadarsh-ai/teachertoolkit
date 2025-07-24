import { cn } from "@/lib/utils";
import { 
  Globe2, Layers, Calendar, Brain, Palette, Gamepad2, TrendingUp, 
  Mic, Bot, Target, Box, Video, Volume2, LucideIcon
} from "lucide-react";

interface GradientCardProps {
  children: React.ReactNode;
  gradient: string;
  className?: string;
  onClick?: () => void;
}

export function GradientCard({ children, gradient, className, onClick }: GradientCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

// Icon mapping for Lucide React icons
const iconMap: Record<string, LucideIcon> = {
  'Globe2': Globe2,
  'Layers': Layers,
  'Calendar': Calendar,
  'Brain': Brain,
  'Palette': Palette,
  'Gamepad2': Gamepad2,
  'TrendingUp': TrendingUp,
  'Mic': Mic,
  'Bot': Bot,
  'Target': Target,
  'Box': Box,
  'Video': Video,
  'Volume2': Volume2
};

interface GradientIconProps {
  icon: string;
  gradient: string;
  className?: string;
}

export function GradientIcon({ icon, gradient, className }: GradientIconProps) {
  const IconComponent = iconMap[icon] || Bot; // Fallback to Bot icon
  
  return (
    <div className={cn(`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`, className)}>
      <IconComponent className="w-6 h-6 text-white" />
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'gray' | 'emerald' | 'purple';
}

export function Badge({ children, variant = 'blue' }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`${variants[variant]} text-xs px-2 py-1 rounded-full font-medium`}>
      {children}
    </span>
  );
}
