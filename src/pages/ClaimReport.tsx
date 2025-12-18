import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Plus, Save, X } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ReportTableOfContents } from '@/components/report/ReportTableOfContents';
import { ReportSection } from '@/components/report/ReportSection';
import { TimelineEvent } from '@/components/report/TimelineEvent';
import { ContradictionCard } from '@/components/report/ContradictionCard';
import { MissingFlagCard } from '@/components/report/MissingFlagCard';
import { BillsTable } from '@/components/report/BillsTable';
import { ConfidenceIndicator } from '@/components/report/ConfidenceIndicator';
import { EvidenceLink } from '@/components/report/EvidenceLink';
import { ExportMenu } from '@/components/report/ExportMenu';
import { AddDocumentsModal } from '@/components/claims/AddDocumentsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { mockClaims } from '@/data/mockClaims';

// Luke Frazza case data
const lukeFrazzaTimeline = [
  { id: '1', date: '2000-06-12', provider: 'Emergency Room', specialty: 'Emergency Medicine', eventType: 'ER Visit', description: 'Emergency treatment for kidney stones', sourceDocument: 'ER Records', sourcePageRef: 'ER-001' },
  { id: '2', date: '2003-06-18', provider: 'Primary Care', specialty: 'Internal Medicine', eventType: 'Office Visit', description: 'Acute lumbosacral strain; resolved', sourceDocument: 'PCP Records', sourcePageRef: 'PCP-001' },
  { id: '3', date: '2004-01-21', provider: 'Rheumatology', specialty: 'Rheumatology', eventType: 'Evaluation', description: 'Osteoarthritis evaluation (finger)', sourceDocument: 'Rheum Records', sourcePageRef: 'RH-001' },
  { id: '4', date: '2004-02-04', provider: 'ENT Surgery', specialty: 'Otolaryngology', eventType: 'Surgery', description: 'Sinus surgery (FESS)', sourceDocument: 'Surgical Records', sourcePageRef: 'ENT-001' },
  { id: '5', date: '2005-01-23', provider: 'White House Medical', specialty: 'Occupational', eventType: 'Accident', description: 'Index accident – slip-and-fall on wet floor', sourceDocument: 'Incident Report', sourcePageRef: 'INC-001' },
  { id: '6', date: '2005-02-16', provider: 'Orthopedics', specialty: 'Orthopedic Surgery', eventType: 'Evaluation', description: 'Initial post-accident evaluation', sourceDocument: 'Ortho Records', sourcePageRef: 'OR-001' },
  { id: '7', date: '2005-04-11', provider: 'Imaging Center', specialty: 'Radiology', eventType: 'MRI', description: 'MRI confirms extruded L3-L4 disc', sourceDocument: 'MRI Report', sourcePageRef: 'MRI-001' },
  { id: '8', date: '2005-04-26', provider: 'Spine Surgery Center', specialty: 'Neurosurgery', eventType: 'Surgery', description: 'L3-L4 discectomy', sourceDocument: 'Surgical Records', sourcePageRef: 'SS-001' },
  { id: '9', date: '2006-01-16', provider: 'Imaging Center', specialty: 'Radiology', eventType: 'MRI', description: 'Post-op MRI shows recurrence', sourceDocument: 'MRI Report', sourcePageRef: 'MRI-002' },
  { id: '10', date: '2006-06-29', provider: 'Spine Surgery Center', specialty: 'Neurosurgery', eventType: 'Surgery', description: 'Revision fusion with instrumentation', sourceDocument: 'Surgical Records', sourcePageRef: 'SS-002' },
];

const lukeFrazzaContradictions = [
  { id: '1', type: 'narrative_vs_records' as const, description: 'Prior History Reporting: 2003 severe back strain not disclosed in early 2005 notes', sources: ['2003 PCP Records', '2005 Ortho Intake'], severity: 'high' as const },
  { id: '2', type: 'diagnosis' as const, description: 'Initial Diagnosis Divergence: Early focus on hip tendinitis despite classic disc symptoms', sources: ['Initial Ortho Notes', 'MRI Findings'], severity: 'medium' as const },
];

const lukeFrazzaMissingFlags = [
  { id: '1', type: 'documentation_gap' as const, description: 'Primary Care Records: 2003–2005 records from Dr. Terlinsky', significance: 'Critical for establishing pre-existing condition baseline' },
  { id: '2', type: 'documentation_gap' as const, description: 'PT Logs: Detailed therapy notes (only summaries available)', significance: 'Needed to verify treatment progression and outcomes' },
];

