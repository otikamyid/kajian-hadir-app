
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRScanner } from '@/components/QRScanner';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, Camera, Users } from 'lucide-react';

export default function ScanQR() {
  const { profile } = useAuth();
  const [scanResult, setScanResult] = useState<string>('');
  const [participantInfo, setParticipantInfo] = useState<any>(null);
  const { toast } = useToast();

  const handleScan = async (result: string) => {
    setScanResult(result);
    
    try {
      // Look up participant by QR code
      const { data: participant, error } = await supabase
        .from('participants')
        .select('*')
        .eq('qr_code', result)
        .maybeSingle();

      if (error) throw error;

      if (participant) {
        setParticipantInfo(participant);
        
        if (participant.is_blacklisted) {
          toast({
            title: "Peserta Diblokir",
            description: `${participant.name} tidak dapat melakukan check-in. Alasan: ${participant.blacklist_reason}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "QR Code Valid",
            description: `Peserta: ${participant.name} - ${participant.email}`,
          });
        }
      } else {
        setParticipantInfo(null);
        toast({
          title: "QR Code Tidak Valid",
          description: "QR Code tidak ditemukan dalam database.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error looking up participant:', error);
      toast({
        title: "Error",
        description: "Gagal mencari data peserta.",
        variant: "destructive",
      });
    }
  };

  // Show participant view for non-admin users
  if (profile?.role !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">QR Code Anda</h1>
          <p className="text-gray-600 text-sm sm:text-base px-4">
            Tunjukkan QR code ini kepada admin untuk melakukan check-in
          </p>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <QrCode className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-lg sm:text-xl">QR Code Peserta</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {profile?.participant_id ? (
                <QRCodeGenerator 
                  value={`QR_${profile.participant_id}`}
                  title="QR Code Anda"
                  size={200}
                />
              ) : (
                <div className="bg-gray-100 p-8 rounded-lg">
                  <p className="text-gray-500 text-sm">
                    QR Code sedang dibuat...
                  </p>
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <p><strong>Nama:</strong> {profile?.name || profile?.email}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
                {profile?.phone && <p><strong>Phone:</strong> {profile.phone}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mx-4 sm:mx-0">
          <h3 className="font-medium text-blue-900 mb-2">Petunjuk:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tunjukkan QR code ini kepada admin saat check-in</li>
            <li>• Pastikan QR code terlihat jelas dan tidak tertutup</li>
            <li>• Jika ada masalah, hubungi admin kajian</li>
          </ul>
        </div>
      </div>
    );
  }

  // Admin view with scanner
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Scan QR Code</h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          Scan QR code peserta untuk melakukan check-in
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Camera className="h-5 w-5 mr-2" />
              Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <QRScanner onScan={handleScan} />
            {scanResult && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-medium">QR Code Result:</p>
                <p className="text-xs sm:text-sm font-mono break-all">{scanResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Participant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Users className="h-5 w-5 mr-2" />
              Informasi Peserta
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participantInfo ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{participantInfo.name}</h3>
                  {participantInfo.is_blacklisted ? (
                    <Badge variant="destructive">Diblokir</Badge>
                  ) : (
                    <Badge variant="secondary">Aktif</Badge>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {participantInfo.email}</p>
                  {participantInfo.phone && (
                    <p><strong>Phone:</strong> {participantInfo.phone}</p>
                  )}
                  <p><strong>QR Code:</strong> <span className="font-mono">{participantInfo.qr_code}</span></p>
                  {participantInfo.is_blacklisted && participantInfo.blacklist_reason && (
                    <p className="text-red-600">
                      <strong>Alasan Diblokir:</strong> {participantInfo.blacklist_reason}
                    </p>
                  )}
                </div>

                {participantInfo.is_blacklisted && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">
                      ⚠️ Peserta ini tidak dapat melakukan check-in karena diblokir.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Scan QR code untuk melihat informasi peserta</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
