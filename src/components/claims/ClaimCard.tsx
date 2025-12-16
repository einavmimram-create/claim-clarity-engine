import { Link } from 'react-router-dom';
import { FileText, Clock, Files } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Claim } from '@/types/claim';

interface ClaimCardProps {
  claim: Claim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const statusVariant = claim.status === 'ready' ? 'ready' : claim.status === 'processing' ? 'processing' : 'error';

  return (
    <Link
      to={`/claim/${claim.id}`}
      className="block bg-card border border-border rounded-lg p-5 hover:shadow-card-hover transition-shadow duration-200 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {claim.name}
            </h3>
            {claim.accidentDate && (
              <p className="text-sm text-muted-foreground">
                Accident: {claim.accidentDate}
              </p>
            )}
          </div>
        </div>
        <Badge variant={statusVariant}>
          {claim.status === 'processing' && (
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse-subtle" />
          )}
          {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
        </Badge>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Files className="w-4 h-4" />
          <span>{claim.fileCount} files</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Updated {formatDate(claim.lastUpdated)}</span>
        </div>
        {claim.totalBilled && (
          <div className="ml-auto font-medium text-foreground">
            {formatCurrency(claim.totalBilled)} billed
          </div>
        )}
      </div>
    </Link>
  );
}
