
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateParticipantForm } from '@/components/CreateParticipantForm';
import { ParticipantAttendanceHistory } from '@/components/ParticipantAttendanceHistory';
import { ParticipantStats } from '@/components/ParticipantStats';
import { ParticipantSearch } from '@/components/ParticipantSearch';
import { ParticipantList } from '@/components/ParticipantList';
import { DeleteParticipantDialog } from '@/components/DeleteParticipantDialog';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Participant = Tables<'participants'>;

export default function Participants() {
  const { profile } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingHistoryParticipant, setViewingHistoryParticipant] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<Participant | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      console.log('Fetching participants...');
      
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Participants fetched successfully:', data?.length);
      setParticipants(data || []);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: `Failed to fetch participants: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBlacklist = async (participantId: string, currentStatus: boolean) => {
    if (!window.confirm(`Apakah Anda yakin ingin ${currentStatus ? 'menghapus dari' : 'menambahkan ke'} blacklist?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('participants')
        .update({ is_blacklisted: !currentStatus })
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `Peserta ${!currentStatus ? 'ditambahkan ke' : 'dihapus dari'} blacklist`,
      });

      fetchParticipants();
    } catch (error: any) {
      console.error('Error updating participant:', error);
      toast({
        title: "Error",
        description: `Gagal mengupdate peserta: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;

    setDeleting(true);
    try {
      console.log('Deleting participant and related data:', participantToDelete.id);

      // First delete related attendance records
      const { error: attendanceError } = await supabase
        .from('attendance')
        .delete()
        .eq('participant_id', participantToDelete.id);

      if (attendanceError) {
        console.error('Error deleting attendance records:', attendanceError);
        throw attendanceError;
      }

      // Delete related profile if exists
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('participant_id', participantToDelete.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
        // Don't throw here as profile might not exist
      }

      // Finally delete the participant
      const { error: participantError } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantToDelete.id);

      if (participantError) {
        console.error('Error deleting participant:', participantError);
        throw participantError;
      }

      toast({
        title: "Berhasil",
        description: `Peserta ${participantToDelete.name} berhasil dihapus`,
      });

      fetchParticipants();
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
    } catch (error: any) {
      console.error('Error deleting participant:', error);
      toast({
        title: "Error",
        description: `Gagal menghapus peserta: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (participant: Participant) => {
    setParticipantToDelete(participant);
    setDeleteDialogOpen(true);
  };

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (participant.phone && participant.phone.includes(searchTerm))
  );

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Anda tidak memiliki akses ke halaman ini</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading participants...</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <CreateParticipantForm
          onParticipantCreated={() => {
            setShowCreateForm(false);
            fetchParticipants();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (viewingHistoryParticipant) {
    return (
      <div className="space-y-6">
        <ParticipantAttendanceHistory
          participantId={viewingHistoryParticipant}
          onBack={() => setViewingHistoryParticipant(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Peserta Kajian</h1>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Peserta
        </Button>
      </div>

      <ParticipantSearch 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
      />

      <ParticipantStats participants={participants} />

      <ParticipantList
        participants={filteredParticipants}
        searchTerm={searchTerm}
        onViewHistory={setViewingHistoryParticipant}
        onToggleBlacklist={toggleBlacklist}
        onDelete={openDeleteDialog}
      />

      <DeleteParticipantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        participant={participantToDelete}
        onConfirm={handleDeleteParticipant}
        deleting={deleting}
      />
    </div>
  );
}
