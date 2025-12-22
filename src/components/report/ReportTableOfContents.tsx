import { cn } from '@/lib/utils';
import { reportSections } from '@/data/mockClaims';
import { ReportType } from '@/utils/reportData';

interface ReportTableOfContentsProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  reportType?: ReportType;
}

export function ReportTableOfContents({ activeSection, onSectionClick, reportType }: ReportTableOfContentsProps) {
  const isMVP = reportType === 'mvp';
  
  // Filter sections based on report type
  const visibleSections = isMVP
    ? reportSections.filter(s => 
        s.id === 'executive-summary' ||
        s.id === 'medical-timeline' ||
        s.id === 'causation-analysis' ||
        s.id === 'injury-separation' ||
        s.id === 'medical-billing-review'
      )
    : reportSections;
  
  // Billing subsections that should appear under Medical Billing Review
  const baseBillingSubsections = [
    { id: 'billing-overview', title: 'Billing Overview' },
    { id: 'line-item-billing-review', title: 'Line-Item Billing Review' },
    { id: 'billing-issues-exceptions', title: 'Billing Issues & Exceptions' },
  ];

  // Additional subsections for Full Report only
  const fullReportBillingSubsections = [
    { id: 'high-impact-bills', title: 'High Impact Bills' },
    { id: 'leakage-risk-next-steps', title: 'Leakage Risk & Next Steps' },
  ];

  // Combine subsections based on report type
  const billingSubsections = isMVP
    ? baseBillingSubsections
    : [...baseBillingSubsections, ...fullReportBillingSubsections];

  // All sections in one continuous list
  const groupedSections = [
    {
      title: 'Overview',
      sections: visibleSections.filter(s => s.order === 1),
      subsections: undefined,
    },
    {
      title: 'Medical Analysis',
      sections: visibleSections.filter(s => s.order >= 2 && s.order <= 5),
      subsections: undefined,
    },
    {
      title: 'Causation',
      sections: visibleSections.filter(s => s.order >= 6 && s.order <= 9),
      subsections: undefined,
    },
    {
      title: 'Medical Billing Review',
      sections: visibleSections.filter(s => s.order >= 10 && s.id !== 'medical-billing-review'), // Exclude the main billing review section
      subsections: billingSubsections,
    },
  ].filter(group => group.sections.length > 0 || group.subsections); // Keep groups with subsections even if no main sections

  return (
    <nav className="w-64 flex-shrink-0">
      <div 
        className={cn(
          "sticky top-6 space-y-6",
          // Make scrollable with max height based on viewport
          "max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
        )}
      >
        {groupedSections.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => onSectionClick(section.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
              {/* Render billing subsections directly under Medical Billing Review header */}
              {group.subsections && group.title === 'Medical Billing Review' && (
                <ul className="space-y-1">
                  {group.subsections.map((subsection) => (
                    <li key={subsection.id}>
                      <button
                        onClick={() => onSectionClick(subsection.id)}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                          activeSection === subsection.id
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        {subsection.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
