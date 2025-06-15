
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatabaseSetupWizard } from './DatabaseSetupWizard';
import { dynamicSupabase, SupabaseConfig } from '@/integrations/supabase/dynamic-client';
import { useToast } from '@/hooks/use-toast';
import { useFormValidation } from '@/hooks/useFormValidation';
import { supabaseConfigSchema } from '@/lib/validations';
import { secureStorage } from '@/utils/security';
import { Database, Settings, TestTube, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

export function SupabaseConfigPanel() {
  const [config, setConfig] = useState<SupabaseConfig>({ url: '', anonKey: '' });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const { toast } = useToast();
  const { validate, getError } = useFormValidation(supabaseConfigSchema);

  useEffect(() => {
    // Load saved configuration from secure storage
    const savedConfig = secureStorage.getItem('supabase_config');
    if (savedConfig) {
      try {
        setConfig(savedConfig);
        setConnectionStatus('success');
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    }
  }, []);

  const testConnection = async () => {
    if (!validate(config)) {
      toast({
        title: "Error",
        description: "Harap periksa URL dan Anon Key",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const isValid = await dynamicSupabase.testConnection(config);
      if (isValid) {
        setConnectionStatus('success');
        toast({
          title: "Berhasil",
          description: "Koneksi ke Supabase berhasil",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Error",
          description: "Gagal terhubung ke Supabase. Periksa URL dan Key Anda.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menguji koneksi",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!validate(config)) {
      toast({
        title: "Error",
        description: "Harap periksa semua field",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Test connection first
      const isValid = await dynamicSupabase.testConnection(config);
      if (!isValid) {
        toast({
          title: "Error",
          description: "Koneksi gagal. Periksa konfigurasi Anda.",
          variant: "destructive",
        });
        return;
      }

      // Save to secure storage
      secureStorage.setItem('supabase_config', config);
      
      // Initialize dynamic client
      dynamicSupabase.initialize(config);
      
      setConnectionStatus('success');
      toast({
        title: "Berhasil",
        description: "Konfigurasi Supabase berhasil disimpan",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan konfigurasi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetConfiguration = () => {
    secureStorage.removeItem('supabase_config');
    setConfig({ url: '', anonKey: '' });
    setConnectionStatus('idle');
    toast({
      title: "Berhasil",
      description: "Konfigurasi berhasil direset",
    });
  };

  if (showSetupWizard) {
    return <DatabaseSetupWizard onClose={() => setShowSetupWizard(false)} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Konfigurasi Database Supabase</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertDescription>
            Konfigurasi ini memungkinkan Anda menggunakan instance Supabase sendiri untuk database yang mandiri.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowSetupWizard(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Setup Database</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Status:</span>
            {connectionStatus === 'success' && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Terhubung</span>
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center space-x-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Error</span>
              </div>
            )}
            {connectionStatus === 'idle' && (
              <span className="text-sm text-gray-500">Belum dikonfigurasi</span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="supabase-url">Supabase Project URL</Label>
            <Input
              id="supabase-url"
              type="url"
              placeholder="https://yourproject.supabase.co"
              value={config.url}
              onChange={(e) => setConfig(prev => ({ ...prev, url: e.target.value }))}
              className={getError('url') ? 'border-red-500' : ''}
            />
            {getError('url') && (
              <p className="text-sm text-red-600">{getError('url')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supabase-key">Supabase Anon Key</Label>
            <Input
              id="supabase-key"
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={config.anonKey}
              onChange={(e) => setConfig(prev => ({ ...prev, anonKey: e.target.value }))}
              className={getError('anonKey') ? 'border-red-500' : ''}
            />
            {getError('anonKey') && (
              <p className="text-sm text-red-600">{getError('anonKey')}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            onClick={testConnection}
            disabled={testing}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>{testing ? 'Menguji...' : 'Test Koneksi'}</span>
          </Button>
          
          <Button
            onClick={saveConfiguration}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
          </Button>

          {connectionStatus !== 'idle' && (
            <Button
              onClick={resetConfiguration}
              variant="destructive"
              size="sm"
            >
              Reset
            </Button>
          )}
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Catatan:</strong> Konfigurasi ini disimpan secara terenkripsi di browser. 
            Untuk deployment production, pertimbangkan menggunakan environment variables.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
