
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRScanner } from '@/components/QRScanner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

export default function ScanQR() {
  const { profile } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const handleScan = async (sessionId: string) => {
    try {
      setLastScanResult(sessionId);
      
      // Verify the session exists and is active
      const { data: session, error: sessionError } = await supabase
        .from('kajian_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_active', true)
        .single();

      if (sessionError || !session) {
        setScanStatus('error');
        toast({
          title: "Error",
          description: "Invalid or inactive session QR code",
          variant: "destructive",
        });
        return;
      }

      // Get participant info from profile
      if (!profile?.participant_id) {
        setScanStatus('error');
        toast({
          title: "Error",
          description: "No participant profile found. Please contact admin.",
          variant: "destructive",
        });
        return;
      }

      // Check if participant is blacklisted
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', profile.participant_id)
        .single();

      if (participantError || !participant) {
        setScanStatus('error');
        toast({
          title: "Error",
          description: "Participant not found",
          variant: "destructive",
        });
        return;
      }

      if (participant.is_blacklisted) {
        setScanStatus('error');
        toast({
          title: "Access Denied",
          description: `You are blacklisted: ${participant.blacklist_reason}`,
          variant: "destructive",
        });
        return;
      }

      // Record attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .upsert({
          participant_id: profile.participant_id,
          session_id: sessionId,
          status: 'present',
        });

      if (attendanceError) {
        if (attendanceError.code === '23505') { // Unique constraint violation
          setScanStatus('error');
          toast({
            title: "Already Checked In",
            description: "You have already checked in for this session",
            variant: "destructive",
          });
        } else {
          throw attendanceError;
        }
        return;
      }

      setScanStatus('success');
      toast({
        title: "Success",
        description: `Checked in to ${session.title}`,
      });

    } catch (error) {
      console.error('Error processing scan:', error);
      setScanStatus('error');
      toast({
        title: "Error",
        description: "Failed to process attendance",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Scan QR Code</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QRScanner
          onScan={handleScan}
          isScanning={isScanning}
          onToggleScanning={() => setIsScanning(!isScanning)}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Scan Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastScanResult ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Last scanned session ID:</p>
                <p className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                  {lastScanResult}
                </p>
                
                {scanStatus && (
                  <div className={`flex items-center space-x-2 ${scanStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {scanStatus === 'success' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {scanStatus === 'success' ? 'Check-in successful!' : 'Check-in failed'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No QR code scanned yet</p>
            )}
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Click "Start" to begin scanning</li>
                <li>2. Point your camera at the session QR code</li>
                <li>3. Wait for automatic detection</li>
                <li>4. Your attendance will be recorded automatically</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
