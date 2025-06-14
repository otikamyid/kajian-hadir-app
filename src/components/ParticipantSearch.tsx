
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ParticipantSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function ParticipantSearch({ searchTerm, onSearchChange }: ParticipantSearchProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Cari peserta (nama, email, atau nomor telepon)..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
