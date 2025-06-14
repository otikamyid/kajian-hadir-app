
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { CreateSessionForm } from '@/components/CreateSessionForm';
import { EditSessionForm } from '@/components/EditSessionForm';
import { SessionAttendanceMonitor } from '@/components/SessionAttendanceMonitor';
import { SessionQRPrint } from '@/components/SessionQRPrint';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Calendar, MapPin, Users, Trash2, Edit, Power, PowerOff, Monitor, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type KajianSession = Tables<'kajian_sessions'>;

export default function Sessions() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<KajianSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSession, setEditingSession] = useState<KajianSession | null>(null);
  const [monitoringSession, setMonitoringSession] = useState<KajianSession | null>(null);
  const [printingSession, setPrintingSession] = useState<KajianSession | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions...');
      
      const { data, error } = await supabase
        .from('kajian_sessions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Sessions fetched successfully:', data?.length);
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: `Failed to fetch sessions: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus session ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('kajian_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Session kajian berhasil dihapus",
      });

      fetchSessions();
    } catch (error: any) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: `Gagal menghapus session: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const toggleSessionActive = async (sessionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('kajian_sessions')
        .update({ is_active: !currentStatus })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: `Session ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });

      fetchSessions();
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: `Gagal mengupdate session: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Show loading state while user authentication is being determined
  if (!user || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <CreateSessionForm
          onSessionCreated={() => {
            setShowCreateForm(false);
            fetchSessions();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (editingSession) {
    return (
      <div className="space-y-6">
        <EditSessionForm
          session={editingSession}
          onSessionUpdated={() => {
            setEditingSession(null);
            fetchSessions();
          }}
          onCancel={() => setEditingSession(null)}
        />
      </div>
    );
  }

  if (monitoringSession) {
    return (
      <div className="space-y-6">
        <SessionAttendanceMonitor
          sessionId={monitoringSession.id}
          sessionTitle={monitoringSession.title}
          onClose={() => setMonitoringSession(null)}
        />
      </div>
    );
  }

  if (printingSession) {
    return (
      <div className="space-y-6">
        <SessionQRPrint
          session={printingSession}
          onClose={() => setPrintingSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Sesi Kajian</h1>
        {profile?.role === 'admin' && (
          <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Buat Session Baru
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada session kajian</p>
              {profile?.role === 'admin' && (
                <p className="text-sm text-gray-400 mt-2">Buat session pertama untuk memulai</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                  <span className="text-lg sm:text-xl">{session.title}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-sm ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {session.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </div>
                    {profile?.role === 'admin' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPrintingSession(session)}
                          title="Cetak QR Code"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setMonitoringSession(session)}
                          title="Monitor kehadiran"
                        >
                          <Monitor className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={session.is_active ? "destructive" : "default"}
                          onClick={() => toggleSessionActive(session.id, session.is_active)}
                          title={session.is_active ? "Nonaktifkan session" : "Aktifkan session"}
                        >
                          {session.is_active ? <PowerOff className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSession(session)}
                          title="Edit session"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSession(session.id)}
                          title="Hapus session"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm sm:text-base">{session.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {session.date}
                  </div>
                  <div>
                    {session.start_time} - {session.end_time}
                  </div>
                </div>

                {session.location && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {session.location}
                  </div>
                )}

                {session.max_participants && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    Maks {session.max_participants} peserta
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <QRCodeGenerator 
                    value={session.id} 
                    title="Session QR Code"
                    size={120}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
