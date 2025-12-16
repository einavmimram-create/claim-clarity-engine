import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
  label: string;
  description: string;
}

export function ConfidenceIndicator({ level, label, description }: ConfidenceIndicatorProps) {
  const colorClasses = {
    high: 'bg-confidence-high/10 border-confidence-high text-confidence-high',
    medium: 'bg-confidence-medium/10 border-confidence-medium text-confidence-medium',
    low: 'bg-confidence-low/10 border-confidence-low text-confidence-low',
  };

  const dotClasses = {
    high: 'bg-confidence-high',
    medium: 'bg-confidence-medium',
    low: 'bg-confidence-low',
  };

  return (
    <div className={cn('rounded-lg border p-4', colorClasses[level])}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-3 h-3 rounded-full', dotClasses[level])} />
        <span className="font-semibold">{label}</span>
      </div>
      <p className="text-sm text-foreground/80">{description}</p>
    </div>
  );
}
