import { useState, useRef, useEffect, useMemo, HTMLAttributes } from 'react';
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
import { ExposureDriversPanel } from '@/components/report/ExposureDriversPanel';
import { LitigationExposureScore } from '@/components/report/LitigationExposureScore';
import { ReserveGuidance } from '@/components/report/ReserveGuidance';
import { NextStepsSection } from '@/components/report/NextStepsSection';
import { ElyonChat } from '@/components/report/ElyonChat';
import { ElyonAnalysisSection } from '@/components/report/ElyonAnalysisSection';
import { AddDocumentsModal } from '@/components/claims/AddDocumentsModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  
  const reportData = getClaimReportData(claim.id);
  
  const [timeline, setTimeline] = useState<MedicalEvent[]>(reportData.timeline);
  const [contradictions, setContradictions] = useState<Contradiction[]>(reportData.contradictions);
  const [missingFlags, setMissingFlags] = useState<MissingFlag[]>(reportData.missingFlags);
  const [bills, setBills] = useState<BillItem[]>(reportData.bills);
  
  // Dynamic Elyon analysis sections
  interface ElyonSection {
    id: string;
    title: string;
    content: string;
  }
  const [elyonSections, setElyonSections] = useState<ElyonSection[]>([]);

  const reportTitle = getReportTitle(claim);
  const reportType = getReportType(claim);
  const isMVP = reportType === 'mvp';
  const isFutureReport = claim.id === '3' || reportTitle.includes('Future Report');
  const patientName = reportTitle.includes(':')
    ? reportTitle.split(': ').slice(1).join(': ')
    : reportTitle;
  const [showTimelineFilters, setShowTimelineFilters] = useState(true);

  const [timelineFilters, setTimelineFilters] = useState({
    patientName: '',
    doctorName: '',
    medicalSpecialty: '',
    medicalFacility: '',
    procedureType: '',
    medicationType: '',
    label: '',
    needsReview: '',
    isKeyDate: '',
    startDate: '',
    endDate: '',
    search: '',
  });

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

  const accidentRelatedBilled = isMVP 
    ? 35622.60 
    : bills.filter(b => b.isAccidentRelated).reduce((sum, b) => sum + b.amount, 0);
  const unrelatedBilled = isMVP 
    ? 10890.93 
    : bills.filter(b => !b.isAccidentRelated).reduce((sum, b) => sum + b.amount, 0);
  const totalBilled = isMVP 
    ? 46513.53 
    : accidentRelatedBilled + unrelatedBilled;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const timelineFilterOptions = useMemo(() => {
    const normalizeValues = (values: string[]) =>
      Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));

    const doctorNames = timeline
      .map((event) => event.doctorName || (event.provider.startsWith('Dr.') ? event.provider : ''))
      .filter(Boolean);
    const facilities = timeline
      .map((event) => event.medicalFacility || (!event.provider.startsWith('Dr.') ? event.provider : ''))
      .filter(Boolean);
    const specialties = timeline.flatMap((event) =>
      event.medicalSpecialties?.length ? event.medicalSpecialties : event.specialty ? [event.specialty] : [],
    );
    const procedureTypes = timeline.flatMap((event) =>
      event.procedureTypes?.length ? event.procedureTypes : event.eventType ? [event.eventType] : [],
    );
    const medicationTypes = timeline
      .map((event) => event.medicationType || '')
      .filter(Boolean);
    const labels = timeline.flatMap((event) => event.labels || event.patientComplaints || []);

    return {
      patientNames: normalizeValues([patientName]),
      doctorNames: normalizeValues(doctorNames),
      medicalFacilities: normalizeValues(facilities),
      medicalSpecialties: normalizeValues(specialties),
      procedureTypes: normalizeValues(procedureTypes),
      medicationTypes: normalizeValues(medicationTypes),
      labels: normalizeValues(labels),
    };
  }, [timeline, patientName]);

  const filteredTimeline = useMemo(() => {
    const searchValue = timelineFilters.search.trim().toLowerCase();
    const startDate = timelineFilters.startDate ? new Date(timelineFilters.startDate) : null;
    const endDate = timelineFilters.endDate ? new Date(timelineFilters.endDate) : null;

    return timeline.filter((event) => {
      const eventPatientName = event.patientName || patientName;
      const doctorName = event.doctorName || (event.provider.startsWith('Dr.') ? event.provider : '');
      const facility = event.medicalFacility || (!event.provider.startsWith('Dr.') ? event.provider : '');
      const specialties = event.medicalSpecialties?.length
        ? event.medicalSpecialties
        : event.specialty
          ? [event.specialty]
          : [];
      const procedureTypes = event.procedureTypes?.length
        ? event.procedureTypes
        : event.eventType
          ? [event.eventType]
          : [];
      const medicationTypes = event.medicationType ? [event.medicationType] : [];
      const labels = event.labels || event.patientComplaints || [];
      const isKeyDate = event.isKeyDate || false;
      const needsReview = event.needsReview || false;
      const eventDate = new Date(event.date);

      if (timelineFilters.patientName && eventPatientName !== timelineFilters.patientName) {
        return false;
      }
      if (timelineFilters.doctorName && doctorName !== timelineFilters.doctorName) {
        return false;
      }
      if (timelineFilters.medicalSpecialty && !specialties.includes(timelineFilters.medicalSpecialty)) {
        return false;
      }
      if (timelineFilters.medicalFacility && facility !== timelineFilters.medicalFacility) {
        return false;
      }
      if (timelineFilters.procedureType && !procedureTypes.includes(timelineFilters.procedureType)) {
        return false;
      }
      if (timelineFilters.medicationType && !medicationTypes.includes(timelineFilters.medicationType)) {
        return false;
      }
      if (timelineFilters.label && !labels.includes(timelineFilters.label)) {
        return false;
      }
      if (timelineFilters.needsReview === 'yes' && !needsReview) {
        return false;
      }
      if (timelineFilters.needsReview === 'no' && needsReview) {
        return false;
      }
      if (timelineFilters.isKeyDate === 'yes' && !isKeyDate) {
        return false;
      }
      if (timelineFilters.isKeyDate === 'no' && isKeyDate) {
        return false;
      }
      if (startDate && !isNaN(eventDate.getTime()) && eventDate < startDate) {
        return false;
      }
      if (endDate && !isNaN(eventDate.getTime()) && eventDate > endDate) {
        return false;
      }
      if (searchValue) {
        const haystack = [
          event.date,
          event.provider,
          event.specialty,
          event.eventType,
          event.description,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(searchValue)) {
          return false;
        }
      }

      return true;
    });
  }, [timeline, timelineFilters, patientName]);

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

  const handleInsertElyonSection = (title: string, content: string) => {
    const newSection: ElyonSection = {
      id: `elyon-${Date.now()}`,
      title,
      content,
    };
    setElyonSections((prev) => [...prev, newSection]);
    
    // Scroll to the new section after a brief delay
    setTimeout(() => {
      const element = document.getElementById(newSection.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleDeleteElyonSection = (sectionId: string) => {
    setElyonSections((prev) => prev.filter((s) => s.id !== sectionId));
    toast({
      title: 'Section deleted',
      description: 'The Elyon analysis section has been removed.',
    });
  };

  const handleToggleKeyEvent = (eventId: string) => {
    setTimeline((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, isKeyDate: !event.isKeyDate } : event,
      ),
    );
  };

  const handleToggleNeedsReview = (eventId: string) => {
    setTimeline((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, needsReview: !event.needsReview } : event,
      ),
    );
  };

  const handleEditTimelineEvent = () => {
    if (!isEditing) {
      setIsEditing(true);
    }
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
          <ReportSidebar reportType={reportType} isFutureReport={isFutureReport} />
          <div className="flex-1 max-w-4xl">
            <div className={`bg-report-bg rounded-xl border border-border p-8 shadow-card ${isEditing ? 'ring-2 ring-primary/20' : ''}`}>
              {isEditing && (
                <div className="mb-6 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm text-foreground">
                  <strong>Edit Mode:</strong> Click on any text to edit. Changes are saved when you click "Save Changes".
                </div>
              )}

              {/* Executive Summary with Exposure Drivers Panel */}
              <ReportSection
                ref={(el) => (sectionRefs.current['executive-summary'] = el)}
                id="executive-summary"
                title="Executive Summary"
              >
                <div className={`flex gap-6 ${isMVP ? '' : 'flex-col lg:flex-row'}`}>
                  {/* Left side: Summary text */}
                  <div className={isMVP ? 'flex-1' : 'flex-1 lg:w-2/3'}>
                    <p className={`mb-4 ${editableBlockClass}`} {...editableAttributes}>
                      This report provides a comprehensive analysis of the medical treatment and associated costs for Luke Frazza following a slip-and-fall accident on January 23, 2005. The claimant, a professional photographer, suffered an acute L3-L4 disc herniation with an extruded fragment. His clinical course included a failed initial discectomy in April 2005, leading to a complex 360-degree revision fusion in June 2006.
                    </p>

                    <p className={`mb-4 ${editableBlockClass}`} {...editableAttributes}>
                      While the claimant had a prior history of a lumbosacral strain in 2003 and unrelated sinus surgery in 2004, the available clinical evidence shows strong support for the 2005 fall being the primary cause of his structural spinal injury. The total reviewed billing is {formatCurrency(totalBilled)}, with {formatCurrency(accidentRelatedBilled)} showing strong support for accident relation, while {formatCurrency(unrelatedBilled)} showing limited support for accident relation.
                    </p>

                    <div className="mt-4 flex gap-2">
                      <EvidenceLink source="Incident Report" pageRef="INC-001" />
                      <EvidenceLink source="MRI Report" pageRef="MRI-001" />
                    </div>
                  </div>

                  {/* Right side: Exposure Drivers Panel (Full report only) */}
                  {!isMVP && (
                    <div className="lg:w-1/3">
                      <ExposureDriversPanel isEditing={isEditing} />
                    </div>
                  )}
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
                <div className="mt-4 space-y-4">
                  <div className="bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-medium text-foreground">Filters</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTimelineFilters((prev) => !prev)}
                      >
                        {showTimelineFilters ? 'Hide' : 'Show'}
                      </Button>
                    </div>
                    {showTimelineFilters && (
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Patient Name</p>
                            <Select
                              value={timelineFilters.patientName || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  patientName: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.patientNames.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Doctor Name</p>
                            <Select
                              value={timelineFilters.doctorName || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  doctorName: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.doctorNames.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Medical Specialty</p>
                            <Select
                              value={timelineFilters.medicalSpecialty || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  medicalSpecialty: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.medicalSpecialties.map((specialty) => (
                                  <SelectItem key={specialty} value={specialty}>
                                    {specialty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Medical Facility</p>
                            <Select
                              value={timelineFilters.medicalFacility || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  medicalFacility: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.medicalFacilities.map((facility) => (
                                  <SelectItem key={facility} value={facility}>
                                    {facility}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Procedure Type</p>
                            <Select
                              value={timelineFilters.procedureType || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  procedureType: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.procedureTypes.map((procedure) => (
                                  <SelectItem key={procedure} value={procedure}>
                                    {procedure}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Medication Type</p>
                            <Select
                              value={timelineFilters.medicationType || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  medicationType: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.medicationTypes.map((medication) => (
                                  <SelectItem key={medication} value={medication}>
                                    {medication}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Labels</p>
                            <Select
                              value={timelineFilters.label || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  label: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                {timelineFilterOptions.labels.map((label) => (
                                  <SelectItem key={label} value={label}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                            <Input
                              type="date"
                              value={timelineFilters.startDate}
                              onChange={(event) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  startDate: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">End Date</p>
                            <Input
                              type="date"
                              value={timelineFilters.endDate}
                              onChange={(event) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  endDate: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Needs Review</p>
                            <Select
                              value={timelineFilters.needsReview || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  needsReview: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="yes">Needs Review</SelectItem>
                                <SelectItem value="no">No Review Flag</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Is Key Date</p>
                            <Select
                              value={timelineFilters.isKeyDate || 'all'}
                              onValueChange={(value) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  isKeyDate: value === 'all' ? '' : value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="yes">Key Date</SelectItem>
                                <SelectItem value="no">Not Key Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Search</p>
                            <Input
                              placeholder="Search"
                              value={timelineFilters.search}
                              onChange={(event) =>
                                setTimelineFilters((prev) => ({
                                  ...prev,
                                  search: event.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {filteredTimeline.map((event, index) => (
                      <TimelineEvent
                        key={event.id}
                        event={event}
                        patientName={patientName}
                        onToggleKeyEvent={handleToggleKeyEvent}
                        onToggleNeedsReview={handleToggleNeedsReview}
                        onEditRequested={handleEditTimelineEvent}
                        isFirst={index === 0}
                        isLast={index === filteredTimeline.length - 1}
                        isEditing={isEditing}
                      />
                    ))}
                  </div>
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

              {/* Causation Analysis */}
              {isMVP ? (
                <ReportSection
                  ref={(el) => (sectionRefs.current['causation-analysis'] = el)}
                  id="causation-analysis"
                  title="Causation Analysis"
                >
                  <div className="bg-report-section rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Mechanism of Injury</h4>
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
                    <h4 className="font-medium text-foreground mb-2">Mechanism of Injury</h4>
                    <p className={`text-foreground/90 ${editableBlockClass}`} {...editableAttributes}>
                      Slip on wet floor with axial loading directly onto sacrum.
                    </p>
                  </div>

                  <div className="bg-report-section rounded-lg p-4">
                    <h4 className="font-medium text-foreground mb-2">Compatibility Assessment</h4>
                    <p className={`text-foreground/90 ${editableBlockClass}`} {...editableAttributes}>
                      MRI-confirmed extrusion and neurological findings show strong support for an acute traumatic origin.
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

                  {/* Accident-Related Medical Conditions */}
                  <div className="border border-border rounded-lg overflow-hidden">
                    <div className="bg-secondary px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-medium text-muted-foreground">Accident-Related Medical Conditions</h3>
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
                          <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Support Level</th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Record-Based Reasoning</th>
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
                              <span className={editableInlineClass} {...editableAttributes}>Strong Support</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>MRI (04/11/2005) documents an extruded L3–L4 disc with correlating radiculopathy following the reported fall.</span>
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
                              <span className={editableInlineClass} {...editableAttributes}>Strong Support</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Surgical records describe removal of an extruded disc fragment consistent with MRI findings.</span>
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
                              <span className={editableInlineClass} {...editableAttributes}>Limited Support</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>FESS sinus surgery occurred 11 months prior to the index accident and addresses a chronic sinus condition documented before the fall.</span>
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
                              <span className={editableInlineClass} {...editableAttributes}>Strong Support</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Revision fusion followed documented recurrence and persistent neurological deficits post-discectomy.</span>
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
                              <span className={editableInlineClass} {...editableAttributes}>Moderate Support</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            <span className={editableInlineClass} {...editableAttributes}>Injection performed during diagnostic phase when hip pathology was considered prior to lumbar confirmation.</span>
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
                    label="Strong Support for Accident-Related Causation"
                    description="Available records show strong support for a traumatic disc extrusion associated with the reported fall."
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
                    <p className={`text-xs text-success mb-1 ${editableInlineClass}`} {...editableAttributes}>Strong Support for Accident Relation</p>
                    <p className={`text-2xl font-semibold text-success ${editableInlineClass}`} {...editableAttributes}>
                      {formatCurrency(accidentRelatedBilled)}
                    </p>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4">
                    <p className={`text-xs text-destructive mb-1 ${editableInlineClass}`} {...editableAttributes}>Limited Support for Accident Relation</p>
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
                  <div
                    id="high-impact-bills"
                    ref={(el) => (sectionRefs.current['high-impact-bills'] = el)}
                    className="mt-6 scroll-mt-24"
                  >
                    <h4 className="font-medium text-foreground mb-3">High Impact Bills</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                        <span className={`font-medium text-foreground ${editableInlineClass}`} {...editableAttributes}>Washington Hospital Center</span>
                        <span className={`font-semibold text-foreground ${editableInlineClass}`} {...editableAttributes}>$19,028.00</span>
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
                        <span className={`font-semibold text-foreground ${editableInlineClass}`} {...editableAttributes}>$10,890.93</span>
                      </div>
                    </div>
                  </div>
                )}
              </ReportSection>

              {/* Next Steps Section - Only for Future Report */}
              {isFutureReport && (
                <ReportSection
                  ref={(el) => (sectionRefs.current['next-steps'] = el)}
                  id="next-steps"
                  title="Next Steps"
                >
                  {/* What To Do Now & Leakage Risk */}
                  <div
                    id="what-to-do-now"
                    ref={(el) => (sectionRefs.current['what-to-do-now'] = el)}
                    className="scroll-mt-24"
                  >
                    <div
                      id="leakage-risk"
                      ref={(el) => (sectionRefs.current['leakage-risk'] = el)}
                      className="scroll-mt-24"
                    >
                      <NextStepsSection isEditing={isEditing} />
                    </div>
                  </div>

                  {/* Litigation Exposure Score */}
                  <div
                    id="litigation-exposure"
                    ref={(el) => (sectionRefs.current['litigation-exposure'] = el)}
                    className="mt-8 scroll-mt-24"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      Litigation Exposure Score
                    </h3>
                    <LitigationExposureScore isEditing={isEditing} />
                  </div>

                  {/* Reserve Guidance */}
                  <div
                    id="reserve-guidance"
                    ref={(el) => (sectionRefs.current['reserve-guidance'] = el)}
                    className="mt-8 scroll-mt-24"
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      Reserve Guidance Range
                    </h3>
                    <ReserveGuidance isEditing={isEditing} />
                  </div>
                </ReportSection>
              )}

              {/* Dynamic Elyon Analysis Sections */}
              {elyonSections.map((section) => (
                <ElyonAnalysisSection
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  content={section.content}
                  isEditing={isEditing}
                  onDelete={() => handleDeleteElyonSection(section.id)}
                  editableAttributes={editableAttributes}
                  editableBlockClass={editableBlockClass}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Elyon Chat Interface */}
      <ElyonChat
        claim={claim}
        timeline={timeline}
        contradictions={contradictions}
        missingFlags={missingFlags}
        bills={bills}
        reportTitle={reportTitle}
        onInsertSection={handleInsertElyonSection}
      />

      <AddDocumentsModal
        open={showAddDocs}
        onOpenChange={setShowAddDocs}
        onUploadComplete={handleDocumentsAdded}
        currentDocCount={documentCount}
      />
    </div>
  );
}
