import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EvidenceLink } from './EvidenceLink';

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
    position: { top: '42%', left: '50%' },
  },
  {
    id: 'left-leg',
    bodyPart: 'Left Lower Extremity',
    driver: 'L4 Radiculopathy',
    whyItMatters: 'Documented nerve involvement with quadriceps weakness supports causation but increases damages claim for functional impairment.',
    evidenceSource: 'Neurology Consult',
    evidencePageRef: 'NEURO-003',
    riskScore: 'high',
    position: { top: '70%', left: '45%' },
  },
  {
    id: 'sinus',
    bodyPart: 'Sinuses',
    driver: 'Pre-existing Sinusitis (Unrelated)',
    whyItMatters: 'Prior FESS surgery is clearly unrelated to trauma. Billing inclusion inflates claim but is easily defensible.',
    evidenceSource: 'ENT Records',
    evidencePageRef: 'ENT-001',
    riskScore: 'low',
    position: { top: '15%', left: '50%' },
  },
  {
    id: 'lower-back',
    bodyPart: 'Lower Back (General)',
    driver: '2003 Lumbosacral Strain History',
    whyItMatters: 'Prior back condition not disclosed in initial 2005 notes. Could be leveraged to argue pre-existing vulnerability.',
    evidenceSource: 'Primary Care Records',
    evidencePageRef: 'PCP-2003',
    riskScore: 'medium',
    position: { top: '38%', left: '50%' },
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

interface ExposureDriversPanelProps {
  isEditing?: boolean;
}

export function ExposureDriversPanel({ isEditing }: ExposureDriversPanelProps) {
  const [selectedDriver, setSelectedDriver] = useState<ExposureDriver | null>(null);

  return (
    <div className="relative bg-secondary/30 rounded-xl border border-border p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-4">Exposure Drivers</h4>
      
      {/* Body Silhouette Container */}
      <div className="relative w-full h-[320px] flex items-center justify-center">
        {/* Simple body silhouette using CSS */}
        <div className="relative w-32 h-72">
          {/* Head */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-muted-foreground/20 border-2 border-muted-foreground/30" />
          
          {/* Neck */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-4 h-3 bg-muted-foreground/20" />
          
          {/* Torso */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-24 bg-muted-foreground/20 rounded-t-lg border-2 border-muted-foreground/30" />
          
          {/* Arms */}
          <div className="absolute top-14 left-0 w-3 h-20 bg-muted-foreground/20 rounded-full border-2 border-muted-foreground/30 -translate-x-1" />
          <div className="absolute top-14 right-0 w-3 h-20 bg-muted-foreground/20 rounded-full border-2 border-muted-foreground/30 translate-x-1" />
          
          {/* Lower torso/hips */}
          <div className="absolute top-36 left-1/2 -translate-x-1/2 w-14 h-8 bg-muted-foreground/20 rounded-b-lg border-2 border-t-0 border-muted-foreground/30" />
          
          {/* Legs */}
          <div className="absolute top-44 left-1/2 -translate-x-[70%] w-5 h-24 bg-muted-foreground/20 rounded-b-lg border-2 border-muted-foreground/30" />
          <div className="absolute top-44 left-1/2 -translate-x-[30%] w-5 h-24 bg-muted-foreground/20 rounded-b-lg border-2 border-muted-foreground/30" />

          {/* Clickable markers */}
          {exposureDrivers.map((driver) => (
            <button
              key={driver.id}
              onClick={() => setSelectedDriver(driver)}
              className={`absolute w-5 h-5 rounded-full ${riskColors[driver.riskScore]} border-2 
                cursor-pointer transition-all duration-200 hover:scale-125 hover:shadow-lg
                animate-pulse hover:animate-none z-10 -translate-x-1/2 -translate-y-1/2`}
              style={{ top: driver.position.top, left: driver.position.left }}
              title={driver.bodyPart}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>
      </div>

      {/* Detail Card Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{selectedDriver.bodyPart}</h3>
                <Badge variant={riskBadgeVariants[selectedDriver.riskScore]} className="mt-1">
                  {selectedDriver.riskScore.charAt(0).toUpperCase() + selectedDriver.riskScore.slice(1)} Risk
                </Badge>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Driver</p>
                <p className="text-sm text-foreground">{selectedDriver.driver}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Why It Matters</p>
                <p className="text-sm text-foreground">{selectedDriver.whyItMatters}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Evidence Source</p>
                <EvidenceLink source={selectedDriver.evidenceSource} pageRef={selectedDriver.evidencePageRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
