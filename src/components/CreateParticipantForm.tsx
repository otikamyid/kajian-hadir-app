
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface CreateParticipantFormProps {
  onParticipantCreated: () => void;
  onCancel: () => void;
}

export function CreateParticipantForm({ onParticipantCreated, onCancel }: CreateParticipantFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating participant directly:', { name, email, phone });

      // Generate temporary password and QR code
      const tempPassword = crypto.randomUUID().substring(0, 12);
      const qrCode = `QR_${email.replace('@', '_').replace('.', '_')}_${Date.now()}`;
      
      // Step 1: Create user account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: name.trim(),
          phone: phone.trim()
        }
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        throw new Error(`Gagal membuat akun: ${authError?.message || 'Unknown error'}`);
      }

      console.log('Auth user created:', authData.user.id);

      // Step 2: Create participant record
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          qr_code: qrCode
        })
        .select()
        .single();

      if (participantError) {
        console.error('Error creating participant:', participantError);
        // Cleanup: delete auth user if participant creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Gagal membuat data peserta: ${participantError.message}`);
      }

      console.log('Participant created:', participant);

      // Step 3: Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase().trim(),
          role: 'participant',
          participant_id: participant.id
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Cleanup: delete participant and auth user
        await supabase.from('participants').delete().eq('id', participant.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Gagal membuat profil: ${profileError.message}`);
      }

      console.log('Profile created successfully');

      // Step 4: Send password reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth?message=set_password`
        }
      );

      if (resetError) {
        console.error('Error sending reset email:', resetError);
        // Don't throw error here - participant is created, just notify admin
        toast({
          title: "Peserta Berhasil Dibuat",
          description: `${name} berhasil didaftarkan, namun email gagal dikirim. Anda dapat mengirim ulang undangan nanti.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Berhasil",
          description: `${name} berhasil didaftarkan! Email untuk set password telah dikirim ke ${email}.`,
        });
      }

      onParticipantCreated();
    } catch (error: any) {
      console.error('Error in participant creation:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal mendaftarkan peserta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Daftarkan Peserta Baru</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor WhatsApp</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="text-blue-800">
              <strong>Info:</strong> Peserta akan menerima email untuk membuat password dan bisa langsung login.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Mendaftarkan...' : 'Daftarkan Peserta'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