const lukeFrazzaBills = [
  { id: '1', date: '2005-04-26', provider: 'Virginia Neurosurgeons, PC', description: 'L3–L4 Decompression / Discectomy – Surgeon (Professional Fees)', amount: 10557.00, category: 'Surgery', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: false, riskScore: 'low' as const, documentLink: '/Virginia Neurosurgeons Statement.html' },
  { id: '2', date: '2006-06-29', provider: 'Virginia Hospital Center', description: '360° Revision Fusion', amount: 15863.84, category: 'Surgery', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: false, riskScore: 'low' as const },
  { id: '3', date: '2004-02-04', provider: 'Inova Fairfax', description: 'FESS Sinus Surgery', amount: 8178.05, category: 'Surgery', isAccidentRelated: false, hasMatchingTreatment: true, isDuplicate: false, riskScore: 'high' as const },
  { id: '4', date: '2005-04-11', provider: 'Radiology Associates', description: 'MRI Lumbar Spine', amount: 2400, category: 'Imaging', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: false, riskScore: 'low' as const },
  { id: '5', date: '2005-04-11', provider: 'Radiology Associates', description: 'MRI Lumbar Spine', amount: 2400, category: 'Imaging', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: true, riskScore: 'high' as const },
  { id: '6', date: '2005-02-16', provider: 'Orthopedic Associates', description: 'Initial Evaluation - Misc coded', amount: 345, category: 'Office Visit', isAccidentRelated: true, hasMatchingTreatment: false, isDuplicate: false, riskScore: 'medium' as const },
  { id: '7', date: '2005-03-15', provider: 'CVS Pharmacy', description: 'Pain Medication', amount: 312.88, category: 'Pharmacy', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: false, riskScore: 'low' as const },
  { id: '8', date: '2005-03-15', provider: 'CVS Pharmacy', description: 'Pain Medication', amount: 312.88, category: 'Pharmacy', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: true, riskScore: 'high' as const },
  { id: '9', date: '2006-01-16', provider: 'Imaging Center', description: 'Post-op MRI', amount: 1132.12, category: 'Imaging', isAccidentRelated: true, hasMatchingTreatment: true, isDuplicate: false, riskScore: 'low' as const },
];

