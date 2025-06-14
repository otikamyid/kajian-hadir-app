
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { ParticipantCard } from './ParticipantCard';
import { Tables } from '@/integrations/supabase/types';

type Participant = Tables<'participants'>;

interface ParticipantListProps {
  participants: Participant[];
  searchTerm: string;
  onViewHistory: (participantId: string) => void;
  onToggleBlacklist: (participantId: string, currentStatus: boolean) => void;
  onDelete: (participant: Participant) => void;
}

export function ParticipantList({
  participants,
  searchTerm,
  onViewHistory,
  onToggleBlacklist,
  onDelete
}: ParticipantListProps) {
  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'Tidak ada peserta yang ditemukan' : 'Belum ada peserta terdaftar'}
          </p>
          {!searchTerm && (
            <p className="text-sm text-gray-400 mt-2">Mulai dengan menambahkan peserta pertama</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {participants.map((participant) => (
        <ParticipantCard
          key={participant.id}
          participant={participant}
          onViewHistory={onViewHistory}
          onToggleBlacklist={onToggleBlacklist}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
