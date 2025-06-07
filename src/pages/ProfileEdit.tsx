
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tables } from '@/integrations/supabase/types';

type Participant = Tables<'participants'>;

export default function ProfileEdit() {
  const { profile, updateParticipant } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [formValid, setFormValid] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchParticipantData();
  }, [profile]);

  useEffect(() => {
    // Check form validity
    setFormValid(name.trim().length > 0 && phone.trim().length > 0);
  }, [name, phone]);

  const fetchParticipantData = async () => {
    if (!profile?.email) return;

    try {
      console.log('Fetching participant data for profile edit:', profile.email);
      
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('email', profile.email)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching participant:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data peserta",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Participant data loaded:', data);
      
      if (data) {
        setParticipant(data);
        setName(data.name || '');
        setPhone(data.phone || '');
      } else {
        toast({
          title: "Info",
          description: "Data peserta tidak ditemukan. Silakan lengkapi profil Anda.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in fetchParticipantData:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submit triggered with:', { participant, name, phone, formValid });
    
    if (!profile?.email) {
      toast({
        title: "Error",
        description: "Data profil tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    if (!formValid) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang diperlukan",
        variant: "destructive",
      });
      return;
    }

    if (!participant) {
      toast({
        title: "Error",
        description: "Data peserta tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Updating participant data:', { 
        participantId: participant.id, 
        name: name.trim(), 
        phone: phone.trim() 
      });
      
      const result = await updateParticipant(participant.id, name.trim(), phone.trim());
      
      if (result.error) {
        console.error('Update error:', result.error);
        throw result.error;
      }
      
      console.log('Participant updated successfully:', result);

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui!",
      });

      // Navigate back to dashboard after successful update
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat memperbarui profil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </Button>
        <h1 className="text-3xl font-bold">Edit Profil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-gray-100"
              />
              <p className="text-sm text-gray-500">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="contoh: +628123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !formValid || !participant}
                className="min-w-[120px]"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1">
            <p>Profile Email: {profile?.email}</p>
            <p>Participant ID: {participant?.id}</p>
            <p>Form Valid: {formValid ? 'Yes' : 'No'}</p>
            <p>Name: "{name}"</p>
            <p>Phone: "{phone}"</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
