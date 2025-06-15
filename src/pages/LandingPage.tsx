import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, QrCode, Users, Shield, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

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

  const handleDashboardClick = () => {
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/participant/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Hadir Kajian</h1>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              {user ? (
                <Button onClick={handleDashboardClick} className="text-sm sm:text-base px-3 sm:px-4">
                  <Shield className="h-4 w-4 mr-1 sm:mr-2" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/auth')}
                    className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-2 sm:px-4"
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Login Peserta</span>
                    <span className="sm:hidden">Login</span>
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base px-2 sm:px-4"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Login Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Sistem Absensi Kajian
              <span className="block text-blue-600">Modern & Digital</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Kelola kehadiran peserta kajian dengan teknologi QR Code. 
              Mudah, cepat, dan akurat untuk komunitas Muslim modern.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                Mulai Sekarang
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
              >
                Pelajari Lebih Lanjut
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Teknologi terdepan untuk manajemen kajian yang efisien
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Mengapa Memilih Kajian Hadir?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Sistem yang dirancang khusus untuk kebutuhan komunitas kajian 
                dengan teknologi modern dan interface yang user-friendly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 text-sm sm:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center order-1 lg:order-2">
              <Card className="w-full max-w-sm sm:max-w-md">
                <CardHeader className="text-center">
                  <QrCode className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-blue-600 mb-4" />
                  <CardTitle className="text-lg sm:text-xl">Scan & Go</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Cukup scan QR code untuk absensi instan
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-gray-100 p-6 sm:p-8 rounded-lg">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-300 mx-auto rounded-lg flex items-center justify-center">
                      <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-4">QR Code Demo</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-white px-4">
              Siap Memulai Perjalanan Digital?
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Bergabunglah dengan komunitas kajian yang sudah menggunakan 
              sistem absensi digital untuk pengalaman yang lebih baik.
            </p>
            <div className="flex justify-center px-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto max-w-xs"
              >
                <Clock className="h-5 w-5 mr-2" />
                Daftar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-lg sm:text-xl font-bold">Hadir Kajian</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base px-4">
              Sistem Absensi Digital untuk Komunitas Muslim Modern
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-4">
              © 2024 Hadir Kajian. Semua hak cipta dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
