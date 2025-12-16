import { ExternalLink } from 'lucide-react';

interface EvidenceLinkProps {
  source: string;
  pageRef?: string;
}

export function EvidenceLink({ source, pageRef }: EvidenceLinkProps) {
  return (
    <button className="inline-flex items-center gap-1 text-report-link hover:underline text-sm font-medium">
      <ExternalLink className="w-3.5 h-3.5" />
      <span>{source}</span>
      {pageRef && <span className="text-muted-foreground">({pageRef})</span>}
    </button>
  );
}