export default function ClaimReport() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDocs, setShowAddDocs] = useState(false);
  const [documentCount, setDocumentCount] = useState(47);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const claim = mockClaims.find((c) => c.id === id) || mockClaims[0];

  const accidentRelatedBilled = 41449.72;
  const unrelatedBilled = 8523.05;
  const totalBilled = 49972.77;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;

      for (const [sectionId, ref] of Object.entries(sectionRefs.current)) {
        if (ref) {
          const top = ref.offsetTop;
          const bottom = top + ref.offsetHeight;
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDocumentsAdded = (count: number) => {
    setDocumentCount((prev) => prev + count);
    toast({
      title: `${count} documents added`,
      description: 'Re-analyzing report with new documents...',
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: 'Report saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Sticky Claim Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-foreground">
                    Medical and Billing Analysis Report: Luke Frazza
                  </h1>
                  <Badge variant="ready">Ready</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Accident Date: 2005-01-23</span>
                  <span>•</span>
                  <span>{documentCount} documents analyzed</span>
                  <button
                    onClick={() => setShowAddDocs(true)}
                    className="ml-1 p-1 hover:bg-secondary rounded transition-colors"
                    title="Add documents"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" className="gap-2" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button className="gap-2" onClick={handleSave}>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4" />
                    Edit Report
                  </Button>
                  <ExportMenu />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <ReportTableOfContents
            activeSection={activeSection}
            onSectionClick={handleSectionClick}
          />

          <div className="flex-1 max-w-4xl">
            <div className={`bg-report-bg rounded-xl border border-border p-8 shadow-card ${isEditing ? 'ring-2 ring-primary/20' : ''}`}>
              {isEditing && (
                <div className="mb-6 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground">
                  <strong>Edit Mode:</strong> Click on any text to edit. Changes are saved when you click "Save Changes".
                </div>
              )}

              {/* Executive Summary */}
              <ReportSection
                ref={(el) => (sectionRefs.current['executive-summary'] = el)}
                id="executive-summary"
                title="Executive Summary"
              >
                <p className={`mb-4 ${isEditing ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                  This report provides a comprehensive analysis of the medical treatment and associated costs for Luke Frazza following a slip-and-fall accident on January 23, 2005. The claimant, a professional photographer, suffered an acute L3-L4 disc herniation with an extruded fragment. His clinical course included a failed initial discectomy in April 2005, leading to a complex 360-degree revision fusion in June 2006.
                </p>

                <p className={`mb-4 ${isEditing ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                  While the claimant had a prior history of a lumbosacral strain in 2003 and unrelated sinus surgery in 2004, the clinical evidence supports the 2005 fall as the primary cause of his structural spinal injury. The total reviewed billing is {formatCurrency(totalBilled)}, with {formatCurrency(accidentRelatedBilled)} deemed accident-related and {formatCurrency(unrelatedBilled)} identified as unrelated to the trauma.
                </p>

                <div className="mt-4 flex gap-2">
                  <EvidenceLink source="Incident Report" pageRef="INC-001" />
                  <EvidenceLink source="MRI Report" pageRef="MRI-001" />
                </div>
              </ReportSection>

              {/* Medical Narrative */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-narrative'] = el)}
                id="medical-narrative"
                title="Medical Narrative"
              >
                <h3 className="font-semibold text-foreground mb-3">Claimant Medical Summary</h3>
                <p className={`mb-4 ${isEditing ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                  Luke Frazza is a 41-year-old male who sustained a significant lumbar injury while working at the White House. Following a fall on his buttocks, he developed progressive left leg radiculopathy and quadriceps weakness. Despite conservative efforts, imaging revealed an extruded disc fragment at L3-L4. He underwent two major spinal surgeries over 14 months.
                </p>

                <p className={`${isEditing ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                  His recovery was complicated by failed back syndrome following the first surgery, eventually necessitating a revision fusion with instrumentation.
                </p>
              </ReportSection>

              {/* Medical Timeline */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-timeline'] = el)}
                id="medical-timeline"
                title="Medical Timeline (Clinical Milestones)"
              >
                <div className="mt-4">
                  {lukeFrazzaTimeline.map((event, index) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isFirst={index === 0}
                      isLast={index === lukeFrazzaTimeline.length - 1}
                    />
                  ))}
                </div>
              </ReportSection>

              {/* Contradictions */}
              <ReportSection
                ref={(el) => (sectionRefs.current['contradictions'] = el)}
                id="contradictions"
                title="Contradictions & Inconsistencies"
              >
                <div className="space-y-4">
                  {lukeFrazzaContradictions.map((contradiction) => (
                    <ContradictionCard
                      key={contradiction.id}
                      contradiction={contradiction}
                    />
                  ))}
                </div>
              </ReportSection>

              {/* Missing Documentation */}
              <ReportSection
                ref={(el) => (sectionRefs.current['missing-docs'] = el)}
                id="missing-docs"
                title="Missing Documentation"
              >
                <div className="space-y-4">
                  {lukeFrazzaMissingFlags.map((flag) => (
                    <MissingFlagCard key={flag.id} flag={flag} />
                  ))}
                </div>
              </ReportSection>

              {/* Causation Analysis */}
              <ReportSection
                ref={(el) => (sectionRefs.current['causation-analysis'] = el)}
                id="causation-analysis"
                title="Causation Analysis"
              >
                <div className="bg-report-section rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2">Accident Mechanism</h4>
                  <p className={`text-foreground/90 ${isEditing ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text' : ''}`} contentEditable={isEditing} suppressContentEditableWarning>
                    Slip on wet floor with axial loading directly onto sacrum.
                  </p>
                </div>

                <div className="bg-report-section rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Injury Compatibility Assessment</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-success">Score: 92 / 100</span>
                  </div>
                  <p className="text-foreground/90">
                    MRI-confirmed extrusion and neurological findings strongly support acute traumatic origin.
                  </p>
                </div>
              </ReportSection>

              {/* Pre-Existing vs Accident-Related */}
              <ReportSection
                ref={(el) => (sectionRefs.current['injury-separation'] = el)}
                id="injury-separation"
                title="Pre-Existing vs Accident-Related"
              >
                <div className="border border-border rounded-lg overflow-hidden mb-4">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Pre-existing</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Accident Related</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Sinusitis</td>
                        <td className="px-4 py-3 text-sm text-foreground">L3-L4 Disc Herniation</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Knee surgeries</td>
                        <td className="px-4 py-3 text-sm text-foreground">Extruded fragment</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">2003 strain</td>
                        <td className="px-4 py-3 text-sm text-foreground">L4 radiculopathy</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ReportSection>

              {/* Treatment-to-Diagnosis Mapping */}
              <ReportSection
                ref={(el) => (sectionRefs.current['treatment-mapping'] = el)}
                id="treatment-mapping"
                title="Treatment-to-Diagnosis Mapping"
              >
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Treatment</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Diagnosis</th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">MRI</td>
                        <td className="px-4 py-3 text-sm text-foreground">Herniation</td>
                        <td className="px-4 py-3 text-center"><Badge variant="low">100%</Badge></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Discectomy</td>
                        <td className="px-4 py-3 text-sm text-foreground">Extrusion</td>
                        <td className="px-4 py-3 text-center"><Badge variant="low">100%</Badge></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Sinus Surgery</td>
                        <td className="px-4 py-3 text-sm text-foreground">Sinusitis</td>
                        <td className="px-4 py-3 text-center"><Badge variant="high">0%</Badge></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Fusion</td>
                        <td className="px-4 py-3 text-sm text-foreground">Instability</td>
                        <td className="px-4 py-3 text-center"><Badge variant="low">100%</Badge></td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">Hip Injection</td>
                        <td className="px-4 py-3 text-sm text-foreground">Referred pain</td>
                        <td className="px-4 py-3 text-center"><Badge variant="medium">Partial</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ReportSection>

              {/* Causation Summary */}
              <ReportSection
                ref={(el) => (sectionRefs.current['causation-confidence'] = el)}
                id="causation-confidence"
                title="Causation Summary"
              >
                <ConfidenceIndicator
                  level="high"
                  label="Strong Causation"
                  description="The fall caused a structural disc extrusion. Subsequent surgeries stem directly from this injury rather than degeneration."
                />
              </ReportSection>

              {/* Medical Billing Review */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-billing-review'] = el)}
                id="medical-billing-review"
                title="Medical Billing Review"
              >
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-success/10 rounded-lg p-4">
                    <p className="text-sm text-success mb-1">Accident Related</p>
                    <p className="text-2xl font-semibold text-success">{formatCurrency(accidentRelatedBilled)}</p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <p className="text-sm text-destructive mb-1">Unrelated</p>
                    <p className="text-2xl font-semibold text-destructive">{formatCurrency(unrelatedBilled)}</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-2xl font-semibold text-foreground">{formatCurrency(totalBilled)}</p>
                  </div>
                </div>

                <BillsTable bills={lukeFrazzaBills} />

                {/* Duplicate & Unsupported Bills */}
                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-3">Duplicate & Unsupported Bills</h4>
                  <div className="space-y-3">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="high">Duplicate</Badge>
                        <p className="text-sm text-foreground">Duplicate radiology billing</p>
                      </div>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="high">Duplicate</Badge>
                        <p className="text-sm text-foreground">Duplicate pharmacy entries</p>
                      </div>
                    </div>
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="medium">Mis-coded</Badge>
                        <p className="text-sm text-foreground">Mis-coded early diagnostic visit</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Impact Bills */}
                <div className="mt-6">
                  <h4 className="font-medium text-foreground mb-3">High Impact Bills</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <span className="font-medium text-foreground">Washington Hospital Center</span>
                      <span className="font-semibold text-foreground">$19,028</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <span className="font-medium text-foreground">Virginia Hospital Center</span>
                      <span className="font-semibold text-foreground">$15,863.84</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">Inova Fairfax</span>
                        <Badge variant="high">Unrelated</Badge>
                      </div>
                      <span className="font-semibold text-foreground">$8,178.05</span>
                    </div>
                  </div>
                </div>

                {/* Leakage Risk & Next Steps */}
                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Leakage Risk & Next Steps</h4>
                  <ul className="space-y-2 text-foreground/90">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Remove unrelated sinus surgery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Peer review 2006 fusion</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Request missing primary care records</span>
                    </li>
                  </ul>
                </div>
              </ReportSection>
            </div>
          </div>
        </div>
      </div>

      <AddDocumentsModal
        open={showAddDocs}
        onOpenChange={setShowAddDocs}
        onUploadComplete={handleDocumentsAdded}
        currentDocCount={documentCount}
      />
    </div>
  );
}
