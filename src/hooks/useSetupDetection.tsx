
import { useState, useEffect } from 'react';
import { dynamicSupabase } from '@/integrations/supabase/dynamic-client';

export function useSetupDetection() {
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        // First check if Supabase is configured
        if (!dynamicSupabase.isConfigured()) {
          setNeedsSetup(true);
          setLoading(false);
          return;
        }

        // Then check if any admin profiles exist
        const client = dynamicSupabase.getClient();
        const { data, error } = await client
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1);

        if (error) {
          // If there's an error (like table doesn't exist), setup is needed
          console.log('Setup detection error (setup needed):', error);
          setNeedsSetup(true);
        } else {
          // Setup is needed if no admin profiles exist
          setNeedsSetup(!data || data.length === 0);
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
        setNeedsSetup(true);
      } finally {
        setLoading(false);
      }
    };

    checkSetupStatus();
  }, []);

  const markSetupComplete = () => {
    setNeedsSetup(false);
  };

  return { needsSetup, loading, error, markSetupComplete };
}
