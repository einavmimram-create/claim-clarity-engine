import { MedicalEvent } from '@/types/claim';
import { EvidenceLink } from './EvidenceLink';
import { Calendar, User, Stethoscope } from 'lucide-react';

interface TimelineEventProps {
  event: MedicalEvent;
  isFirst?: boolean;
  isLast?: boolean;
}

export function TimelineEvent({ event, isFirst, isLast }: TimelineEventProps) {
  return (
    <div className="relative pl-8 pb-6 last:pb-0">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>

      <div className="bg-report-section rounded-lg p-4 border border-border">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {event.date}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {event.provider}
            </span>
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4" />
              {event.specialty}
            </span>
          </div>
          <span className="text-xs font-medium bg-secondary px-2 py-1 rounded">
            {event.eventType}
          </span>
        </div>
        
        <p className="text-foreground mb-3">{event.description}</p>
        
        <EvidenceLink source={event.sourceDocument} pageRef={event.sourcePageRef} />
      </div>
    </div>
  );
}
