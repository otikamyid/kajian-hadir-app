
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Phone, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileDisplayProps {
  showEditButton?: boolean;
}

export function ProfileDisplay({ showEditButton = true }: ProfileDisplayProps) {
  const { profile } = useAuth();
  const [participant, setParticipant] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, [profile]);

  const fetchProfileData = async () => {
    if (!profile) return;

    // Fetch participant data for both admin and participant
    if (profile.email) {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('email', profile.email)
        .maybeSingle();
      
      setParticipant(data);
    }
  };

  const getInitials = () => {
    const name = participant?.name || profile?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
              {participant?.name || profile?.email}
            </h3>
            <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
              {profile?.role === 'admin' ? 'Administrator' : 'Peserta'}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{profile?.email}</span>
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
