import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, createParticipantProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Login berhasil! Selamat datang di Kajian Hadir.",
          });
        }
      } else {
        // Sign up process untuk participant biasa
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Wait for user to be created, then create participant profile
          setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log('Creating participant profile for user:', user.id);
              await createParticipantProfile(user.id, email, name, phone, 'participant');
            }
          }, 2000);
          
          toast({
            title: "Success",
            description: "Akun peserta berhasil dibuat! Silakan periksa email untuk verifikasi.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Kajian Hadir</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/auth')}
                className="text-xs text-gray-500 hover:text-gray-700"
                size="sm"
              >
                Admin
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-sm sm:text-base"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl">
              {isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isLogin 
                ? 'Masuk dengan email dan password Anda' 
                : 'Buat akun baru untuk menggunakan sistem absensi kajian'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="contoh: +628123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
              
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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {!isLogin && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Info:</strong> Akun baru akan mendapat role "Peserta" secara default. 
                    Untuk akses admin, gunakan pendaftaran admin terpisah.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading 
                  ? 'Loading...' 
                  : isLogin 
                    ? 'Masuk' 
                    : 'Daftar'
                }
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 text-sm sm:text-base"
                >
                  {isLogin 
                    ? 'Belum punya akun? Daftar di sini' 
                    : 'Sudah punya akun? Masuk di sini'
                  }
                </Button>
              </div>
            </form>

            {/* Demo accounts info - Only for login */}
            {isLogin && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Demo Accounts:</h4>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                  <p><strong>Admin:</strong> admin@kajian.com / admin123</p>
                  <p><strong>Peserta:</strong> peserta@kajian.com / peserta123</p>
                  <p className="text-orange-600 mt-2">
                    <strong>Note:</strong> Demo accounts akan dibuat otomatis saat pertama kali digunakan.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
