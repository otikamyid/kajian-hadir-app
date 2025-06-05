
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, QrCode, Users, Shield, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Check-in',
      description: 'Scan QR codes untuk absensi cepat dan mudah'
    },
    {
      icon: Calendar,
      title: 'Manajemen Sesi',
      description: 'Kelola jadwal kajian dengan mudah dan terorganisir'
    },
    {
      icon: Users,
      title: 'Tracking Peserta',
      description: 'Pantau kehadiran dan partisipasi peserta kajian'
    },
    {
      icon: Shield,
      title: 'Role-based Access',
      description: 'Sistem akses bertingkat untuk admin dan peserta'
    }
  ];

  const benefits = [
    'Absensi digital yang akurat',
    'Laporan kehadiran real-time',
    'Notifikasi otomatis',
    'Dashboard analytics',
    'Backup data cloud',
    'Mobile-friendly interface'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kajian Hadir</h1>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Login Peserta</span>
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Login Admin</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Sistem Absensi Kajian
              <span className="block text-blue-600">Modern & Digital</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kelola kehadiran peserta kajian dengan teknologi QR Code. 
              Mudah, cepat, dan akurat untuk komunitas Muslim modern.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-4"
              >
                Mulai Sekarang
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-4"
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              Teknologi terdepan untuk manajemen kajian yang efisien
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-12 w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Mengapa Memilih Kajian Hadir?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Sistem yang dirancang khusus untuk kebutuhan komunitas kajian 
                dengan teknologi modern dan interface yang user-friendly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                  <QrCode className="h-20 w-20 mx-auto text-blue-600 mb-4" />
                  <CardTitle>Scan & Go</CardTitle>
                  <CardDescription>
                    Cukup scan QR code untuk absensi instan
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg">
                    <div className="w-32 h-32 bg-gray-300 mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500 mt-4">QR Code Demo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Siap Memulai Perjalanan Digital?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Bergabunglah dengan komunitas kajian yang sudah menggunakan 
              sistem absensi digital untuk pengalaman yang lebih baik.
            </p>
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-4"
              >
                <Clock className="h-5 w-5 mr-2" />
                Daftar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-6 w-6" />
              <span className="text-xl font-bold">Kajian Hadir</span>
            </div>
            <p className="text-gray-400">
              Sistem Absensi Digital untuk Komunitas Muslim Modern
            </p>
            <p className="text-gray-500 text-sm mt-4">
              © 2024 Kajian Hadir. Semua hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
