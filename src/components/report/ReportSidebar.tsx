import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ReportType } from '@/utils/reportData';
import { reportSections } from '@/data/mockClaims';

interface ReportSidebarProps {
  reportType?: ReportType;
}

export function ReportSidebar({ reportType }: ReportSidebarProps) {
  const isMVP = reportType === 'mvp';
  const [activeSection, setActiveSection] = useState<string>('executive-summary');
  
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
  
  // Billing subsections
  const baseBillingSubsections = [
    { id: 'billing-overview', title: 'Billing Overview' },
    { id: 'line-item-billing-review', title: 'Line-Item Billing Review' },
    { id: 'billing-issues-exceptions', title: 'Billing Issues & Exceptions' },
  ];

  const fullReportBillingSubsections = [
    { id: 'high-impact-bills', title: 'High Impact Bills' },
    { id: 'leakage-risk-next-steps', title: 'Leakage Risk & Next Steps' },
  ];

  const billingSubsections = isMVP
    ? baseBillingSubsections
    : [...baseBillingSubsections, ...fullReportBillingSubsections];

  // Track active section based on scroll position
  useEffect(() => {
    const baseBillingIds = ['billing-overview', 'line-item-billing-review', 'billing-issues-exceptions'];
    const fullReportBillingIds = ['high-impact-bills', 'leakage-risk-next-steps'];
    const allBillingSubsections = isMVP
      ? baseBillingIds
      : [...baseBillingIds, ...fullReportBillingIds];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Account for sticky header
      
      let bestMatch: { id: string; top: number } | null = null;
      
      // Check billing subsections first
      for (const subsectionId of allBillingSubsections) {
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
        const sortedSections = [...reportSections]
          .filter(section => {
            const element = document.getElementById(section.id);
            return element && !allBillingSubsections.includes(section.id);
          })
          .sort((a, b) => a.order - b.order);
        
        for (const section of sortedSections) {
          const element = document.getElementById(section.id);
          if (element) {
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
    handleScroll(); // Check initial position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMVP]);

  const handleClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  return (
    <nav className="w-64 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        {/* 2 empty lines at the top */}
        <div className="h-16"></div>
        <ul className="space-y-1">
          {visibleSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={() => handleClick(section.id)}
                className={cn(
                  'block px-3 py-2 text-sm rounded-lg transition-colors',
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {section.title}
              </a>
              {section.id === 'medical-billing-review' && (
                <ul className="ml-4 mt-1 space-y-1">
                  {billingSubsections.map((subsection) => (
                    <li key={subsection.id}>
                      <a
                        href={`#${subsection.id}`}
                        onClick={() => handleClick(subsection.id)}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-lg transition-colors',
                          activeSection === subsection.id
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        {subsection.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

