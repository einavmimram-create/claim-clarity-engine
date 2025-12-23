import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  level: 'high' | 'medium' | 'low';
  label: string;
  description: string;
  isEditing?: boolean;
}

export function ConfidenceIndicator({ level, label, description, isEditing = false }: ConfidenceIndicatorProps) {
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

  const editableAttributes = isEditing
    ? { contentEditable: true, suppressContentEditableWarning: true }
    : {};
  const editableClass = isEditing
    ? 'border border-dashed border-border rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className={cn('rounded-lg border p-4', colorClasses[level])}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-3 h-3 rounded-full', dotClasses[level])} />
        <span className={`font-semibold ${editableClass}`} {...editableAttributes}>
          {label}
        </span>
      </div>
      <p className={`text-sm text-foreground/80 ${editableClass}`} {...editableAttributes}>
        {description}
      </p>
    </div>
  );
}
