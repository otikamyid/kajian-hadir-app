
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/QRScanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function ParticipantCheckIn() {
  const { profile } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleQRScan = async (sessionId: string) => {
    if (!profile?.participant_id) {
      toast({
        title: "Error",
        description: "Profil participant tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setIsScanning(false);

    try {
      console.log('Processing check-in for session:', sessionId);
      
      // Check if session exists and is active
      const { data: session, error: sessionError } = await supabase
        .from('kajian_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (sessionError || !session) {
        toast({
          title: "Error",
          description: "Session tidak ditemukan atau tidak aktif",
          variant: "destructive",
        });
        return;
      }

      // Check if already checked in
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('session_id', sessionId)
        .eq('participant_id', profile.participant_id)
        .single();

      if (existingAttendance) {
        toast({
          title: "Info",
          description: "Anda sudah check-in untuk session ini",
          variant: "default",
        });
        return;
      }

      // Calculate attendance status based on timing
      const now = new Date();
      const sessionStart = new Date(`${session.date}T${session.start_time}`);
      const lateThresholdMinutes = parseInt(localStorage.getItem('lateThresholdMinutes') || '15');
      const lateThreshold = new Date(sessionStart.getTime() + lateThresholdMinutes * 60000);
      
      let status = 'present';
      if (now > lateThreshold) {
        status = 'late';
      }

      // Record attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          session_id: sessionId,
          participant_id: profile.participant_id,
          status: status,
          check_in_time: now.toISOString(),
          notes: status === 'late' ? `Terlambat ${Math.round((now.getTime() - sessionStart.getTime()) / 60000)} menit` : null
        });

      if (attendanceError) {
        console.error('Error recording attendance:', attendanceError);
        toast({
          title: "Error",
          description: "Gagal mencatat kehadiran",
          variant: "destructive",
        });
        return;
      }

      // Success message
      const statusMessage = status === 'present' ? 'tepat waktu' : 'terlambat';
      toast({
        title: "Check-in Berhasil!",
        description: `Anda berhasil check-in ${statusMessage} untuk "${session.title}"`,
        variant: status === 'present' ? "default" : "destructive",
      });

    } catch (error) {
      console.error('Error during check-in:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat check-in",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Check-in Mandiri</h1>
        <p className="text-gray-600 mt-2">
          Scan QR code session kajian untuk check-in otomatis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2">
            <QrCode className="h-5 w-5" />
            <span>Scanner QR Code</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processing ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600">Memproses check-in...</p>
            </div>
          ) : (
            <QRScanner
              onScan={handleQRScan}
              isScanning={isScanning}
              onToggleScanning={() => setIsScanning(!isScanning)}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span><strong>Tepat Waktu:</strong> Check-in dalam 15 menit pertama</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span><strong>Terlambat:</strong> Check-in setelah 15 menit</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span><strong>Tidak Hadir:</strong> Tidak check-in sama sekali</span>
            </div>
            <p className="text-gray-600 mt-4">
              Pastikan QR code yang di-scan adalah QR code session kajian yang sedang berlangsung.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
