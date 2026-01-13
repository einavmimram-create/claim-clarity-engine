import { AlertTriangle } from 'lucide-react';
import { Contradiction } from '@/types/claim';
import { EvidenceLink } from './EvidenceLink';

interface ContradictionCardProps {
  contradiction: Contradiction;
  isEditing?: boolean;
}

export function ContradictionCard({ contradiction, isEditing = false }: ContradictionCardProps) {
  const typeLabels = {
    diagnosis: 'Diagnosis Conflict',
    notes_vs_procedures: 'Notes vs Procedures',
    narrative_vs_records: 'Records Inconsistency',
  };

  const editableAttributes = isEditing
    ? { contentEditable: true, suppressContentEditableWarning: true }
    : {};
  const editableClass = isEditing
    ? 'border border-dashed border-border rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-medium text-foreground ${editableClass}`} {...editableAttributes}>
              {typeLabels[contradiction.type]}
            </span>
          </div>
          <p className={`text-foreground/90 mb-3 ${editableClass}`} {...editableAttributes}>
            {contradiction.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {contradiction.sources.map((source, index) => (
              <div key={index} className={editableClass} {...editableAttributes}>
                <EvidenceLink source={source} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
