import { cn } from '@/lib/utils';
import { reportSections } from '@/data/mockClaims';

interface ReportTableOfContentsProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export function ReportTableOfContents({ activeSection, onSectionClick }: ReportTableOfContentsProps) {
  const groupedSections = [
    {
      title: 'Overview',
      sections: reportSections.filter(s => s.order === 1),
    },
    {
      title: 'Medical Analysis',
      sections: reportSections.filter(s => s.order >= 2 && s.order <= 5),
    },
    {
      title: 'Causation',
      sections: reportSections.filter(s => s.order >= 6 && s.order <= 9),
    },
    {
      title: 'Medical Billing Review',
      sections: reportSections.filter(s => s.order >= 10),
    },
  ];

  return (
    <nav className="w-64 flex-shrink-0">
      <div className="sticky top-6 space-y-6">
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
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
