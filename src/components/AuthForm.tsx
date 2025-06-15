
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { usePerformance } from '@/hooks/usePerformance';
import { Calendar, ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signInSchema, signUpSchema } from '@/lib/validations';
import { logger } from '@/utils/logger';
import { authRateLimiter, sanitizeInput } from '@/utils/security';

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
  const { measureAsync } = usePerformance();

  // Form validation
  const signInValidation = useFormValidation(signInSchema);
  const signUpValidation = useFormValidation(signUpSchema);
  const currentValidation = isLogin ? signInValidation : signUpValidation;

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
    
    // Rate limiting check
    const userIdentifier = email || 'unknown';
    if (!authRateLimiter.isAllowed(userIdentifier)) {
      toast({
        title: "Terlalu Banyak Percobaan",
        description: "Silakan tunggu 15 menit sebelum mencoba lagi.",
        variant: "destructive",
      });
      logger.warn('Auth rate limit exceeded', { email: userIdentifier });
      return;
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    const sanitizedPhone = sanitizeInput(phone);

    // Validate form data
    const formData = isLogin 
      ? { email: sanitizedEmail, password }
      : { email: sanitizedEmail, password, name: sanitizedName, phone: sanitizedPhone };

    if (!currentValidation.validate(formData)) {
      toast({
        title: "Error Validasi",
        description: "Silakan periksa data yang Anda masukkan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    logger.info(`Starting ${isLogin ? 'login' : 'registration'} process`, { 
      email: sanitizedEmail,
      action: isLogin ? 'login' : 'register'
    });

    try {
      if (isLogin) {
        const result = await measureAsync('participant-login', async () => {
          return await signIn(sanitizedEmail, password);
        });

        if (result.error) {
          logger.logAuth('login', false, { 
            email: sanitizedEmail, 
            error: result.error.message 
          });
          toast({
            title: "Gagal Masuk",
            description: getErrorMessage(result.error),
            variant: "destructive",
          });
        } else {
          logger.logAuth('login', true, { email: sanitizedEmail });
          toast({
            title: "Berhasil",
            description: "Login berhasil! Selamat datang di Kajian Hadir.",
          });
          
          setTimeout(() => {
            navigate('/participant/dashboard');
          }, 1000);
        }
      } else {
        const result = await measureAsync('participant-registration', async () => {
          logger.info('Starting participant registration', { 
            email: sanitizedEmail, 
            name: sanitizedName, 
            phone: sanitizedPhone 
          });
          
          const { error: signUpError, user } = await signUp(sanitizedEmail, password);
          if (signUpError) {
            throw signUpError;
          }

          if (!user) {
            throw new Error('Failed to create user account');
          }

          logger.info('User signup successful', { userId: user.id, email: sanitizedEmail });
          
          // Show email confirmation message
          setShowEmailConfirmation(true);
          
          toast({
            title: "Pendaftaran Berhasil!",
            description: "Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi.",
          });

          // Create participant profile
          const profileResult = await createParticipantProfile(
            user.id, 
            sanitizedEmail, 
            sanitizedName, 
            sanitizedPhone
          );
          
          if (profileResult.error) {
            logger.error('Failed to create participant profile', {
              userId: user.id,
              error: profileResult.error.message
            });
            throw new Error(profileResult.error.message || 'Failed to create participant profile');
          }

          logger.info('Participant profile created successfully', {
            userId: user.id,
            participantId: profileResult.participant?.id
          });

          setTimeout(() => {
            toast({
              title: "Profil Tersimpan",
              description: "Profil peserta berhasil dibuat. Anda dapat login setelah mengkonfirmasi email.",
            });
          }, 2000);

          return { user, profile: profileResult };
        });

        logger.logAuth('registration', true, { 
          email: sanitizedEmail,
          userId: result.user.id
        });

      }
    } catch (error: any) {
      logger.logAuth(isLogin ? 'login' : 'registration', false, { 
        email: sanitizedEmail, 
        error: error.message 
      });
      
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: getErrorMessage(error),
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
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={currentValidation.getError('name') ? 'border-red-500' : ''}
                    required
                  />
                  {currentValidation.getError('name') && (
                    <p className="text-sm text-red-600">{currentValidation.getError('name')}</p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={currentValidation.getError('email') ? 'border-red-500' : ''}
                  required
                />
                {currentValidation.getError('email') && (
                  <p className="text-sm text-red-600">{currentValidation.getError('email')}</p>
                )}
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
                    className={currentValidation.getError('phone') ? 'border-red-500' : ''}
                    required
                  />
                  {currentValidation.getError('phone') && (
                    <p className="text-sm text-red-600">{currentValidation.getError('phone')}</p>
                  )}
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
                  className={currentValidation.getError('password') ? 'border-red-500' : ''}
                  required
                />
                {currentValidation.getError('password') && (
                  <p className="text-sm text-red-600">{currentValidation.getError('password')}</p>
                )}
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
                    currentValidation.clearErrors();
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
