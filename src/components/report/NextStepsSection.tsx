import { CheckCircle, AlertTriangle, TrendingUp, FileSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EvidenceLink } from './EvidenceLink';

interface ActionItem {
  action: string;
  whyItMatters: string;
  riskAddressed: string;
  owner: string;
  priority: 'high' | 'medium' | 'low';
}

interface LeakageSignal {
  description: string;
  whyIncreasesExposure: string;
  evidenceSource: string;
  evidencePageRef: string;
  severity: 'high' | 'medium' | 'low';
}

interface NextStepsSectionProps {
  isEditing?: boolean;
}

const actionItems: ActionItem[] = [
  {
    action: 'Obtain 2003–2005 primary care records from Dr. Terlinsky',
    whyItMatters: 'May reveal undisclosed prior back treatment that strengthens pre-existing condition defense',
    riskAddressed: 'Causation',
    owner: 'Adjuster',
    priority: 'high',
  },
  {
    action: 'Request peer review of 2006 revision fusion necessity',
    whyItMatters: 'Validates or challenges the medical necessity of the most expensive procedure',
    riskAddressed: 'Medical Inflation',
    owner: 'Medical Review',
    priority: 'high',
  },
  {
    action: 'Challenge $8,178.05 sinus surgery billing inclusion',
    whyItMatters: 'Clearly unrelated charges that should be excluded from any settlement calculation',
    riskAddressed: 'Billing Leakage',
    owner: 'Bill Review',
    priority: 'medium',
  },
  {
    action: 'Depose treating surgeon on failure of initial discectomy',
    whyItMatters: 'Understand whether surgical complications are attributable to original injury vs. surgical technique',
    riskAddressed: 'Litigation',
    owner: 'Defense Counsel',
    priority: 'medium',
  },
  {
    action: 'Verify employment status and income post-2006',
    whyItMatters: 'Claimant may have returned to work, limiting lost wage claims',
    riskAddressed: 'Damages',
    owner: 'Adjuster',
    priority: 'medium',
  },
];

const leakageSignals: LeakageSignal[] = [
  {
    description: 'Treatment escalation: Conservative care → discectomy → revision fusion within 18 months',
    whyIncreasesExposure: 'Rapid escalation pattern may indicate over-treatment or could reflect genuine treatment failure requiring aggressive intervention.',
    evidenceSource: 'Treatment Timeline',
    evidencePageRef: 'TL-001',
    severity: 'medium',
  },
  {
    description: 'Duplicate radiology billing entries identified',
    whyIncreasesExposure: 'Inflates total medical claim by double-counting imaging services.',
    evidenceSource: 'Billing Audit',
    evidencePageRef: 'BILL-003',
    severity: 'high',
  },
  {
    description: 'Early hip tendinitis diagnosis vs. disc-related referred pain',
    whyIncreasesExposure: 'Initial misdiagnosis led to potentially unnecessary hip injection treatment before correct spinal diagnosis.',
    evidenceSource: 'Initial Consult Notes',
    evidencePageRef: 'CONS-001',
    severity: 'low',
  },
  {
    description: 'Billing includes unrelated FESS sinus surgery ($8,178.05)',
    whyIncreasesExposure: 'Non-trauma related procedure bundled into claim inflates total by 20%.',
    evidenceSource: 'Inova Fairfax Statement',
    evidencePageRef: 'INV-001',
    severity: 'high',
  },
];

const priorityColors = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-success/10 text-success',
};

export function NextStepsSection({ isEditing }: NextStepsSectionProps) {
  const editableBlockClass = isEditing
    ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="space-y-8">
      {/* A. What To Do Now */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">What To Do Now</h3>
        </div>
        
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Why It Matters</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Risk Addressed</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {actionItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full mt-1.5 ${priorityColors[item.priority].split(' ')[0]}`} />
                      <span 
                        className={`text-sm text-foreground ${editableBlockClass}`}
                        suppressContentEditableWarning
                        contentEditable={isEditing}
                      >
                        {item.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span 
                      className={`text-sm text-muted-foreground ${editableBlockClass}`}
                      suppressContentEditableWarning
                      contentEditable={isEditing}
                    >
                      {item.whyItMatters}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{item.riskAddressed}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">{item.owner}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* B. Leakage Risk */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Leakage Risk</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Medical-legal inflation signals that could increase claim exposure if not addressed.
        </p>

        <div className="space-y-3">
          {leakageSignals.map((signal, index) => (
            <div 
              key={index} 
              className={`rounded-lg p-4 border ${
                signal.severity === 'high' 
                  ? 'bg-destructive/5 border-destructive/20' 
                  : signal.severity === 'medium'
                  ? 'bg-warning/5 border-warning/20'
                  : 'bg-secondary border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <p 
                  className={`text-sm font-medium text-foreground ${editableBlockClass}`}
                  suppressContentEditableWarning
                  contentEditable={isEditing}
                >
                  {signal.description}
                </p>
                <Badge variant={signal.severity}>{signal.severity}</Badge>
              </div>
              <p 
                className={`text-xs text-muted-foreground mb-2 ${editableBlockClass}`}
                suppressContentEditableWarning
                contentEditable={isEditing}
              >
                <strong>Impact:</strong> {signal.whyIncreasesExposure}
              </p>
              <EvidenceLink source={signal.evidenceSource} pageRef={signal.evidencePageRef} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
