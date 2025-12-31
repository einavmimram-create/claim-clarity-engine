import { AlertTriangle, TrendingUp, Activity, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EvidenceLink } from './EvidenceLink';

type ExposureLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface RiskDriver {
  category: string;
  icon: React.ReactNode;
  level: 'low' | 'medium' | 'high';
  description: string;
  evidenceSource?: string;
  evidencePageRef?: string;
}

interface LitigationExposureScoreProps {
  isEditing?: boolean;
}

const exposureLevel: ExposureLevel = 'MEDIUM';

const riskDrivers: RiskDriver[] = [
  {
    category: 'Severity Drivers',
    icon: <AlertTriangle className="w-4 h-4" />,
    level: 'high',
    description: 'Failed initial surgery requiring complex revision fusion with instrumentation. Documented permanent functional limitations.',
    evidenceSource: 'Surgical Report',
    evidencePageRef: 'SURG-002',
  },
  {
    category: 'Causation Risk',
    icon: <Activity className="w-4 h-4" />,
    level: 'low',
    description: 'Strong causation link: MRI-confirmed acute traumatic disc extrusion with compatible mechanism. Minor vulnerability from 2003 strain.',
    evidenceSource: 'MRI Report',
    evidencePageRef: 'MRI-001',
  },
  {
    category: 'Treatment Pattern Risk',
    icon: <TrendingUp className="w-4 h-4" />,
    level: 'medium',
    description: 'Treatment escalation from conservative care to major surgeries is clinically justified. Some early diagnostic delays noted.',
    evidenceSource: 'Treatment Timeline',
    evidencePageRef: 'TL-001',
  },
  {
    category: 'Plaintiff Leverage Risk',
    icon: <Scale className="w-4 h-4" />,
    level: 'medium',
    description: 'Professional photographer with documented lost earning capacity. Sympathetic plaintiff profile with clear liability facts.',
    evidenceSource: 'Demand Package',
    evidencePageRef: 'DEM-001',
  },
];

const exposureLevelStyles = {
  LOW: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
    badge: 'low' as const,
  },
  MEDIUM: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    badge: 'medium' as const,
  },
  HIGH: {
    bg: 'bg-destructive/10',
    border: 'border-destructive/30',
    text: 'text-destructive',
    badge: 'high' as const,
  },
};

const riskLevelColors = {
  low: 'text-success',
  medium: 'text-warning',
  high: 'text-destructive',
};

export function LitigationExposureScore({ isEditing }: LitigationExposureScoreProps) {
  const styles = exposureLevelStyles[exposureLevel];
  
  const editableBlockClass = isEditing
    ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className={`${styles.bg} ${styles.border} border-2 rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Litigation Exposure Score</h3>
          <Badge variant={styles.badge} className="text-lg px-4 py-1.5">
            {exposureLevel}
          </Badge>
        </div>
        
        <p className={`text-sm ${editableBlockClass}`} suppressContentEditableWarning contentEditable={isEditing}>
          This claim presents <strong>moderate litigation exposure</strong>. While causation is well-supported by objective findings, 
          the severity of injury (failed surgery requiring revision fusion) and plaintiff's professional occupation create 
          meaningful damages exposure. The 2003 prior back strain offers limited defensive leverage given the acute nature 
          of the 2005 traumatic disc extrusion.
        </p>
      </div>

      {/* Risk Drivers Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {riskDrivers.map((driver) => (
          <div key={driver.category} className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={riskLevelColors[driver.level]}>{driver.icon}</span>
                <h4 className="font-medium text-foreground text-sm">{driver.category}</h4>
              </div>
              <Badge variant={driver.level}>{driver.level.charAt(0).toUpperCase() + driver.level.slice(1)}</Badge>
            </div>
            <p className={`text-xs text-muted-foreground mb-2 ${editableBlockClass}`} 
               suppressContentEditableWarning 
               contentEditable={isEditing}>
              {driver.description}
            </p>
            {driver.evidenceSource && driver.evidencePageRef && (
              <EvidenceLink source={driver.evidenceSource} pageRef={driver.evidencePageRef} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
