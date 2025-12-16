import { Link } from 'react-router-dom';

export function AppHeader() {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">E</span>
        </div>
        <span className="text-xl font-semibold text-foreground">Elyon</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-sm font-medium text-secondary-foreground">JD</span>
        </div>
      </div>
    </header>
  );
}
