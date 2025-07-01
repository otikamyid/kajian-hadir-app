
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SupabaseConfigPanel } from './SupabaseConfigPanel';
import { Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ADMIN_PASSWORD = 'DATABASEMANDIRIKAJIAN';

export function ProtectedSupabaseConfig() {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        setIsUnlocked(true);
        toast({
          title: "Berhasil",
          description: "Akses konfigurasi database dibuka",
        });
      } else {
        toast({
          title: "Error",
          description: "Password salah",
          variant: "destructive",
        });
      }
      setIsChecking(false);
    }, 500);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPassword('');
    toast({
      title: "Terkunci",
      description: "Konfigurasi database dikunci kembali",
    });
  };

  if (isUnlocked) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Konfigurasi Database (Unlocked)</h3>
          <Button
            onClick={handleLock}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Lock className="h-4 w-4" />
            <span>Kunci</span>
          </Button>
        </div>
        <SupabaseConfigPanel />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="h-5 w-5" />
          <span>Konfigurasi Database Terlindungi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Unlock className="h-4 w-4" />
          <AlertDescription>
            Masukkan password untuk mengakses konfigurasi database Supabase.
          </AlertDescription>
        </Alert>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password Admin</Label>
            <Input
              id="admin-password"
              type="password"
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isChecking || !password}
            className="w-full"
          >
            {isChecking ? 'Memeriksa...' : 'Buka Konfigurasi'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
