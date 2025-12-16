import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Contradiction } from '@/types/claim';
import { EvidenceLink } from './EvidenceLink';

interface ContradictionCardProps {
  contradiction: Contradiction;
}

export function ContradictionCard({ contradiction }: ContradictionCardProps) {
  const typeLabels = {
    diagnosis: 'Diagnosis Conflict',
    notes_vs_procedures: 'Notes vs Procedures',
    narrative_vs_records: 'Narrative vs Records',
  };

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-foreground">
              {typeLabels[contradiction.type]}
            </span>
            <Badge variant={contradiction.severity}>
              {contradiction.severity.charAt(0).toUpperCase() + contradiction.severity.slice(1)} Severity
            </Badge>
          </div>
          <p className="text-foreground/90 mb-3">{contradiction.description}</p>
          <div className="flex flex-wrap gap-2">
            {contradiction.sources.map((source, index) => (
              <EvidenceLink key={index} source={source} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
