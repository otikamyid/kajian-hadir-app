
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfileEdit() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfileData();
  }, [profile]);

  const fetchProfileData = async () => {
    if (!profile) return;

    // Fetch participant data if user is a participant
    if (profile.role === 'participant' && profile.participant_id) {
      const { data } = await supabase
        .from('participants')
        .select('*')
        .eq('id', profile.participant_id)
        .maybeSingle();
      
      if (data) {
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: profile.address || ''
        });
      }
    }

    // Load existing profile photo
    if (profile.id) {
      const { data } = await supabase.storage
        .from('profile-photos')
        .list(profile.id, { limit: 1 });
      
      if (data && data.length > 0) {
        const { data: publicUrl } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(`${profile.id}/${data[0].name}`);
        
        setProfilePhoto(publicUrl.publicUrl);
      }
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    // Check file size (500KB max)
    if (file.size > 500 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran foto maksimal 500KB",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Delete existing photo first
      await supabase.storage
        .from('profile-photos')
        .remove([`${profile.id}/profile.jpg`]);

      // Upload new photo
      const { error } = await supabase.storage
        .from('profile-photos')
        .upload(`${profile.id}/profile.jpg`, file, {
          upsert: true
        });

      if (error) throw error;

      // Get new photo URL
      const { data: publicUrl } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(`${profile.id}/profile.jpg`);
      
      setProfilePhoto(publicUrl.publicUrl + '?t=' + Date.now()); // Cache bust
      
      toast({
        title: "Berhasil",
        description: "Foto profil berhasil diupload"
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Error",
        description: "Gagal mengupload foto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          address: formData.address
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Update participants table if user is a participant
      if (profile.role === 'participant' && profile.participant_id) {
        const { error: participantError } = await supabase
          .from('participants')
          .update({
            name: formData.name,
            phone: formData.phone
          })
          .eq('id', profile.participant_id);

        if (participantError) throw participantError;
      }

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui"
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const name = formData.name || profile?.email || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Edit Profil</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePhoto} alt="Profile" />
                <AvatarFallback className="text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="photo">Foto Profil</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 500KB. Format: JPG, PNG
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              <div>
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Nomor WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="contoh: +628123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="address">Alamat</Label>
                <Textarea
                  id="address"
                  placeholder="Masukkan alamat lengkap"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
