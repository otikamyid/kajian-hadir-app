
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple admin code check (you can make this more sophisticated)
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
      console.log('Attempting admin login with:', email);
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Admin login berhasil, menunggu redirect...');
        toast({
          title: "Success",
          description: "Login admin berhasil!",
        });
        
        // Force redirect ke admin dashboard
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Portal</h1>
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

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-red-600 mb-4" />
            <CardTitle className="text-xl sm:text-2xl">
              Login Administrator
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Portal khusus untuk admin kajian
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
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : 'Login Admin'}
              </Button>
            </form>

            {/* Admin info */}
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2 text-sm sm:text-base">Akses Admin:</h4>
              <div className="text-xs sm:text-sm text-red-800 space-y-1">
                <p>• Kelola sesi kajian</p>
                <p>• Scan QR Code peserta</p>
                <p>• Manajemen peserta</p>
                <p>• Dashboard analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
