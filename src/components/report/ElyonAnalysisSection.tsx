import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportSection } from './ReportSection';
import { cn } from '@/lib/utils';

interface ElyonAnalysisSectionProps {
  id: string;
  title: string;
  content: string;
  isEditing: boolean;
  onDelete: () => void;
  editableAttributes?: React.HTMLAttributes<HTMLElement>;
  editableBlockClass?: string;
}

/**
 * Simple markdown renderer for basic formatting
 */
function renderMarkdown(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let currentListItems: React.ReactNode[] = [];
  let listKey = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="mb-3 text-foreground/90">
          {currentParagraph.join(' ')}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`ul-${listKey++}`} className="list-disc list-inside mb-3 space-y-1 ml-4 text-foreground/90">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushParagraph();
      flushList();
      return;
    }

    // Handle headers
    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      elements.push(
        <h4 key={`h4-${index}`} className="font-semibold text-foreground mb-2 mt-4">
          {trimmed.substring(4)}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      elements.push(
        <h3 key={`h3-${index}`} className="font-semibold text-foreground mb-2 mt-4">
          {trimmed.substring(3)}
        </h3>
      );
      return;
    }

    // Handle bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      const listContent = trimmed.substring(2);
      // Handle bold text in list items
      const parts = listContent.split(/(\*\*.*?\*\*)/g);
      const listItem = (
        <li key={`li-${currentListItems.length}`}>
          {parts.map((part, partIndex) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={partIndex} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return <span key={partIndex}>{part}</span>;
          })}
        </li>
      );
      currentListItems.push(listItem);
      return;
    }

    // Regular paragraph text
    flushList();
    currentParagraph.push(trimmed);
  });

  // Flush remaining content
  flushParagraph();
  flushList();

  return <div>{elements}</div>;
}

export function ElyonAnalysisSection({
  id,
  title,
  content,
  isEditing,
  onDelete,
  editableAttributes,
  editableBlockClass = '',
}: ElyonAnalysisSectionProps) {
  return (
    <ReportSection id={id} title={title} className="relative">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground font-medium">Elyon Analysis</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
          title="Delete this section"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <div
        className={cn(
          'prose prose-sm max-w-none text-foreground',
          editableBlockClass
        )}
        {...editableAttributes}
      >
        {renderMarkdown(content)}
      </div>
    </ReportSection>
  );
}

