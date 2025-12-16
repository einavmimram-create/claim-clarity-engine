import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ReportSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}

export const ReportSection = forwardRef<HTMLElement, ReportSectionProps>(
  ({ id, title, children, className }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn('scroll-mt-6 mb-8 pb-8 border-b border-border last:border-0', className)}
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
        <div className="report-prose">{children}</div>
      </section>
    );
  }
);

ReportSection.displayName = 'ReportSection';
