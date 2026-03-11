import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ReportType } from '@/utils/reportData';
import { reportCopyHe } from '@/data/reportCopyHe';

interface ReportSidebarProps {
  reportType?: ReportType;
  isFutureReport?: boolean;
}

interface Subsection {
  id: string;
  title: string;
}

interface SectionWithSubsections {
  id: string;
  title: string;
  subsections?: Subsection[];
}

export function ReportSidebar({ reportType, isFutureReport = false }: ReportSidebarProps) {
  const isMVP = reportType === 'mvp';
  const isHebrew = reportType === 'full_he';
  const t = isHebrew ? reportCopyHe.sidebar : null;
  const [activeSection, setActiveSection] = useState<string>('executive-summary');

  // Define section hierarchy (English; Hebrew uses reportCopyHe.sidebar when isHebrew)
  const medicalNarrativeSubsections: Subsection[] = [
    { id: 'medical-narrative', title: t?.claimantMedicalSummary ?? 'Claimant Medical Summary' },
    { id: 'medical-timeline', title: t?.medicalTimeline ?? 'Medical Timeline' },
    { id: 'contradictions', title: t?.contradictionsInconsistencies ?? 'Contradictions & Inconsistencies' },
    { id: 'missing-docs', title: t?.missingDocumentation ?? 'Missing Documentation' },
  ];

  const causationAnalysisSubsections: Subsection[] = [
    { id: 'causation-analysis', title: t?.mechanismOfInjury ?? 'Mechanism of Injury' },
    { id: 'injury-separation', title: t?.medicalConditionClassification ?? 'Medical Condition Classification' },
    { id: 'treatment-mapping', title: t?.treatmentToDiagnosisMapping ?? 'Treatment-to-Diagnosis Mapping' },
  ];

  const baseBillingSubsections: Subsection[] = [
    { id: 'billing-overview', title: t?.billingOverview ?? 'Billing Overview' },
    { id: 'line-item-billing-review', title: t?.lineItemBillingReview ?? 'Line-Item Billing Review' },
    { id: 'billing-issues-exceptions', title: t?.billingIssuesExceptions ?? 'Billing Issues & Exceptions' },
  ];

  const fullReportBillingSubsections: Subsection[] = [
    { id: 'high-impact-bills', title: t?.highImpactBills ?? 'High Impact Bills' },
  ];

  const billingSubsections = isMVP
    ? baseBillingSubsections
    : [...baseBillingSubsections, ...fullReportBillingSubsections];

  // Next Steps subsections - only for Future Report
  const nextStepsSubsections: Subsection[] = [
    { id: 'what-to-do-now', title: 'What To Do Now' },
    { id: 'leakage-risk', title: 'Leakage Risk' },
    { id: 'litigation-exposure', title: 'Litigation Exposure Score' },
    { id: 'reserve-guidance', title: 'Reserve Guidance' },
  ];

  const executiveSummaryTitle = t?.executiveSummary ?? 'Executive Summary';
  const medicalNarrativeTitle = t?.medicalNarrative ?? 'Medical Narrative';
  const causationAnalysisTitle = t?.causationAnalysis ?? 'Causation Analysis';
  const medicalBillingReviewTitle = t?.medicalBillingReview ?? 'Medical Billing Review';

  // Build structured sections (Hebrew version excludes Medical Billing Review)
  const structuredSections: SectionWithSubsections[] = [
    { id: 'executive-summary', title: executiveSummaryTitle },
    {
      id: 'medical-narrative',
      title: medicalNarrativeTitle,
      subsections: isMVP
        ? [medicalNarrativeSubsections[1]] // Only Medical Timeline for MVP
        : medicalNarrativeSubsections,
    },
    {
      id: 'causation-analysis',
      title: causationAnalysisTitle,
      subsections: isMVP
        ? [causationAnalysisSubsections[0]] // Only Mechanism of Injury for MVP
        : causationAnalysisSubsections,
    },
    // Medical Billing Review: hidden in Hebrew report (full_he)
    ...(isHebrew ? [] : [{
      id: 'medical-billing-review',
      title: medicalBillingReviewTitle,
      subsections: billingSubsections,
    }]),
    // Add Next Steps section only for Future Report
    ...(isFutureReport ? [{
      id: 'next-steps',
      title: 'Next Steps',
      subsections: nextStepsSubsections,
    }] : []),
  ];

  // Get all subsection IDs for scroll tracking
  const getAllSubsectionIds = (): string[] => {
    const ids: string[] = [];
    structuredSections.forEach((section) => {
      if (section.subsections) {
        section.subsections.forEach((sub) => ids.push(sub.id));
      }
    });
    return ids;
  };

  // Check if a section or any of its subsections is active
  const isSectionActive = (section: SectionWithSubsections): boolean => {
    if (activeSection === section.id) return true;
    if (section.subsections) {
      return section.subsections.some((sub) => activeSection === sub.id);
    }
    return false;
  };

  // Track active section based on scroll position
  useEffect(() => {
    const allSubsectionIds = getAllSubsectionIds();
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      let bestMatch: { id: string; top: number } | null = null;
      
      // Check all subsections first
      for (const subsectionId of allSubsectionIds) {
        const element = document.getElementById(subsectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const sectionTop = rect.top + window.scrollY;
          const sectionBottom = sectionTop + rect.height;
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            if (!bestMatch || sectionTop > bestMatch.top) {
              bestMatch = { id: subsectionId, top: sectionTop };
            }
          }
        }
      }

      // Check main sections
      if (!bestMatch) {
        for (const section of structuredSections) {
          const element = document.getElementById(section.id);
          if (element && !allSubsectionIds.includes(section.id)) {
            const rect = element.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
              if (!bestMatch || sectionTop > bestMatch.top) {
                bestMatch = { id: section.id, top: sectionTop };
              }
            }
          }
        }
      }
      
      if (bestMatch) {
        setActiveSection(bestMatch.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMVP, isFutureReport, isHebrew]);

  const handleClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  return (
    <nav className="w-64 flex-shrink-0">
      <div className={cn(
        "sticky top-6 space-y-4",
        isFutureReport && "max-h-[calc(100vh-3rem)] overflow-y-auto"
      )}>
        <div className="h-16"></div>
        <ul className="space-y-1">
          {structuredSections.map((section) => {
            const sectionIsActive = isSectionActive(section);
            
            return (
              <li key={section.id}>
                {/* Parent Section */}
                <a
                  href={`#${section.id}`}
                  onClick={() => handleClick(section.id)}
                  className={cn(
                    'block px-3 py-2 text-sm rounded-lg transition-colors font-medium',
                    sectionIsActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  )}
                >
                  {section.title}
                </a>
                
                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {section.subsections.map((subsection) => {
                      const subsectionIsActive = activeSection === subsection.id;
                      return (
                        <li key={subsection.id}>
                          <a
                            href={`#${subsection.id}`}
                            onClick={() => handleClick(subsection.id)}
                            className={cn(
                              'block px-3 py-1.5 text-xs rounded-md transition-colors ml-3',
                              subsectionIsActive
                                ? 'bg-primary/90 text-primary-foreground font-medium'
                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                            )}
                          >
                            {subsection.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
