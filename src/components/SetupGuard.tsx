
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetupDetection } from '@/hooks/useSetupDetection';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SetupGuardProps {
  children: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const { needsSetup, loading } = useSetupDetection();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && needsSetup && location.pathname !== '/setup') {
      console.log('Setup needed, redirecting to setup page');
      navigate('/setup', { replace: true });
    }
  }, [needsSetup, loading, navigate, location.pathname]);

  // Show loading while checking setup status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Memeriksa Sistem...
            </h3>
            <p className="text-gray-600 text-center">
              Sedang memeriksa status konfigurasi sistem
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If setup is needed, the useEffect will redirect to /setup
  // If we're here, setup is complete or we're on the setup page
  return <>{children}</>;
}
