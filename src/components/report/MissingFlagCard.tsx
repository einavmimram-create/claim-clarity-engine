import { AlertCircle, FileQuestion, Search, Minus } from 'lucide-react';
import { MissingFlag } from '@/types/claim';

interface MissingFlagCardProps {
  flag: MissingFlag;
  isEditing?: boolean;
}

export function MissingFlagCard({ flag, isEditing = false }: MissingFlagCardProps) {
  const icons = {
    missing_conservative_care: FileQuestion,
    missing_objective_findings: Search,
    documentation_gap: Minus,
    silence_as_signal: AlertCircle,
  };

  const labels = {
    missing_conservative_care: 'Missing Conservative Care',
    missing_objective_findings: 'Missing Objective Findings',
    documentation_gap: 'Documentation Gap',
    silence_as_signal: 'Silence as Signal',
  };

  const Icon = icons[flag.type];
  const editableAttributes = isEditing
    ? { contentEditable: true, suppressContentEditableWarning: true }
    : {};
  const editableClass = isEditing
    ? 'border border-dashed border-border rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-warning/10 rounded-lg">
          <Icon className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium text-foreground mb-1 ${editableClass}`} {...editableAttributes}>
            {labels[flag.type]}
          </h4>
          <p className={`text-foreground/90 mb-2 ${editableClass}`} {...editableAttributes}>
            {flag.description}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className={`font-medium ${editableClass}`} {...editableAttributes}>Significance:</span>{' '}
            <span className={editableClass} {...editableAttributes}>{flag.significance}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
