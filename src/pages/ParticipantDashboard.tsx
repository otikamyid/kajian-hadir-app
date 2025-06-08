
import { useAuth } from '@/hooks/useAuth';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ParticipantDashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat dashboard peserta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Peserta</h1>
        <p className="text-gray-600">
          Selamat datang, {profile?.email || 'User'}
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            Peserta
          </span>
        </p>
      </div>

      {/* Profile Display */}
      <ProfileDisplay />

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Selamat Datang di Kajian Hadir</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Anda terdaftar sebagai peserta kajian. Gunakan fitur-fitur di bawah ini untuk 
            berpartisipasi dalam sesi kajian.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-blue-50 transition-colors" onClick={() => navigate('/scan')}>
              <CardContent className="pt-6 text-center">
                <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">QR Code Saya</h3>
                <p className="text-sm text-gray-600">Lihat QR code untuk check-in</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-green-50 transition-colors" onClick={() => navigate('/sessions')}>
              <CardContent className="pt-6 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Sesi Kajian</h3>
                <p className="text-sm text-gray-600">Lihat jadwal sesi kajian</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-purple-50 transition-colors" onClick={() => navigate('/profile/edit')}>
              <CardContent className="pt-6 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium">Edit Profil</h3>
                <p className="text-sm text-gray-600">Perbarui informasi profil</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Panduan Peserta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Cara Check-in:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Klik menu "Scan QR" untuk melihat QR code Anda</li>
                <li>Tunjukkan QR code kepada admin saat sesi dimulai</li>
                <li>Admin akan scan QR code Anda untuk mencatat kehadiran</li>
              </ol>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Fitur yang Tersedia:</h4>
              <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                <li>Lihat QR code pribadi Anda</li>
                <li>Cek jadwal sesi kajian yang akan datang</li>
                <li>Edit dan perbarui profil Anda</li>
                <li>Lihat riwayat kehadiran (segera hadir)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
