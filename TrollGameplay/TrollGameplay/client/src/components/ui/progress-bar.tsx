import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export default function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  color = 'blue'
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colorClasses = {
    blue: 'bg-accent-blue',
    green: 'bg-accent-green',
    orange: 'bg-accent-orange',
    red: 'bg-red-500'
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-text-primary">{label}</span>
          <span className="text-xs text-text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-dark-tertiary rounded-full h-2 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
