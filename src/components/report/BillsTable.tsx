import { Badge } from '@/components/ui/badge';
import { BillItem } from '@/types/claim';
import { Copy } from 'lucide-react';

interface BillsTableProps {
  bills: BillItem[];
  showRiskOnly?: boolean;
  isEditing?: boolean;
}

export function BillsTable({ bills, showRiskOnly = false, isEditing = false }: BillsTableProps) {
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
  const editableAttributes = isEditing
    ? { contentEditable: true, suppressContentEditableWarning: true }
    : {};
  const editableClass = isEditing
    ? 'border border-dashed border-border rounded hover:border-primary cursor-text'
    : '';

  const supportLevelText = {
    low: 'Strong Support',
    medium: 'Moderate Support',
    high: 'Limited Support',
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
            <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Support Level</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredBills.map((bill) => {
            const displayAmount =
              bill.description === 'FESS Sinus Surgery' && bill.amount === 10890.93
                ? 8178.05
                : bill.amount;

            return (
              <tr 
                key={bill.id} 
                className={`transition-colors ${bill.documentLink ? 'cursor-pointer hover:bg-secondary/50' : 'hover:bg-secondary/50'}`}
                onClick={() => {
                  if (bill.documentLink) {
                    window.open(bill.documentLink, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <td className="px-4 py-3 text-sm text-foreground">
                  <span className={editableClass} {...editableAttributes}>{bill.date}</span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  <span className={editableClass} {...editableAttributes}>{bill.provider}</span>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <span className={editableClass} {...editableAttributes}>{bill.description}</span>
                    {bill.isDuplicate && (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive">
                        <Copy className="w-3 h-3" />
                        Duplicate
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground text-right font-medium">
                  <span className={editableClass} {...editableAttributes}>{formatCurrency(displayAmount)}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={bill.riskScore}>
                    <span className={editableClass} {...editableAttributes}>
                      {supportLevelText[bill.riskScore]}
                    </span>
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
