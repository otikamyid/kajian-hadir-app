
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface FirstAdminFormProps {
  onSuccess: () => void;
}

export function FirstAdminForm({ onSuccess }: FirstAdminFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp, createAdminProfile } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('Semua field harus diisi');
      return false;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Step 1: Sign up the user
      console.log('Creating admin account...');
      const { error: signUpError, user } = await signUp(email, password);
      
      if (signUpError) {
        console.error('Sign up error:', signUpError);
        setError(`Gagal membuat akun: ${signUpError.message}`);
        return;
      }

      if (!user) {
        setError('Gagal membuat akun: User tidak terbuat');
        return;
      }

      console.log('User created, creating admin profile...');

      // Step 2: Create admin profile
      const { error: profileError } = await createAdminProfile(user.id, email);
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        setError(`Gagal membuat profil admin: ${profileError.message || 'Unknown error'}`);
        return;
      }

      toast({
        title: "Berhasil!",
        description: "Admin pertama berhasil dibuat",
      });

      console.log('Admin profile created successfully');
      onSuccess();

    } catch (error: any) {
      console.error('Unexpected error creating admin:', error);
      setError(`Terjadi kesalahan: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Buat Admin Pertama</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email Admin</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="admin-password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={loading}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Konfirmasi Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                disabled={loading}
                required
              />
            </div>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Penting:</strong> Simpan email dan password ini dengan aman. 
              Ini akan menjadi akun admin utama untuk sistem Anda.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Membuat Admin...' : 'Buat Admin Pertama'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
