
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type Participant = Tables<'participants'>;

interface ParticipantStatsProps {
  participants: Participant[];
}

export function ParticipantStats({ participants }: ParticipantStatsProps) {
  const activeParticipants = participants.filter(p => !p.is_blacklisted).length;
  const blacklistedParticipants = participants.filter(p => p.is_blacklisted).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
          <div className="text-2xl font-bold">{participants.length}</div>
          <div className="text-sm text-gray-600">Total Peserta</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <UserCheck className="h-8 w-8 mx-auto text-green-600 mb-2" />
          <div className="text-2xl font-bold">{activeParticipants}</div>
          <div className="text-sm text-gray-600">Peserta Aktif</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <UserX className="h-8 w-8 mx-auto text-red-600 mb-2" />
          <div className="text-2xl font-bold">{blacklistedParticipants}</div>
          <div className="text-sm text-gray-600">Blacklisted</div>
        </CardContent>
      </Card>
    </div>
  );
}
