import { ExternalLink } from 'lucide-react';

interface EvidenceLinkProps {
  source: string;
  pageRef?: string;
}

export function EvidenceLink({ source, pageRef }: EvidenceLinkProps) {
  // Determine the link URL based on source and pageRef
  const getLinkUrl = () => {
    if (source === 'Incident Report' && pageRef === 'INC-001') {
      return '/Claim Statement.html';
    }
    if (source === 'MRI Report' && pageRef === 'MRI-001') {
      return '/Attachment 4.html#page4';
    }
    // Add other document links here as needed
    return null;
  };

  const linkUrl = getLinkUrl();

  if (linkUrl) {
    return (
      <a 
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-report-link hover:underline text-sm font-medium cursor-pointer"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        <span>{source}</span>
        {pageRef && <span className="text-muted-foreground">({pageRef})</span>}
      </a>
    );
  }

  return (
    <button className="inline-flex items-center gap-1 text-report-link hover:underline text-sm font-medium">
      <ExternalLink className="w-3.5 h-3.5" />
      <span>{source}</span>
      {pageRef && <span className="text-muted-foreground">({pageRef})</span>}
    </button>
  );
}
