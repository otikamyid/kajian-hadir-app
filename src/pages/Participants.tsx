
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateParticipantForm } from '@/components/CreateParticipantForm';
import { ParticipantAttendanceHistory } from '@/components/ParticipantAttendanceHistory';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Search, Users, UserCheck, UserX, History, Trash2 } from 'lucide-react';
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

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari peserta (nama, email, atau nomor telepon)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
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
            <div className="text-2xl font-bold">
              {participants.filter(p => !p.is_blacklisted).length}
            </div>
            <div className="text-sm text-gray-600">Peserta Aktif</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserX className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold">
              {participants.filter(p => p.is_blacklisted).length}
            </div>
            <div className="text-sm text-gray-600">Blacklisted</div>
          </CardContent>
        </Card>
      </div>

      {/* Participants List */}
      <div className="space-y-4">
        {filteredParticipants.length === 0 ? (
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
        ) : (
          filteredParticipants.map((participant) => (
            <Card key={participant.id}>
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
                      onClick={() => setViewingHistoryParticipant(participant.id)}
                      className="w-full sm:w-auto"
                    >
                      <History className="h-4 w-4 mr-2" />
                      Riwayat Kehadiran
                    </Button>
                    <Button
                      variant={participant.is_blacklisted ? "default" : "destructive"}
                      size="sm"
                      onClick={() => toggleBlacklist(participant.id, participant.is_blacklisted)}
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
                      onClick={() => openDeleteDialog(participant)}
                      className="w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Peserta</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus peserta <strong>{participantToDelete?.name}</strong>?
              <br /><br />
              Tindakan ini akan menghapus:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Data peserta</li>
                <li>Riwayat kehadiran peserta</li>
                <li>Akun pengguna terkait (jika ada)</li>
              </ul>
              <br />
              <strong>Tindakan ini tidak dapat dibatalkan.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteParticipant}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Menghapus...' : 'Hapus Peserta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
