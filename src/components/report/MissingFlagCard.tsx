import { AlertCircle, FileQuestion, Search, Minus } from 'lucide-react';
import { MissingFlag } from '@/types/claim';

interface MissingFlagCardProps {
  flag: MissingFlag;
}

export function MissingFlagCard({ flag }: MissingFlagCardProps) {
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

  return (
    <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-warning/10 rounded-lg">
          <Icon className="w-5 h-5 text-warning" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">{labels[flag.type]}</h4>
          <p className="text-foreground/90 mb-2">{flag.description}</p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Significance:</span> {flag.significance}
          </p>
        </div>
      </div>
    </div>
  );
}
