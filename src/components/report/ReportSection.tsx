import { ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ReportSectionProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export const ReportSection = forwardRef<HTMLElement, ReportSectionProps>(
  ({ id, title, children, className, headerRight }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn(
          'scroll-mt-24 mb-8 pb-8 border-b border-border last:border-0',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
        </div>
        <div className="report-prose">{children}</div>
      </section>
    );
  }
);

ReportSection.displayName = 'ReportSection';
