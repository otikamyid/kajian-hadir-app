
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { CreateParticipantForm } from '@/components/CreateParticipantForm';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Shield, ShieldOff, Trash2 } from 'lucide-react';

type Participant = Tables<'participants'>;

export default function Participants() {
  const { profile } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchParticipants();
    }
  }, [profile]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      toast({
        title: "Error",
        description: "Failed to fetch participants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteParticipant = async (participantId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus peserta ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Peserta berhasil dihapus",
      });
      
      fetchParticipants();
    } catch (error) {
      console.error('Error deleting participant:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus peserta",
        variant: "destructive",
      });
    }
  };

  const toggleBlacklist = async (participantId: string, isBlacklisted: boolean) => {
    try {
      const { error } = await supabase
        .from('participants')
        .update({
          is_blacklisted: !isBlacklisted,
          blacklist_reason: !isBlacklisted ? 'Manually blacklisted by admin' : null,
        })
        .eq('id', participantId);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: `Peserta ${!isBlacklisted ? 'diblokir' : 'dibuka blokirnya'}`,
      });
      
      fetchParticipants();
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "Error",
        description: "Gagal mengupdate peserta",
        variant: "destructive",
      });
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Peserta Kajian</h1>
        <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Peserta
        </Button>
      </div>

      {participants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada peserta terdaftar</p>
              <p className="text-sm text-gray-400 mt-2">Tambah peserta pertama untuk memulai</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {participants.map((participant) => (
            <Card key={participant.id}>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <span className="text-lg">{participant.name}</span>
                  <div className="flex items-center space-x-2">
                    {participant.is_blacklisted ? (
                      <Badge variant="destructive">Diblokir</Badge>
                    ) : (
                      <Badge variant="secondary">Aktif</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteParticipant(participant.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {participant.email}</p>
                  {participant.phone && <p><strong>WhatsApp:</strong> {participant.phone}</p>}
                  <p><strong>QR Code:</strong> <span className="font-mono text-xs">{participant.qr_code}</span></p>
                  {participant.is_blacklisted && participant.blacklist_reason && (
                    <p className="text-red-600"><strong>Alasan:</strong> {participant.blacklist_reason}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <QRCodeGenerator 
                    value={participant.qr_code || participant.id} 
                    title="Participant QR"
                    size={120}
                  />
                </div>

                <Button
                  variant={participant.is_blacklisted ? "default" : "destructive"}
                  size="sm"
                  className="w-full"
                  onClick={() => toggleBlacklist(participant.id, participant.is_blacklisted || false)}
                >
                  {participant.is_blacklisted ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Buka Blokir
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Blokir Peserta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
