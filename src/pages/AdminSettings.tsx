import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Clock, Save } from 'lucide-react';
import { SupabaseConfigPanel } from '@/components/SupabaseConfigPanel';

export default function AdminSettings() {
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(15);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from localStorage
    const savedThreshold = localStorage.getItem('lateThresholdMinutes');
    if (savedThreshold) {
      setLateThresholdMinutes(parseInt(savedThreshold));
    }
  }, []);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in production, you'd save to database)
      localStorage.setItem('lateThresholdMinutes', lateThresholdMinutes.toString());
      
      toast({
        title: "Berhasil",
        description: "Pengaturan telah disimpan",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8" />
        <h1 className="text-2xl sm:text-3xl font-bold">Pengaturan Admin</h1>
      </div>

      {/* Supabase Configuration Panel */}
      <SupabaseConfigPanel />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Pengaturan Waktu Kehadiran</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lateThreshold">
              Batas Waktu Terlambat (menit setelah mulai sesi)
            </Label>
            <Input
              id="lateThreshold"
              type="number"
              min="0"
              max="60"
              value={lateThresholdMinutes}
              onChange={(e) => setLateThresholdMinutes(parseInt(e.target.value) || 0)}
              className="w-full sm:w-48"
            />
            <p className="text-sm text-gray-600">
              Peserta yang check-in setelah {lateThresholdMinutes} menit dari waktu mulai akan dianggap terlambat
            </p>
          </div>

          <Button onClick={saveSettings} disabled={loading} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pengaturan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Status Kehadiran:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><span className="text-green-600">Hadir</span> - Check-in dalam {lateThresholdMinutes} menit pertama</li>
              <li><span className="text-orange-600">Terlambat</span> - Check-in setelah {lateThresholdMinutes} menit</li>
              <li><span className="text-red-600">Tidak Hadir</span> - Tidak check-in sama sekali</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
