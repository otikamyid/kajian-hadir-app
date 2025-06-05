
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type KajianSession = Tables<'kajian_sessions'>;

export default function Sessions() {
  const { profile } = useAuth();
  const [sessions, setSessions] = useState<KajianSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('kajian_sessions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSampleSession = async () => {
    if (profile?.role !== 'admin') return;

    try {
      const { error } = await supabase
        .from('kajian_sessions')
        .insert({
          title: 'Weekly Kajian',
          description: 'Regular weekly Islamic study session',
          date: new Date().toISOString().split('T')[0],
          start_time: '19:00',
          end_time: '21:00',
          location: 'Main Hall',
          max_participants: 50,
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sample session created successfully",
      });
      
      fetchSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create session",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kajian Sessions</h1>
        {profile?.role === 'admin' && (
          <Button onClick={createSampleSession}>
            <Plus className="h-4 w-4 mr-2" />
            Create Sample Session
          </Button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No sessions found</p>
              {profile?.role === 'admin' && (
                <p className="text-sm text-gray-400 mt-2">Create your first session to get started</p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {session.title}
                  <div className={`px-2 py-1 rounded text-sm ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {session.is_active ? 'Active' : 'Inactive'}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{session.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                    Max {session.max_participants} participants
                  </div>
                )}

                <div className="flex justify-center pt-4">
                  <QRCodeGenerator 
                    value={session.id} 
                    title="Session QR Code"
                    size={150}
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
