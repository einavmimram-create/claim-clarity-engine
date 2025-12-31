interface ReserveGuidanceProps {
  isEditing?: boolean;
}

export function ReserveGuidance({ isEditing }: ReserveGuidanceProps) {
  const editableBlockClass = isEditing
    ? 'border border-dashed border-border p-2 rounded hover:border-primary cursor-text'
    : '';

  return (
    <div className="space-y-6">
      {/* Single Reserve Number */}
      <div className="text-center py-6 bg-secondary/30 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground mb-2">Recommended Reserve</p>
        <p className="text-4xl font-bold text-foreground">$145,000</p>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto px-4">
          Based on expected exposure: full accident-related medical costs ($41,449), reasonable lost wages 
          for a professional photographer, and moderate pain and suffering given the failed initial discectomy 
          requiring revision fusion. This aligns with similar L3-L4 herniation cases involving surgical complications.
        </p>
        <a 
          href="#similar-cases" 
          className="text-sm text-primary hover:underline mt-2 inline-block"
        >
          View similar past cases →
        </a>
      </div>

      {/* What Could Shift This Number */}
      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
        <h4 className="font-medium text-foreground mb-3">What Could Shift This Number</h4>
        <div className={`text-sm text-muted-foreground space-y-2 ${editableBlockClass}`}
             suppressContentEditableWarning
             contentEditable={isEditing}>
          <p>
            <strong className="text-foreground">Upward pressure:</strong> Discovery of additional lost income documentation, 
            expert testimony on permanent disability, or venue with plaintiff-friendly jury pool could push exposure toward 
            $225,000. If the 2006 fusion is deemed a permanent solution requiring future care, lifetime medical costs increase.
          </p>
          <p>
            <strong className="text-foreground">Downward pressure:</strong> Obtaining 2003 primary care records showing more 
            significant prior back issues, successful IME challenging surgical necessity, or demonstrating claimant returned 
            to photography work could reduce exposure toward $85,000.
          </p>
        </div>
      </div>
    </div>
  );
}
