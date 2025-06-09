
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { Calendar, Clock, MapPin, Users, Edit } from 'lucide-react';

type KajianSession = Tables<'kajian_sessions'>;

interface EditSessionFormProps {
  session: KajianSession;
  onSessionUpdated: () => void;
  onCancel: () => void;
}

export function EditSessionForm({ session, onSessionUpdated, onCancel }: EditSessionFormProps) {
  const [title, setTitle] = useState(session.title);
  const [description, setDescription] = useState(session.description || '');
  const [date, setDate] = useState(session.date);
  const [startTime, setStartTime] = useState(session.start_time);
  const [endTime, setEndTime] = useState(session.end_time);
  const [location, setLocation] = useState(session.location || '');
  const [maxParticipants, setMaxParticipants] = useState(session.max_participants?.toString() || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('kajian_sessions')
        .update({
          title,
          description,
          date,
          start_time: startTime,
          end_time: endTime,
          location,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      if (error) throw error;

      toast({
        title: "Berhasil",
        description: "Session kajian berhasil diperbarui",
      });

      onSessionUpdated();
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        title: "Error",
        description: `Gagal memperbarui session: ${error.message}`,
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
          <Edit className="h-5 w-5" />
          <span>Edit Session</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Session</Label>
            <Input
              id="title"
              placeholder="Contoh: Kajian Mingguan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              placeholder="Deskripsi session kajian..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Mulai</span>
              </Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime" className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Selesai</span>
              </Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Lokasi</span>
            </Label>
            <Input
              id="location"
              placeholder="Contoh: Masjid Al-Ikhlas"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Maks Peserta</span>
            </Label>
            <Input
              id="maxParticipants"
              type="number"
              placeholder="50"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Memperbarui...' : 'Perbarui Session'}
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
