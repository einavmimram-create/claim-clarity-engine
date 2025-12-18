import { Badge } from '@/components/ui/badge';
import { BillItem } from '@/types/claim';
import { AlertTriangle, CheckCircle, Copy } from 'lucide-react';

interface BillsTableProps {
  bills: BillItem[];
  showRiskOnly?: boolean;
}

export function BillsTable({ bills, showRiskOnly = false }: BillsTableProps) {
  const filteredBills = showRiskOnly
    ? bills.filter(b => b.riskScore === 'high' || b.riskScore === 'medium')
    : bills;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-secondary">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Provider</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Description</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
            <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredBills.map((bill) => (
            <tr 
              key={bill.id} 
              className={`transition-colors ${bill.documentLink ? 'cursor-pointer hover:bg-secondary/50' : 'hover:bg-secondary/50'}`}
              onClick={() => {
                if (bill.documentLink) {
                  window.open(bill.documentLink, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <td className="px-4 py-3 text-sm text-foreground">{bill.date}</td>
              <td className="px-4 py-3 text-sm text-foreground">{bill.provider}</td>
              <td className="px-4 py-3 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  {bill.description}
                  {bill.isDuplicate && (
                    <span className="inline-flex items-center gap-1 text-xs text-destructive">
                      <Copy className="w-3 h-3" />
                      Duplicate
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-foreground text-right font-medium">
                {formatCurrency(bill.amount)}
              </td>
              <td className="px-4 py-3 text-center">
                {bill.isAccidentRelated ? (
                  <span className="inline-flex items-center gap-1 text-xs text-success">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Accident-related
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Unrelated
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <Badge variant={bill.riskScore}>
                  {bill.riskScore.charAt(0).toUpperCase() + bill.riskScore.slice(1)}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
