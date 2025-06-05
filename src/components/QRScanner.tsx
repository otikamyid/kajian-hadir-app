
import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  isScanning: boolean;
  onToggleScanning: () => void;
}

export function QRScanner({ onScan, isScanning, onToggleScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasCamera, setHasCamera] = useState(true);

  useEffect(() => {
    if (!videoRef.current) return;

    scannerRef.current = new QrScanner(
      videoRef.current,
      (result) => {
        onScan(result.data);
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    QrScanner.hasCamera().then(setHasCamera);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, [onScan]);

  useEffect(() => {
    if (!scannerRef.current) return;

    if (isScanning && hasCamera) {
      scannerRef.current.start();
    } else {
      scannerRef.current.stop();
    }
  }, [isScanning, hasCamera]);

  if (!hasCamera) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No camera available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          QR Code Scanner
          <Button
            onClick={onToggleScanning}
            variant={isScanning ? "destructive" : "default"}
            size="sm"
          >
            {isScanning ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover rounded-md bg-gray-100"
          />
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
              <p className="text-gray-500">Camera stopped</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
