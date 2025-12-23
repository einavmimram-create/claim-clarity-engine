import { useState, useRef, useEffect, HTMLAttributes } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3, Plus, Save, X } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ReportSidebar } from '@/components/report/ReportSidebar';
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
import { getClaimReportData, getReportTitle, getReportType } from '@/utils/reportData';
import { MedicalEvent, Contradiction, MissingFlag, BillItem } from '@/types/claim';

export default function ClaimReport() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showAddDocs, setShowAddDocs] = useState(false);
  const [documentCount, setDocumentCount] = useState(47);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const claim = mockClaims.find((c) => c.id === id) || mockClaims[0];
  
  // Get claim-specific report data (isolated per claim)
  const reportData = getClaimReportData(claim.id);
  
  // Store report data in state to ensure edits are isolated per claim
  const [timeline, setTimeline] = useState<MedicalEvent[]>(reportData.timeline);
  const [contradictions, setContradictions] = useState<Contradiction[]>(reportData.contradictions);
  const [missingFlags, setMissingFlags] = useState<MissingFlag[]>(reportData.missingFlags);
  const [bills, setBills] = useState<BillItem[]>(reportData.bills);

  // Get dynamic report title based on claim
  const reportTitle = getReportTitle(claim);
  const reportType = getReportType(claim);
  const isMVP = reportType === 'mvp';

  // Shared inline editing helpers
  const editableAttributes: Pick<HTMLAttributes<HTMLElement>, 'contentEditable' | 'suppressContentEditableWarning'> =
    isEditing
      ? {
          contentEditable: true,
          suppressContentEditableWarning: true,
        }
      : {};
  const editableBlockClass = isEditing
    ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text'
    : '';
  const editableInlineClass = isEditing
    ? 'border border-dashed border-border rounded hover:border-primary cursor-text'
    : '';

  // Calculate billing totals from current bills state
  // For MVP, use fixed totals as specified
  const accidentRelatedBilled = isMVP 
    ? 33323.72 
    : bills.filter(b => b.isAccidentRelated).reduce((sum, b) => sum + b.amount, 0);
  const unrelatedBilled = isMVP 
    ? 8178.05 
    : bills.filter(b => !b.isAccidentRelated).reduce((sum, b) => sum + b.amount, 0);
  const totalBilled = isMVP 
    ? 41501.77 
    : accidentRelatedBilled + unrelatedBilled;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Reload report data when claim ID changes (ensures isolation between claims)
  useEffect(() => {
    if (id && claim.id) {
      const newReportData = getClaimReportData(claim.id);
      setTimeline(newReportData.timeline);
      setContradictions(newReportData.contradictions);
      setMissingFlags(newReportData.missingFlags);
      setBills(newReportData.bills);
    }
  }, [id, claim.id]);


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
                    {reportTitle}
                  </h1>
                  <Badge variant="ready">Ready</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {claim.accidentDate && (
                    <>
                      <span>Accident Date: {claim.accidentDate}</span>
                      <span>•</span>
                    </>
                  )}
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
          <ReportSidebar reportType={reportType} />
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
                <p className={`mb-4 ${editableBlockClass}`} {...editableAttributes}>
                  This report provides a comprehensive analysis of the medical treatment and associated costs for Luke Frazza following a slip-and-fall accident on January 23, 2005. The claimant, a professional photographer, suffered an acute L3-L4 disc herniation with an extruded fragment. His clinical course included a failed initial discectomy in April 2005, leading to a complex 360-degree revision fusion in June 2006.
                </p>

                <p className={`mb-4 ${editableBlockClass}`} {...editableAttributes}>
                  While the claimant had a prior history of a lumbosacral strain in 2003 and unrelated sinus surgery in 2004, the clinical evidence supports the 2005 fall as the primary cause of his structural spinal injury. The total reviewed billing is {formatCurrency(totalBilled)}, with {formatCurrency(accidentRelatedBilled)} deemed accident-related and {formatCurrency(unrelatedBilled)} identified as unrelated to the trauma.
                </p>

                <div className="mt-4 flex gap-2">
                  <EvidenceLink source="Incident Report" pageRef="INC-001" />
                  <EvidenceLink source="MRI Report" pageRef="MRI-001" />
                </div>
              </ReportSection>

              {/* Medical Narrative - Only for Full Report */}
              {!isMVP && (
                <ReportSection
                  ref={(el) => (sectionRefs.current['medical-narrative'] = el)}
                  id="medical-narrative"
                  title="Medical Narrative"
                >
                  <h3 className="font-semibold text-foreground mb-3">Claimant Medical Summary</h3>
                  <p className={`mb-4 ${editableBlockClass}`} {...editableAttributes}>
                    Luke Frazza is a 41-year-old male who sustained a significant lumbar injury while working at the White House. Following a fall on his buttocks, he developed progressive left leg radiculopathy and quadriceps weakness. Despite conservative efforts, imaging revealed an extruded disc fragment at L3-L4. He underwent two major spinal surgeries over 14 months.
                  </p>

                  <p className={`${editableBlockClass}`} {...editableAttributes}>
                    His recovery was complicated by failed back syndrome following the first surgery, eventually necessitating a revision fusion with instrumentation.
                  </p>
                </ReportSection>
              )}

              {/* Medical Timeline */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-timeline'] = el)}
                id="medical-timeline"
                title="Medical Timeline (Clinical Milestones)"
              >
                <div className="mt-4">
                  {timeline.map((event, index) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isFirst={index === 0}
                      isLast={index === timeline.length - 1}
                      isEditing={isEditing}
                    />
                  ))}
                </div>
              </ReportSection>

              {/* Contradictions - Only for Full Report */}
              {!isMVP && (
                <ReportSection
                  ref={(el) => (sectionRefs.current['contradictions'] = el)}
                  id="contradictions"
                  title="Contradictions & Inconsistencies"
                >
                  <div className="space-y-4">
                    {contradictions.map((contradiction) => (
                      <ContradictionCard
                        key={contradiction.id}
                        contradiction={contradiction}
                        isEditing={isEditing}
                      />
                    ))}
                  </div>
                </ReportSection>
              )}

              {/* Missing Documentation - Only for Full Report */}
              {!isMVP && (
                <ReportSection
                  ref={(el) => (sectionRefs.current['missing-docs'] = el)}
                  id="missing-docs"
                  title="Missing Documentation"
                >
                  <div className="space-y-4">
                    {missingFlags.map((flag) => (
                      <MissingFlagCard key={flag.id} flag={flag} isEditing={isEditing} />
                    ))}
                  </div>
                </ReportSection>
              )}

              {/* Causation Analysis - Full section for Full Report, only Accident Mechanism for MVP */}
              {isMVP ? (
                <ReportSection
                  ref={(el) => (sectionRefs.current['causation-analysis'] = el)}
                  id="causation-analysis"
                  title="Causation Analysis"
                >
                  <div className="bg-report-section rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Accident Mechanism</h4>
                    <p className={`text-foreground/90 ${editableBlockClass}`} {...editableAttributes}>
                      Slip on wet floor with axial loading directly onto sacrum.
                    </p>
                  </div>
                </ReportSection>
              ) : (
                <ReportSection
                  ref={(el) => (sectionRefs.current['causation-analysis'] = el)}
                  id="causation-analysis"
                  title="Causation Analysis"
                >
                  <div className="bg-report-section rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-foreground mb-2">Accident Mechanism</h4>
                    <p className={`text-foreground/90 ${editableBlockClass}`} {...editableAttributes}>
                      Slip on wet floor with axial loading directly onto sacrum.
                    </p>
                  </div>

                  <div className="bg-report-section rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Injury Compatibility Assessment</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-success">Score: 92 / 100</span>
                    </div>
                    <p className={`text-foreground/90 ${editableBlockClass}`} {...editableAttributes}>
                      MRI-confirmed extrusion and neurological findings strongly support acute traumatic origin.
                    </p>
                  </div>
                </ReportSection>
              )}

              {/* Medical Condition Classification */}
              <ReportSection
                ref={(el) => (sectionRefs.current['injury-separation'] = el)}
                id="injury-separation"
                title="Medical Condition Classification"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pre-Existing Medical Conditions */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-medium text-muted-foreground">Pre-Existing Medical Conditions</h3>
                    </div>
                    <table className="w-full">
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Sinusitis</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Knee surgeries</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>2003 strain</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Accident-Related Medical Findings */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-medium text-muted-foreground">Accident-Related Medical Findings</h3>
                    </div>
                    <table className="w-full">
                      <tbody className="divide-y divide-border">
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>L3-L4 Disc Herniation</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Extruded fragment</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>L4 radiculopathy</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </ReportSection>

              {/* Treatment-to-Diagnosis Mapping - Only for Full Report */}
              {!isMVP && (
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
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>MRI</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Herniation</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="low">
                              <span className={editableInlineClass} {...editableAttributes}>100%</span>
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Discectomy</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Extrusion</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="low">
                              <span className={editableInlineClass} {...editableAttributes}>100%</span>
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Sinus Surgery</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Sinusitis</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="high">
                              <span className={editableInlineClass} {...editableAttributes}>0%</span>
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Fusion</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Instability</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="low">
                              <span className={editableInlineClass} {...editableAttributes}>100%</span>
                            </Badge>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Hip Injection</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Referred pain</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="medium">
                              <span className={editableInlineClass} {...editableAttributes}>Partial</span>
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </ReportSection>
              )}

              {/* Causation Summary - Only for Full Report */}
              {!isMVP && (
                <ReportSection
                  ref={(el) => (sectionRefs.current['causation-confidence'] = el)}
                  id="causation-confidence"
                  title="Causation Summary"
                >
                  <ConfidenceIndicator
                    level="high"
                    label="Strong Causation"
                    description="The fall caused a structural disc extrusion. Subsequent surgeries stem directly from this injury rather than degeneration."
                    isEditing={isEditing}
                  />
                </ReportSection>
              )}

              {/* Medical Billing Review */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-billing-review'] = el)}
                id="medical-billing-review"
                title="Medical Billing Review"
              >
                {/* Billing Overview */}
                <div
                  id="billing-overview"
                  ref={(el) => (sectionRefs.current['billing-overview'] = el)}
                  className="grid md:grid-cols-3 gap-4 mb-6 scroll-mt-24"
                >
                  <div className="bg-success/10 rounded-lg p-4">
                    <p className={`text-sm text-success mb-1 ${editableInlineClass}`} {...editableAttributes}>Accident Related</p>
                    <p className={`text-2xl font-semibold text-success ${editableInlineClass}`} {...editableAttributes}>
                      {formatCurrency(accidentRelatedBilled)}
                    </p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <p className={`text-sm text-destructive mb-1 ${editableInlineClass}`} {...editableAttributes}>Unrelated</p>
                    <p className={`text-2xl font-semibold text-destructive ${editableInlineClass}`} {...editableAttributes}>
                      {formatCurrency(unrelatedBilled)}
                    </p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
                    <p className={`text-sm text-muted-foreground mb-1 ${editableInlineClass}`} {...editableAttributes}>Total</p>
                    <p className={`text-2xl font-semibold text-foreground ${editableInlineClass}`} {...editableAttributes}>
                      {formatCurrency(totalBilled)}
                    </p>
                  </div>
                </div>

                {/* Line-Item Billing Review */}
                <div
                  id="line-item-billing-review"
                  ref={(el) => (sectionRefs.current['line-item-billing-review'] = el)}
                  className="scroll-mt-24"
                >
                  <BillsTable bills={bills} isEditing={isEditing} />
                </div>

                {/* Billing Issues & Exceptions */}
                <div
                  id="billing-issues-exceptions"
                  ref={(el) => (sectionRefs.current['billing-issues-exceptions'] = el)}
                  className="mt-6 scroll-mt-24"
                >
                  <h4 className="font-medium text-foreground mb-3">Duplicate & Unsupported Bills</h4>
                  <div className="space-y-3">
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="high">Duplicate</Badge>
                        <p className={`text-sm text-foreground ${editableBlockClass}`} {...editableAttributes}>Duplicate radiology billing</p>
                      </div>
                    </div>
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="high">Duplicate</Badge>
                        <p className={`text-sm text-foreground ${editableBlockClass}`} {...editableAttributes}>Duplicate pharmacy entries</p>
                      </div>
                    </div>
                    <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Badge variant="medium">Mis-coded</Badge>
                        <p className={`text-sm text-foreground ${editableBlockClass}`} {...editableAttributes}>Mis-coded early diagnostic visit</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Impact Bills - Only for Full Report */}
                {!isMVP && (
                  <>
                    <div
                      id="high-impact-bills"
                      ref={(el) => (sectionRefs.current['high-impact-bills'] = el)}
                      className="mt-6 scroll-mt-24"
                    >
                      <h4 className="font-medium text-foreground mb-3">High Impact Bills</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <span className={`font-medium text-foreground ${editableInlineClass}`} {...editableAttributes}>Washington Hospital Center</span>
                          <span className={`font-semibold text-foreground ${editableInlineClass}`} {...editableAttributes}>$19,028</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <span className={`font-medium text-foreground ${editableInlineClass}`} {...editableAttributes}>Virginia Hospital Center</span>
                          <span className={`font-semibold text-foreground ${editableInlineClass}`} {...editableAttributes}>$15,863.84</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-foreground ${editableInlineClass}`} {...editableAttributes}>Inova Fairfax</span>
                            <Badge variant="high">Unrelated</Badge>
                          </div>
                          <span className={`font-semibold text-foreground ${editableInlineClass}`} {...editableAttributes}>$8,178.05</span>
                        </div>
                      </div>
                    </div>

                    {/* Leakage Risk & Next Steps */}
                    <div
                      id="leakage-risk-next-steps"
                      ref={(el) => (sectionRefs.current['leakage-risk-next-steps'] = el)}
                      className="mt-6 p-4 bg-secondary rounded-lg scroll-mt-24"
                    >
                      <h4 className="font-medium text-foreground mb-2">Leakage Risk & Next Steps</h4>
                      <ul className="space-y-2 text-foreground/90">
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span className={editableInlineClass} {...editableAttributes}>Remove unrelated sinus surgery</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span className={editableInlineClass} {...editableAttributes}>Peer review 2006 fusion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold">•</span>
                          <span className={editableInlineClass} {...editableAttributes}>Request missing primary care records</span>
                        </li>
                      </ul>
                    </div>
                  </>
                )}
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
