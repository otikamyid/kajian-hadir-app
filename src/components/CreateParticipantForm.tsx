
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
      console.log('Creating participant invitation for:', { name, email, phone });

      // Generate unique token
      const token = crypto.randomUUID();
      
      // Create invitation record
      const { error: invitationError } = await supabase
        .from('participant_invitations')
        .insert({
          name,
          email,
          phone,
          token,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (invitationError) {
        console.error('Error creating invitation:', invitationError);
        throw invitationError;
      }

      // Send invitation email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email,
          name,
          phone,
          token,
          invitedBy: (await supabase.auth.getUser()).data.user?.email,
        },
      });

      if (emailError) {
        console.error('Error sending invitation:', emailError);
        throw emailError;
      }

      toast({
        title: "Berhasil",
        description: `Undangan berhasil dikirim ke ${email}. Peserta akan menerima email untuk membuat akun.`,
      });

      onParticipantCreated();
    } catch (error: any) {
      console.error('Error creating participant invitation:', error);
      toast({
        title: "Error",
        description: `Gagal mengirim undangan: ${error.message}`,
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
          <span>Undang Peserta Baru</span>
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

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Mengirim Undangan...' : 'Kirim Undangan'}
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
