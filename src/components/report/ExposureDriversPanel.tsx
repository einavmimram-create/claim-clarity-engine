import { useState, Fragment } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EvidenceLink } from './EvidenceLink';
import humanBodyImage from '@/assets/human-body-anatomy.jpg';

interface ExposureDriver {
  id: string;
  bodyPart: string;
  driver: string;
  whyItMatters: string;
  evidenceSource: string;
  evidencePageRef: string;
  riskScore: 'low' | 'medium' | 'high';
  position: { top: string; left: string };
}

const exposureDrivers: ExposureDriver[] = [
  {
    id: 'lumbar-spine',
    bodyPart: 'Lumbar Spine (L3-L4)',
    driver: 'Disc Herniation with Extruded Fragment',
    whyItMatters: 'Primary injury site with surgical intervention. Failed initial discectomy led to complex revision fusion, significantly increasing exposure.',
    evidenceSource: 'MRI Report',
    evidencePageRef: 'MRI-001',
    riskScore: 'high',
    position: { top: '38%', left: '50%' }, // Belly area - L3-L4 region
  },
  {
    id: 'left-leg',
    bodyPart: 'Left Lower Extremity',
    driver: 'L4 Radiculopathy',
    whyItMatters: 'Documented nerve involvement with quadriceps weakness supports causation but increases damages claim for functional impairment.',
    evidenceSource: 'Neurology Consult',
    evidencePageRef: 'NEURO-003',
    riskScore: 'high',
    position: { top: '65%', left: '40%' }, // Left thigh/upper leg area (left side of body)
  },
  {
    id: 'sinus',
    bodyPart: 'Sinuses',
    driver: 'Pre-existing Sinusitis',
    whyItMatters: 'Prior FESS surgery is possibly unrelated to trauma. Billing inclusion inflates claim but can be defensible.',
    evidenceSource: 'ENT Records',
    evidencePageRef: 'ENT-001',
    riskScore: 'low',
    position: { top: '6%', left: '50%' }, // Forehead area
  },
  {
    id: 'lower-back',
    bodyPart: 'Lower Back (General)',
    driver: '2003 Lumbosacral Strain History',
    whyItMatters: 'Prior back condition not disclosed in initial 2005 notes. Could be leveraged to argue pre-existing vulnerability.',
    evidenceSource: 'Primary Care Records',
    evidencePageRef: 'PCP-2003',
    riskScore: 'medium',
    position: { top: '36%', left: '48%' }, // Belly area - lower back general
  },
];

const riskColors = {
  low: 'bg-success border-success',
  medium: 'bg-warning border-warning',
  high: 'bg-destructive border-destructive',
};

const riskBadgeVariants = {
  low: 'low' as const,
  medium: 'medium' as const,
  high: 'high' as const,
};

const riskSupportText = {
  low: 'Limited record support for accident relation',
  medium: 'Moderate record support for accident relation',
  high: 'Strong record support for accident relation',
};

interface ExposureDriversPanelProps {
  isEditing?: boolean;
}

export function ExposureDriversPanel({ isEditing }: ExposureDriversPanelProps) {
  const [selectedDriver, setSelectedDriver] = useState<ExposureDriver | null>(null);
  const [hoveredDriver, setHoveredDriver] = useState<ExposureDriver | null>(null);

  return (
    <div className="relative bg-secondary/30 rounded-xl border border-border p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">Exposure Drivers</h4>
      
      {/* Body Image Container */}
      <div className="relative w-full flex items-center justify-center">
        <div className="relative">
          <img 
            src={humanBodyImage} 
            alt="Human body anatomy for exposure mapping" 
            className="h-[400px] w-auto object-contain"
          />
          
          {/* Clickable markers */}
          {exposureDrivers.map((driver) => {
            const isSelected = selectedDriver?.id === driver.id;
            const isHovered = hoveredDriver?.id === driver.id;
            
            return (
              <Fragment key={driver.id}>
                <button
                  onClick={() => {
                    // Toggle: if already selected, deselect; otherwise select
                    setSelectedDriver(isSelected ? null : driver);
                  }}
                  onMouseEnter={() => {
                    // Only show hover if not already selected
                    if (!selectedDriver) {
                      setHoveredDriver(driver);
                    }
                  }}
                  onMouseLeave={() => {
                    // Only clear hover if not selected
                    if (!isSelected) {
                      setHoveredDriver(null);
                    }
                  }}
                  className={`absolute w-3 h-3 rounded-full ${riskColors[driver.riskScore]} border-2 
                    cursor-pointer transition-all duration-200 hover:scale-125 hover:shadow-lg
                    z-20 -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  style={{ top: driver.position.top, left: driver.position.left }}
                  title={driver.bodyPart}
                />
                
                {/* Inline Detail Card - positioned next to the dot */}
                {(isSelected || (isHovered && !selectedDriver)) && (
                  <div 
                    className="absolute z-30 bg-card border border-border rounded-xl shadow-lg max-w-xs w-[280px] p-4 animate-in fade-in zoom-in-95"
                    style={{
                      top: driver.position.top,
                      left: `calc(${driver.position.left} + 12px)`,
                      transform: 'translateY(-50%)',
                      // If card would overflow right, position to the left of the dot instead
                      ...(parseFloat(driver.position.left) > 60 ? {
                        left: `calc(${driver.position.left} - 292px)`, // 280px width + 12px offset
                      } : {}),
                    }}
                    onMouseEnter={() => {
                      // Keep hovered when hovering over the card itself
                      if (!selectedDriver) {
                        setHoveredDriver(driver);
                      }
                    }}
                    onMouseLeave={() => {
                      // Only clear hover if not selected
                      if (!isSelected) {
                        setHoveredDriver(null);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{driver.bodyPart}</h3>
                        <Badge variant={riskBadgeVariants[driver.riskScore]} className="mt-1 text-xs">
                          {riskSupportText[driver.riskScore]}
                        </Badge>
                      </div>
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDriver(null);
                          }}
                          className="p-1 hover:bg-secondary rounded-lg transition-colors ml-2 flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Driver</p>
                        <p className="text-sm text-foreground">{driver.driver}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Why It Matters</p>
                        <p className="text-sm text-foreground">{driver.whyItMatters}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Evidence Source</p>
                        <EvidenceLink source={driver.evidenceSource} pageRef={driver.evidencePageRef} />
                      </div>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Limited Support</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Moderate Support</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Strong Support</span>
        </div>
      </div>
    </div>
  );
}
