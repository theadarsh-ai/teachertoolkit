import { cn } from "@/lib/utils";

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

interface GradientIconProps {
  icon: string;
  gradient: string;
  className?: string;
}

export function GradientIcon({ icon, gradient, className }: GradientIconProps) {
  return (
    <div className={cn(`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center`, className)}>
      <i className={`${icon} text-white`}></i>
    </div>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'yellow' | 'gray' | 'emerald';
}

export function Badge({ children, variant = 'blue' }: BadgeProps) {
  const variants = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
    emerald: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <span className={`${variants[variant]} text-xs px-2 py-1 rounded-full font-medium`}>
      {children}
    </span>
  );
}
