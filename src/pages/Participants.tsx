
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Plus, Users, Shield, ShieldOff } from 'lucide-react';

type Participant = Tables<'participants'>;

export default function Participants() {
  const { profile } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
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

  const createSampleParticipant = async () => {
    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          name: 'John Doe',
          email: `john.doe.${Date.now()}@example.com`,
          phone: '+1234567890',
          qr_code: `participant_${Date.now()}`,
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Sample participant created successfully",
      });
      
      fetchParticipants();
    } catch (error) {
      console.error('Error creating participant:', error);
      toast({
        title: "Error",
        description: "Failed to create participant",
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
        title: "Success",
        description: `Participant ${!isBlacklisted ? 'blacklisted' : 'removed from blacklist'}`,
      });
      
      fetchParticipants();
    } catch (error) {
      console.error('Error updating participant:', error);
      toast({
        title: "Error",
        description: "Failed to update participant",
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Participants</h1>
        <Button onClick={createSampleParticipant}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sample Participant
        </Button>
      </div>

      {participants.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No participants found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first participant to get started</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {participants.map((participant) => (
            <Card key={participant.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {participant.name}
                  <div className="flex items-center space-x-2">
                    {participant.is_blacklisted ? (
                      <Badge variant="destructive">Blacklisted</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {participant.email}</p>
                  {participant.phone && <p><strong>Phone:</strong> {participant.phone}</p>}
                  <p><strong>QR Code:</strong> <span className="font-mono">{participant.qr_code}</span></p>
                  {participant.is_blacklisted && participant.blacklist_reason && (
                    <p className="text-red-600"><strong>Reason:</strong> {participant.blacklist_reason}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <QRCodeGenerator 
                    value={participant.qr_code} 
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
                      Remove from Blacklist
                    </>
                  ) : (
                    <>
                      <ShieldOff className="h-4 w-4 mr-2" />
                      Add to Blacklist
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
