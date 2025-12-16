import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { AddClaimModal } from '@/components/claims/AddClaimModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockClaims } from '@/data/mockClaims';
import { Claim } from '@/types/claim';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>(mockClaims);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClaims = claims.filter(claim =>
    claim.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClaim = (name: string, files: File[]) => {
    const newClaim: Claim = {
      id: String(claims.length + 1),
      name,
      status: 'processing',
      lastUpdated: new Date(),
      createdAt: new Date(),
      fileCount: files.length,
    };
    
    setClaims([newClaim, ...claims]);
    setIsModalOpen(false);
    
    // Simulate processing completion
    setTimeout(() => {
      setClaims(prev =>
        prev.map(c =>
          c.id === newClaim.id
            ? { ...c, status: 'ready' as const, totalBilled: 185000 }
            : c
        )
      );
      navigate(`/claim/${newClaim.id}`);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Claims</h1>
            <p className="text-muted-foreground">
              {claims.length} claims in your workspace
            </p>
          </div>
          <Button variant="accent" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Add a Claim
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="grid gap-4">
          {filteredClaims.map((claim) => (
            <ClaimCard key={claim.id} claim={claim} />
          ))}
        </div>

        {filteredClaims.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No claims match your search.'
                : 'No claims yet. Add your first claim to get started.'}
            </p>
            {!searchQuery && (
              <Button variant="accent" onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Add a Claim
              </Button>
            )}
          </div>
        )}
      </main>

      <AddClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddClaim}
      />
    </div>
  );
}
