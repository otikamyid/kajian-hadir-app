
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

export default function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, createAdminProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate admin code
    if (adminCode !== 'ADMIN2024') {
      toast({
        title: "Error",
        description: "Kode admin tidak valid",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Set timeout untuk registrasi
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Registrasi terlalu lama')), 30000);
    });

    try {
      console.log('Creating admin account with:', { email });
      
      const registrationPromise = (async () => {
        // Sign up process
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Processing",
          description: "Akun admin berhasil dibuat! Sedang mengatur profil admin...",
        });

        // Wait for user creation and create admin profile
        let attempts = 0;
        const maxAttempts = 15;
        
        const checkAndCreateProfile = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user && attempts < maxAttempts) {
            console.log('User found, creating admin profile:', user.id);
            
            const result = await createAdminProfile(user.id, email);
            
            if (result.error) {
              console.error('Error creating admin profile:', result.error);
              toast({
                title: "Error",
                description: "Gagal membuat profil admin: " + result.error.message,
                variant: "destructive",
              });
            } else {
              console.log('Admin profile created successfully with role:', result.profile?.role);
              toast({
                title: "Success",
                description: "Akun admin berhasil dibuat! Anda akan diarahkan ke dashboard admin.",
              });
              
              // Force redirect to admin dashboard
              setTimeout(() => {
                navigate('/admin/dashboard');
              }, 1500);
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            console.log('Retrying admin profile creation, attempt:', attempts);
            setTimeout(checkAndCreateProfile, 1000);
          } else {
            throw new Error('Timeout saat membuat profil admin');
          }
        };

        // Start checking for user
        setTimeout(checkAndCreateProfile, 2000);
      })();

      await Promise.race([registrationPromise, timeoutPromise]);
      
    } catch (error: any) {
      console.error('Error in admin registration:', error);
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Kajian Hadir - Admin</h1>
            </div>
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
      </header>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl sm:text-2xl text-red-600">
              Daftar Admin
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Buat akun administrator untuk mengelola sistem absensi kajian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminCode">Kode Admin</Label>
                <Input
                  id="adminCode"
                  type="text"
                  placeholder="Masukkan kode admin"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-600">
                  Gunakan kode: <strong>ADMIN2024</strong>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Admin</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@kajian.com"
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
                  placeholder="Masukkan password admin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-red-800">
                  <strong>Info:</strong> Akun ini akan mendapat akses penuh sebagai administrator 
                  untuk mengelola sesi kajian, peserta, dan sistem absensi.
                </p>
              </div>

              {loading && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Sedang memproses...</strong> Mohon tunggu hingga proses selesai (max 30 detik)
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Membuat Akun...' : 'Daftar sebagai Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
