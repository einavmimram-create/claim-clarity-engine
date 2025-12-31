import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EvidenceLink } from './EvidenceLink';

interface ActionItem {
  id: string;
  action: string;
  completed: boolean;
}

interface LeakageSignal {
  signal: string;
  severity: 'high' | 'medium' | 'low';
  whatItMeans: string;
  financialImpact: string;
  evidencePageRef: string;
}

interface NextStepsSectionProps {
  isEditing?: boolean;
}

const initialActionItems: ActionItem[] = [
  {
    id: '1',
    action: 'Obtain 2003–2005 primary care records from Dr. Terlinsky',
    completed: false,
  },
  {
    id: '2',
    action: 'Request peer review of 2006 revision fusion necessity',
    completed: false,
  },
  {
    id: '3',
    action: 'Challenge $8,178.05 sinus surgery billing inclusion',
    completed: false,
  },
  {
    id: '4',
    action: 'Depose treating surgeon on failure of initial discectomy',
    completed: false,
  },
  {
    id: '5',
    action: 'Verify employment status and income post-2006',
    completed: false,
  },
];

const leakageSignals: LeakageSignal[] = [
  {
    signal: 'Rapid Surgical Escalation',
    severity: 'medium',
    whatItMeans: 'Conservative care escalated to discectomy and revision fusion within 18 months — pattern indicates potential over-treatment or accelerated surgical path increasing jury value and future care exposure',
    financialImpact: 'Elevated future medical and pain & suffering valuation',
    evidencePageRef: 'TL-001',
  },
  {
    signal: 'Duplicate Radiology Charges',
    severity: 'high',
    whatItMeans: 'Identical imaging billed multiple times',
    financialImpact: 'Direct inflation of claim value',
    evidencePageRef: 'BILL-003',
  },
  {
    signal: 'Misaligned Early Diagnosis',
    severity: 'low',
    whatItMeans: 'Hip tendinitis diagnosed before disc pathology was identified — early injection likely unnecessary',
    financialImpact: 'Low-value inflation through non-causal care',
    evidencePageRef: 'CONS-001',
  },
  {
    signal: 'Unrelated Sinus Surgery Included',
    severity: 'high',
    whatItMeans: 'Non-trauma FESS sinus surgery bundled into claim',
    financialImpact: '$8,178 direct overpayment and +20% artificial claim inflation',
    evidencePageRef: 'INV-001',
  },
];

const severityBadgeVariant = {
  high: 'high' as const,
  medium: 'medium' as const,
  low: 'low' as const,
};

export function NextStepsSection({ isEditing }: NextStepsSectionProps) {
  const [actionItems, setActionItems] = useState(initialActionItems);

  const toggleAction = (id: string) => {
    setActionItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* A. What To Do Now */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">What To Do Now</h3>
        
        <div className="space-y-3">
          {actionItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={() => toggleAction(item.id)}
                className="mt-0.5"
              />
              <label 
                htmlFor={item.id}
                className={`text-sm cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              >
                {item.action}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* B. Leakage & Inflation Risk Signals */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Leakage & Inflation Risk Signals</h3>
        
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-medium">Signal</TableHead>
                <TableHead className="font-medium">Severity</TableHead>
                <TableHead className="font-medium">What It Means</TableHead>
                <TableHead className="font-medium">Financial Impact</TableHead>
                <TableHead className="font-medium">Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leakageSignals.map((signal, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-foreground">
                    {signal.signal}
                  </TableCell>
                  <TableCell>
                    <Badge variant={severityBadgeVariant[signal.severity]}>
                      {signal.severity.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {signal.whatItMeans}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {signal.financialImpact}
                  </TableCell>
                  <TableCell>
                    <EvidenceLink source="Evidence" pageRef={signal.evidencePageRef} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
