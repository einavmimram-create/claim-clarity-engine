import { useState } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ExportMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const exportOptions = [
    { label: 'Full Report (PDF)', icon: FileText, format: 'pdf' },
    { label: 'Full Report (Word)', icon: FileSpreadsheet, format: 'docx' },
    { label: 'Executive Summary Only', icon: FileText, format: 'pdf-summary' },
    { label: 'Medical Narrative Only', icon: FileText, format: 'pdf-medical' },
    { label: 'Causation Analysis Only', icon: FileText, format: 'pdf-causation' },
    { label: 'Billing Analysis Only', icon: FileText, format: 'pdf-billing' },
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-elevated z-50 py-2 animate-fade-in">
            {exportOptions.map((option) => (
              <button
                key={option.format}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                onClick={() => {
                  console.log(`Exporting: ${option.format}`);
                  setIsOpen(false);
                }}
              >
                <option.icon className="w-4 h-4 text-muted-foreground" />
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
