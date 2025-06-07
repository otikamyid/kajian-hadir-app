
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Participant = Tables<'participants'>;

interface ProfileDisplayProps {
  showEditButton?: boolean;
}

export function ProfileDisplay({ showEditButton = true }: ProfileDisplayProps) {
  const { profile } = useAuth();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, [profile]);

  const fetchProfileData = async () => {
    if (!profile?.email) return;

    // Fetch participant data for both admin and participant
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('email', profile.email)
      .maybeSingle();
    
    setParticipant(data);
  };

  const getInitials = () => {
    if (!profile?.email) return 'U';
    const name = participant?.name || profile.email;
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profil Saya</span>
          {showEditButton && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile/edit')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-lg bg-blue-500 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {participant?.name || profile.email}
            </h3>
            <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
              {profile.role === 'admin' ? 'Administrator' : 'Peserta'}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{profile.email}</span>
          </div>
          
          {participant?.phone && (
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{participant.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
