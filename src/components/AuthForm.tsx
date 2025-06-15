
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Calendar, ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const { signIn, signUp, createParticipantProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const getErrorMessage = (error: any) => {
    if (!error?.message) return "Terjadi kesalahan. Silakan coba lagi.";
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid email or password') ||
        errorMessage.includes('email not confirmed')) {
      return "Email atau password yang Anda masukkan salah. Silakan periksa kembali.";
    }
    
    if (errorMessage.includes('user already registered')) {
      return "Email ini sudah terdaftar. Silakan gunakan email lain atau coba masuk.";
    }
    
    if (errorMessage.includes('email already exists')) {
      return "Email ini sudah terdaftar. Silakan gunakan email lain atau coba masuk.";
    }
    
    if (errorMessage.includes('password should be at least')) {
      return "Password minimal 6 karakter. Silakan gunakan password yang lebih panjang.";
    }
    
    return error.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && (!name || !phone)) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting participant login with:', email);
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Gagal Masuk",
            description: getErrorMessage(error),
            variant: "destructive",
          });
        } else {
          console.log('Login berhasil, menunggu redirect...');
          toast({
            title: "Berhasil",
            description: "Login berhasil! Selamat datang di Kajian Hadir.",
          });
          
          // Force redirect setelah login berhasil
          setTimeout(() => {
            navigate('/participant/dashboard');
          }, 1000);
        }
      } else {
        console.log('=== Starting participant registration ===');
        console.log('Registration data:', { email, name, phone });
        
        // Step 1: Sign up user and immediately get the user data
        const { error: signUpError, user } = await signUp(email, password);
        if (signUpError) {
          console.error('Sign up error:', signUpError);
          toast({
            title: "Gagal Mendaftar",
            description: getErrorMessage(signUpError),
            variant: "destructive",
          });
          return;
        }

        if (!user) {
          toast({
            title: "Error",
            description: "Gagal membuat akun. Silakan coba lagi.",
            variant: "destructive",
          });
          return;
        }

        console.log('✓ User signup successful, user ID:', user.id);
        
        // Show email confirmation message
        setShowEmailConfirmation(true);
        
        toast({
          title: "Pendaftaran Berhasil!",
          description: "Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.",
        });

        // Step 2: Create participant profile immediately with the user ID
        try {
          console.log('Creating participant profile with user ID:', user.id);
          
          const result = await createParticipantProfile(user.id, email, name, phone);
          
          if (result.error) {
            console.error('Error creating participant profile:', result.error);
            throw new Error(result.error.message || 'Failed to create participant profile');
          } else {
            console.log('✓ Participant profile created successfully');
            
            // Additional success message for profile creation
            setTimeout(() => {
              toast({
                title: "Profil Tersimpan",
                description: "Profil peserta berhasil dibuat. Anda dapat login setelah mengkonfirmasi email.",
              });
            }, 2000);
          }
        } catch (error: any) {
          console.error('Final error in profile creation:', error);
          toast({
            title: "Peringatan",
            description: `Akun berhasil dibuat namun ada masalah dengan profil: ${error.message}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Kajian Hadir - Peserta</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/auth')}
                className="text-xs text-gray-500 hover:text-gray-700"
                size="sm"
              >
                Admin Login
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
            <CardTitle className="text-xl sm:text-2xl text-blue-600">
              {isLogin ? 'Masuk Peserta' : 'Daftar Peserta'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {isLogin 
                ? 'Masuk dengan akun peserta Anda' 
                : 'Daftar sebagai peserta kajian'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Email Confirmation Alert */}
            {!isLogin && showEmailConfirmation && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Cek Email Anda!</strong><br />
                  Kami telah mengirim link konfirmasi ke email Anda. Silakan klik link tersebut untuk mengaktifkan akun, kemudian Anda dapat login.
                </AlertDescription>
              </Alert>
            )}

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

              {!isLogin && (
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
              )}
              
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
                    <strong>Info:</strong> Akun ini akan mendapat role "Peserta" untuk mengikuti kajian.
                  </p>
                </div>
              )}

              {loading && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-800">
                    <strong>Sedang memproses...</strong> {isLogin ? 'Melakukan login...' : 'Membuat akun dan profil peserta...'}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading 
                  ? (isLogin ? 'Logging in...' : 'Creating Account...') 
                  : isLogin 
                    ? 'Masuk' 
                    : 'Daftar sebagai Peserta'
                }
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setShowEmailConfirmation(false);
                  }}
                  className="text-blue-600 text-sm sm:text-base"
                  disabled={loading}
                >
                  {isLogin 
                    ? 'Belum punya akun? Daftar di sini' 
                    : 'Sudah punya akun? Masuk di sini'
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
