
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Shield, ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp, createParticipantProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Admin code validation
    if (adminCode !== 'ADMIN2024') {
      toast({
        title: "Error",
        description: "Kode admin tidak valid",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating admin account with:', { email, name, phone });
      
      // Sign up process
      const { error } = await signUp(email, password);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Wait a bit for the user to be created properly
        setTimeout(async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log('User created, now creating admin profile:', user.id);
              
              const result = await createParticipantProfile(user.id, email, name, phone, 'admin');
              
              if (result.error) {
                console.error('Error creating admin profile:', result.error);
                toast({
                  title: "Error",
                  description: "Gagal membuat profil admin",
                  variant: "destructive",
                });
              } else {
                console.log('Admin profile created successfully');
                toast({
                  title: "Success",
                  description: "Akun admin berhasil dibuat! Silakan login.",
                });
                navigate('/admin/auth');
              }
            }
          } catch (profileError) {
            console.error('Error in profile creation:', profileError);
            toast({
              title: "Error",
              description: "Terjadi kesalahan saat membuat profil admin",
              variant: "destructive",
            });
          }
        }, 2000);
        
        toast({
          title: "Success",
          description: "Akun admin berhasil dibuat! Sedang mengatur profil...",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Registration</h1>
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
            <UserPlus className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <CardTitle className="text-xl sm:text-2xl">
              Daftar Admin Baru
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Buat akun administrator untuk mengelola kajian
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminCode">Kode Admin</Label>
                <Input
                  id="adminCode"
                  type="password"
                  placeholder="Masukkan kode admin"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  required
                />
              </div>

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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@email.com"
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
                  placeholder="contoh: +628123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs sm:text-sm text-red-800">
                  <strong>Info:</strong> Akun admin memiliki akses penuh untuk mengelola 
                  kajian, peserta, dan semua fitur administrasi.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Membuat Akun...' : 'Daftar Admin'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate('/admin/auth')}
                className="text-red-600 text-sm sm:text-base"
              >
                Sudah punya akun admin? Login di sini
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
