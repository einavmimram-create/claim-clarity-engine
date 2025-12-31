import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ReserveRange {
  level: 'Low' | 'Base' | 'High';
  amount: string;
  reasoning: string;
  icon: React.ReactNode;
}

interface ReserveGuidanceProps {
  isEditing?: boolean;
}

const reserveRanges: ReserveRange[] = [
  {
    level: 'Low',
    amount: '$85,000',
    reasoning: 'Conservative assumptions: successful causation defense on 2003 strain, aggressive medical bill reductions, limited pain and suffering.',
    icon: <TrendingDown className="w-4 h-4 text-success" />,
  },
  {
    level: 'Base',
    amount: '$145,000',
    reasoning: 'Expected exposure: Full accident-related medical ($41k), reasonable lost wages, moderate pain and suffering given surgical outcomes.',
    icon: <Minus className="w-4 h-4 text-warning" />,
  },
  {
    level: 'High',
    amount: '$225,000',
    reasoning: 'Worst-case scenario: Full medical accepted, significant lost earning capacity as photographer, enhanced damages for failed surgery.',
    icon: <TrendingUp className="w-4 h-4 text-destructive" />,
  },
];

export function ReserveGuidance({ isEditing }: ReserveGuidanceProps) {
  const editableBlockClass = isEditing
    ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="space-y-6">
      {/* Reserve Range Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Range</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Reserve Level</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Reasoning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reserveRanges.map((range) => (
              <tr key={range.level}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {range.icon}
                    <Badge 
                      variant={range.level === 'Low' ? 'low' : range.level === 'Base' ? 'medium' : 'high'}
                    >
                      {range.level}
                    </Badge>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-lg font-semibold text-foreground">{range.amount}</span>
                </td>
                <td className="px-4 py-4">
                  <span 
                    className={`text-sm text-muted-foreground ${editableBlockClass}`}
                    suppressContentEditableWarning
                    contentEditable={isEditing}
                  >
                    {range.reasoning}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* What Could Shift This Range */}
      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
        <h4 className="font-medium text-foreground mb-3">What Could Shift This Range</h4>
        <div className={`text-sm text-muted-foreground space-y-2 ${editableBlockClass}`}
             suppressContentEditableWarning
             contentEditable={isEditing}>
          <p>
            <strong className="text-foreground">Upward pressure:</strong> Discovery of additional lost income documentation, 
            expert testimony on permanent disability, or venue with plaintiff-friendly jury pool could push exposure toward 
            the high end. If the 2006 fusion is deemed a permanent solution requiring future care, lifetime medical costs increase.
          </p>
          <p>
            <strong className="text-foreground">Downward pressure:</strong> Obtaining 2003 primary care records showing more 
            significant prior back issues, successful IME challenging surgical necessity, or demonstrating claimant returned 
            to photography work could reduce exposure toward the low range.
          </p>
        </div>
      </div>
    </div>
  );
}
