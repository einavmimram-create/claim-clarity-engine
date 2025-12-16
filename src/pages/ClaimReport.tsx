import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit3 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  mockClaims,
  mockMedicalTimeline,
  mockContradictions,
  mockMissingFlags,
  mockBills,
} from '@/data/mockClaims';

export default function ClaimReport() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('executive-summary');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const claim = mockClaims.find((c) => c.id === id) || mockClaims[0];

  const totalBilled = mockBills.reduce((sum, b) => sum + b.amount, 0);
  const accidentRelatedBilled = mockBills
    .filter((b) => b.isAccidentRelated)
    .reduce((sum, b) => sum + b.amount, 0);
  const leakageAmount = totalBilled - accidentRelatedBilled;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

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

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Claim Header */}
      <div className="border-b border-border bg-card">
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
                    {claim.name}
                  </h1>
                  <Badge variant="ready">Ready</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Accident Date: {claim.accidentDate} • {claim.fileCount} documents
                  analyzed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Report
              </Button>
              <ExportMenu />
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
            <div className="bg-report-bg rounded-xl border border-border p-8 shadow-card">
              {/* Executive Summary */}
              <ReportSection
                ref={(el) => (sectionRefs.current['executive-summary'] = el)}
                id="executive-summary"
                title="Executive Summary"
              >
                <div className="bg-report-highlight rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-foreground mb-3">
                    Key Findings
                  </h3>
                  <ul className="space-y-2 text-foreground/90">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>
                        Claimant sustained cervical and lumbar strains from June
                        2023 bus collision with documented progression to disc
                        herniation
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>
                        Treatment escalated from conservative care to
                        interventional procedures within 3 months
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>
                        Total billed: {formatCurrency(totalBilled)} •
                        Accident-attributable: {formatCurrency(accidentRelatedBilled)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive font-bold">•</span>
                      <span>
                        Identified {formatCurrency(leakageAmount)} in potentially
                        unrelated or unsupported charges
                      </span>
                    </li>
                  </ul>
                </div>

                <p className="mb-4">
                  On June 15, 2023, the claimant was involved in a bus collision
                  while a passenger on a Metro Transit Authority vehicle. Initial
                  emergency room evaluation diagnosed cervical and lumbar strains
                  with negative imaging for fractures. The claimant underwent
                  conservative treatment including physical therapy before
                  escalating to pain management interventions.
                </p>

                <p className="mb-4">
                  MRI imaging obtained approximately 6 weeks post-accident revealed
                  a C5-6 disc herniation with mild cord compression. This finding,
                  combined with continued symptoms, led to cervical epidural
                  steroid injection and eventual surgical consultation.
                </p>

                <p>
                  <strong>Causation Assessment:</strong> Mixed confidence in
                  accident-to-injury causation. While initial soft tissue injuries
                  are clearly accident-related, the progression to disc pathology
                  lacks documented mechanism and may involve pre-existing
                  degeneration.
                </p>

                <div className="mt-4 flex gap-2">
                  <EvidenceLink
                    source="Metro General ER Records"
                    pageRef="MG-001"
                  />
                  <EvidenceLink source="MRI Report" pageRef="MI-001" />
                </div>
              </ReportSection>

              {/* Medical Narrative */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-narrative'] = el)}
                id="medical-narrative"
                title="Medical Narrative"
              >
                <p className="mb-4">
                  The claimant, a 42-year-old male with no documented prior
                  cervical or lumbar complaints, was seated on a Metro Transit bus
                  when it was rear-ended by a commercial vehicle. He reports
                  immediate onset of neck pain, back pain, and headache at the
                  scene.
                </p>

                <p className="mb-4">
                  Initial emergency care focused on ruling out acute traumatic
                  injury. CT imaging of the cervical spine was negative for
                  fracture or acute pathology. The claimant was discharged with
                  diagnoses of cervical strain and lumbar strain, prescribed
                  muscle relaxants, and instructed to follow up with primary care.
                </p>

                <p className="mb-4">
                  Over the following weeks, the claimant reported persistent and
                  worsening symptoms despite conservative treatment. Physical
                  therapy notes document limited range of motion and pain with
                  movement. After 6 weeks of PT with minimal improvement, the
                  claimant was referred to pain management.
                </p>

                <p>
                  The pain management physician recommended MRI imaging, which
                  revealed C5-6 disc herniation. This led to cervical epidural
                  steroid injection in September 2023. The claimant is currently
                  being evaluated for potential surgical intervention.
                </p>
              </ReportSection>

              {/* Medical Timeline */}
              <ReportSection
                ref={(el) => (sectionRefs.current['medical-timeline'] = el)}
                id="medical-timeline"
                title="Medical Timeline"
              >
                <div className="mt-4">
                  {mockMedicalTimeline.map((event, index) => (
                    <TimelineEvent
                      key={event.id}
                      event={event}
                      isFirst={index === 0}
                      isLast={index === mockMedicalTimeline.length - 1}
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
                <p className="mb-4">
                  The following contradictions and inconsistencies were identified
                  across the medical documentation:
                </p>
                <div className="space-y-4">
                  {mockContradictions.map((contradiction) => (
                    <ContradictionCard
                      key={contradiction.id}
                      contradiction={contradiction}
                    />
                  ))}
                </div>
              </ReportSection>

              {/* Missing Flags */}
              <ReportSection
                ref={(el) => (sectionRefs.current['missing-flags'] = el)}
                id="missing-flags"
                title="What's Missing"
              >
                <p className="mb-4">
                  The following gaps or absences in documentation may be
                  significant:
                </p>
                <div className="space-y-4">
                  {mockMissingFlags.map((flag) => (
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
                <p className="mb-4">
                  This section evaluates the relationship between the accident and
                  the claimed injuries, separating accident-related conditions
                  from pre-existing conditions and assessing treatment necessity.
                </p>

                <div className="bg-report-section rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Accident Mechanism
                  </h4>
                  <p className="text-foreground/90">
                    Rear-end collision while claimant was a seated bus passenger.
                    Low-to-moderate impact velocity based on available reports.
                    Mechanism consistent with cervical hyperextension/hyperflexion
                    injury pattern.
                  </p>
                </div>

                <div className="bg-report-section rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">
                    Injury Compatibility Assessment
                  </h4>
                  <p className="text-foreground/90 mb-2">
                    <strong>Compatible:</strong> Cervical strain, lumbar strain,
                    post-traumatic headache
                  </p>
                  <p className="text-foreground/90">
                    <strong>Questionable:</strong> C5-6 disc herniation - while
                    trauma can cause disc injury, the delayed presentation and
                    initially negative imaging suggest possible pre-existing
                    degenerative component
                  </p>
                </div>
              </ReportSection>

              {/* Pre-Existing vs Accident-Related */}
              <ReportSection
                ref={(el) => (sectionRefs.current['injury-separation'] = el)}
                id="injury-separation"
                title="Pre-Existing vs Accident-Related"
              >
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-success/5 border border-success/20 rounded-lg p-4">
                    <h4 className="font-medium text-success mb-2">
                      Accident-Related (Clear)
                    </h4>
                    <ul className="space-y-1 text-sm text-foreground/90">
                      <li>• Cervical strain</li>
                      <li>• Lumbar strain</li>
                      <li>• Post-traumatic headache</li>
                      <li>• Soft tissue inflammation</li>
                    </ul>
                  </div>

                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                    <h4 className="font-medium text-warning mb-2">
                      Gray Area / Mixed Causation
                    </h4>
                    <ul className="space-y-1 text-sm text-foreground/90">
                      <li>• C5-6 disc herniation</li>
                      <li>• Radiculopathy symptoms</li>
                      <li>• Chronic pain syndrome</li>
                    </ul>
                  </div>
                </div>

                <p className="text-muted-foreground text-sm">
                  Note: No pre-existing medical records were provided. Assessment
                  based on documented findings and injury mechanism analysis.
                </p>
              </ReportSection>

              {/* Treatment Mapping */}
              <ReportSection
                ref={(el) => (sectionRefs.current['treatment-mapping'] = el)}
                id="treatment-mapping"
                title="Treatment-to-Diagnosis Mapping"
              >
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                          Treatment
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                          Diagnosis
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">
                          Supported
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">
                          Physical Therapy (18 sessions)
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          Cervical/Lumbar Strain
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="low">Supported</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">
                          Cervical ESI
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          C5-6 Disc Herniation
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="medium">Partial</Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-foreground">
                          Massage Therapy
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          No documented diagnosis
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="high">Unsupported</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ReportSection>

              {/* Causation Confidence */}
              <ReportSection
                ref={(el) => (sectionRefs.current['causation-confidence'] = el)}
                id="causation-confidence"
                title="Causation Confidence"
              >
                <ConfidenceIndicator
                  level="medium"
                  label="Mixed Confidence"
                  description="Initial soft tissue injuries are clearly accident-related. However, the C5-6 disc herniation presents causation uncertainty due to: (1) negative initial imaging, (2) delayed presentation of disc pathology, (3) lack of documented pre-accident baseline. Recommend requesting prior medical records to establish baseline condition."
                />
              </ReportSection>

              {/* Billing Analysis */}
              <ReportSection
                ref={(el) => (sectionRefs.current['billing-analysis'] = el)}
                id="billing-analysis"
                title="Billing Analysis"
              >
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Billed
                    </p>
                    <p className="text-2xl font-semibold text-foreground">
                      {formatCurrency(totalBilled)}
                    </p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4">
                    <p className="text-sm text-success mb-1">
                      Accident-Attributable
                    </p>
                    <p className="text-2xl font-semibold text-success">
                      {formatCurrency(accidentRelatedBilled)}
                    </p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <p className="text-sm text-destructive mb-1">
                      Unrelated/Unsupported
                    </p>
                    <p className="text-2xl font-semibold text-destructive">
                      {formatCurrency(leakageAmount)}
                    </p>
                  </div>
                </div>

                <BillsTable bills={mockBills} />
              </ReportSection>

              {/* Leakage Detection */}
              <ReportSection
                ref={(el) => (sectionRefs.current['leakage-detection'] = el)}
                id="leakage-detection"
                title="Leakage Detection"
              >
                <p className="mb-4">
                  The following billing anomalies were identified:
                </p>

                <div className="space-y-3">
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="high">Duplicate</Badge>
                      <div>
                        <p className="font-medium text-foreground">
                          PT Evaluation billed twice (97161)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Same CPT code billed on 7/3 and 10/1 - likely
                          re-evaluation after discharge
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="high">Unrelated</Badge>
                      <div>
                        <p className="font-medium text-foreground">
                          Massage Therapy - $1,800
                        </p>
                        <p className="text-sm text-muted-foreground">
                          No prescription or medical documentation supporting this
                          treatment. Provider not in medical records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ReportSection>

              {/* High Impact Bills */}
              <ReportSection
                ref={(el) => (sectionRefs.current['high-impact-bills'] = el)}
                id="high-impact-bills"
                title="High-Impact Bills"
              >
                <p className="mb-4">
                  These bills represent the largest exposure items and warrant
                  focused negotiation attention:
                </p>

                <div className="space-y-3">
                  {mockBills
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 5)
                    .map((bill, index) => (
                      <div
                        key={bill.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-foreground">
                              {bill.description}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {bill.provider} • {bill.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            {formatCurrency(bill.amount)}
                          </p>
                          <Badge variant={bill.riskScore}>{bill.riskScore}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </ReportSection>

              {/* Leakage Risk Score */}
              <ReportSection
                ref={(el) => (sectionRefs.current['leakage-score'] = el)}
                id="leakage-score"
                title="Leakage Risk Score"
              >
                <ConfidenceIndicator
                  level="medium"
                  label="Moderate Leakage Risk"
                  description="Identified $2,150 (9% of total) in charges with documentation concerns. Primary risks: (1) Massage therapy with no medical support, (2) Duplicate PT evaluation billing. Recommended actions: Request itemized bills, verify massage therapy prescription, clarify PT re-evaluation necessity."
                />

                <div className="mt-6 p-4 bg-secondary rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">
                    Recommended Next Steps
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-foreground/90">
                    <li>Request claimant's pre-accident medical records</li>
                    <li>Obtain itemized billing statements from all providers</li>
                    <li>Verify massage therapy prescription and medical necessity</li>
                    <li>
                      Consider IME for disc herniation causation determination
                    </li>
                    <li>
                      Focus negotiation on high-impact bills with causation concerns
                    </li>
                  </ol>
                </div>
              </ReportSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
