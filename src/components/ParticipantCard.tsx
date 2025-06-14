
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tables } from '@/integrations/supabase/types';
import { History, UserCheck, UserX, Trash2 } from 'lucide-react';

type Participant = Tables<'participants'>;

interface ParticipantCardProps {
  participant: Participant;
  onViewHistory: (participantId: string) => void;
  onToggleBlacklist: (participantId: string, currentStatus: boolean) => void;
  onDelete: (participant: Participant) => void;
}

export function ParticipantCard({ 
  participant, 
  onViewHistory, 
  onToggleBlacklist, 
  onDelete 
}: ParticipantCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="font-medium text-lg">{participant.name}</h3>
              {participant.is_blacklisted ? (
                <Badge variant="destructive">Blacklisted</Badge>
              ) : (
                <Badge variant="secondary">Aktif</Badge>
              )}
            </div>
            <p className="text-gray-600 text-sm">{participant.email}</p>
            {participant.phone && (
              <p className="text-gray-600 text-sm">{participant.phone}</p>
            )}
            <p className="text-gray-400 text-xs">
              Terdaftar: {new Date(participant.created_at).toLocaleDateString('id-ID')}
            </p>
            {participant.blacklist_reason && (
              <p className="text-red-600 text-sm mt-1">
                Alasan blacklist: {participant.blacklist_reason}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewHistory(participant.id)}
              className="w-full sm:w-auto"
            >
              <History className="h-4 w-4 mr-2" />
              Riwayat Kehadiran
            </Button>
            <Button
              variant={participant.is_blacklisted ? "default" : "destructive"}
              size="sm"
              onClick={() => onToggleBlacklist(participant.id, participant.is_blacklisted)}
              className="w-full sm:w-auto"
            >
              {participant.is_blacklisted ? (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Aktifkan
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Blacklist
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(participant)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
