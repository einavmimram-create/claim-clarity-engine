import { useState } from 'react';
import { MedicalEvent } from '@/types/claim';
import { EvidenceLink } from './EvidenceLink';
import { Calendar, User, Stethoscope, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEventProps {
  event: MedicalEvent;
  isFirst?: boolean;
  isLast?: boolean;
  isEditing?: boolean;
}

export function TimelineEvent({ event, isFirst, isLast, isEditing = false }: TimelineEventProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive expanded content from existing event data or use provided fields
  const narrativeSummary = event.narrativeSummary || event.description;
  const patientComplaints = event.patientComplaints || [];
  const medicalSpecialties = event.medicalSpecialties || (event.specialty ? [event.specialty] : []);
  const medicalFacilities = event.medicalFacilities || (event.provider ? [event.provider] : []);
  const procedureTypes = event.procedureTypes || (event.eventType ? [event.eventType] : []);
  const vitals = event.vitals || {};
  const diagnostics = event.diagnostics || [];
  const interventions = event.interventions || [];
  const isKeyDate = event.isKeyDate || false;
  const needsReview = event.needsReview || false;
  const fileIds = event.fileIds || (event.sourceDocument ? [event.sourceDocument] : []);
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

      {/* Expand/Collapse Chevron */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="absolute left-7 top-1.5 w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-20 cursor-pointer rounded hover:bg-secondary/50"
        aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        type="button"
      >
        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      <div className="bg-report-section rounded-lg p-4 border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span className={editableClass} {...editableAttributes}>{event.date}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className={editableClass} {...editableAttributes}>{event.provider}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span className={editableClass} {...editableAttributes}>{event.specialty}</span>
            </span>
          </div>
          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
            <span className={editableClass} {...editableAttributes}>{event.eventType}</span>
          </span>
        </div>
        
        <p className={`text-foreground mb-3 ${editableClass}`} {...editableAttributes}>
          {event.description}
        </p>
        
        <EvidenceLink source={event.sourceDocument} pageRef={event.sourcePageRef} />
      </div>

      {/* Expanded Details Panel */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        )}
      >
        <div className="ml-4 bg-muted/30 rounded-lg p-4 border border-border/50">
          {/* Narrative Summary */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Narrative Event Summary</h4>
            <p className={`text-sm text-foreground/90 ${editableClass}`} {...editableAttributes}>
              {narrativeSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Complaints */}
            {patientComplaints.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Patient Complaints</h4>
                <div className="flex flex-wrap gap-1.5">
                  {patientComplaints.map((complaint, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {complaint}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Specialties */}
            {medicalSpecialties.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Medical Specialties</h4>
                <div className="flex flex-wrap gap-1.5">
                  {medicalSpecialties.map((specialty, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Facilities */}
            {medicalFacilities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Medical Facilities</h4>
                <div className="flex flex-wrap gap-1.5">
                  {medicalFacilities.map((facility, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Procedure Types */}
            {procedureTypes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Procedure Types</h4>
                <div className="flex flex-wrap gap-1.5">
                  {procedureTypes.map((procedure, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {procedure}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Vitals */}
            {Object.keys(vitals).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Vitals</h4>
                <div className="space-y-1">
                  {Object.entries(vitals).map(([key, value]) => (
                    <div key={key} className="text-sm text-foreground/90">
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostics */}
            {diagnostics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Diagnostics</h4>
                <div className="flex flex-wrap gap-1.5">
                  {diagnostics.map((diagnostic, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {diagnostic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Interventions */}
            {interventions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Interventions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {interventions.map((intervention, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {intervention}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Flags */}
          {(isKeyDate || needsReview) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {isKeyDate && (
                <Badge variant="default" className="text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Is Key Date
                </Badge>
              )}
              {needsReview && (
                <Badge variant="high" className="text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Needs Review
                </Badge>
              )}
            </div>
          )}

          {/* File IDs */}
          {fileIds.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                File IDs
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {fileIds.map((fileId, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs font-mono">
                    {fileId}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Source Document Reference */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Source:</span> {event.sourceDocument} {event.sourcePageRef && `(${event.sourcePageRef})`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
