import { useState } from 'react';
import { MedicalEvent } from '@/types/claim';
import { EvidenceLink } from './EvidenceLink';
import { ChevronRight, AlertTriangle, FileText, Pencil, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEventProps {
  event: MedicalEvent;
  patientName?: string;
  onToggleKeyEvent?: (eventId: string) => void;
  onToggleNeedsReview?: (eventId: string) => void;
  onEditRequested?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  isEditing?: boolean;
}

export function TimelineEvent({
  event,
  patientName,
  onToggleKeyEvent,
  onToggleNeedsReview,
  onEditRequested,
  isFirst,
  isLast,
  isEditing = false,
}: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive expanded content from existing event data or use provided fields
  const narrativeSummary = event.narrativeSummary || event.description;
  const medicalSpecialties = event.medicalSpecialties || (event.specialty ? [event.specialty] : []);
  const procedureTypes = event.procedureTypes || (event.eventType ? [event.eventType] : []);
  const vitals = event.vitals || {};
  const diagnostics = event.diagnostics || [];
  const interventions = event.interventions || [];
  const isKeyDate = event.isKeyDate || false;
  const needsReview = event.needsReview || false;
  const fileIds = event.fileIds || [];
  const resolvedPatientName = event.patientName || patientName || '';
  const doctorName = event.doctorName || (event.provider.startsWith('Dr.') ? event.provider : '');
  const medicalFacility = event.medicalFacility || (!event.provider.startsWith('Dr.') ? event.provider : '');
  const medicationType = event.medicationType || '';
  const labels = event.labels || event.patientComplaints || [];
  const sourceFileIds = Array.from(
    new Set([...(fileIds.length ? fileIds : []), ...(event.sourceDocument ? [event.sourceDocument] : [])]),
  );
  const isAccidentDate = event.date === '2005-01-23';
  const editableAttributes = isEditing
    ? { contentEditable: true, suppressContentEditableWarning: true }
    : {};
  const editableClass = isEditing
    ? 'border border-dashed border-border rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center z-0">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>

      <div
        className={cn(
          'bg-report-section rounded-lg p-4 border',
          isAccidentDate ? 'border-red-500 border-[3px]' : 'border-border',
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              <span className={editableClass} {...editableAttributes}>{event.date}</span>
              <span className="text-muted-foreground"> • </span>
              <span className={editableClass} {...editableAttributes}>{event.eventType}</span>
            </h3>
            <p className={`text-sm text-foreground/90 mt-2 ${editableClass}`} {...editableAttributes}>
              {event.description}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleKeyEvent?.(event.id);
              }}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded hover:bg-secondary/50 transition-colors',
                event.isKeyDate ? 'text-yellow-500' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={event.isKeyDate ? 'Unmark key event' : 'Mark key event'}
              type="button"
            >
              <Star className={cn('w-4 h-4', event.isKeyDate && 'fill-yellow-500')} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditRequested?.();
              }}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded hover:bg-secondary/50 transition-colors"
              aria-label="Edit event"
              type="button"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleNeedsReview?.(event.id);
              }}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded hover:bg-secondary/50 transition-colors',
                event.needsReview ? 'text-destructive' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-label={event.needsReview ? 'Clear needs review' : 'Mark needs review'}
              type="button"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded hover:bg-secondary/50"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              type="button"
            >
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded && 'rotate-90'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details Panel */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        )}
      >
        <div
          className={cn(
            'ml-4 bg-muted/30 rounded-lg p-4 border',
            isAccidentDate ? 'border-red-500 border-[3px]' : 'border-border/50',
          )}
        >
          <div className="space-y-2 text-sm text-foreground/90">
            <div>
              <span className="font-medium text-foreground">Event Summary:</span>{' '}
              <span className={editableClass} {...editableAttributes}>{narrativeSummary}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Patient Name:</span> {resolvedPatientName || '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Doctor Name:</span> {doctorName || '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Medical Specialties:</span>{' '}
              {medicalSpecialties.length ? medicalSpecialties.join(', ') : '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Medical Facility:</span> {medicalFacility || '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Procedure Types:</span>{' '}
              {procedureTypes.length ? procedureTypes.join(', ') : '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Vitals:</span>{' '}
              {Object.keys(vitals).length
                ? Object.entries(vitals)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('; ')
                : 'No vitals recorded.'}
            </div>
            <div>
              <span className="font-medium text-foreground">Diagnostics:</span>{' '}
              {diagnostics.length ? diagnostics.join('; ') : 'No diagnostics recorded.'}
            </div>
            <div>
              <span className="font-medium text-foreground">Interventions:</span>{' '}
              {interventions.length ? interventions.join('; ') : 'No interventions recorded.'}
            </div>
            <div>
              <span className="font-medium text-foreground">Medication Type:</span> {medicationType || '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Labels:</span>{' '}
              {labels.length ? labels.join(', ') : '—'}
            </div>
            <div>
              <span className="font-medium text-foreground">Is Key Date:</span> {isKeyDate ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium text-foreground">Needs Review:</span> {needsReview ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium text-foreground">Sources:</span>{' '}
              <EvidenceLink source={event.sourceDocument} pageRef={event.sourcePageRef} />
              {sourceFileIds.length > 0 && (
                <span className="ml-2 inline-flex flex-wrap gap-2 align-middle">
                  {sourceFileIds.map((fileId) => (
                    <EvidenceLink key={fileId} source={fileId} />
                  ))}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
