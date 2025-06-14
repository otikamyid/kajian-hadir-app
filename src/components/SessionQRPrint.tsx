
import { QRCodeGenerator } from './QRCodeGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Download } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type KajianSession = Tables<'kajian_sessions'>;

interface SessionQRPrintProps {
  session: KajianSession;
  onClose: () => void;
}

export function SessionQRPrint({ session, onClose }: SessionQRPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a canvas to generate downloadable QR code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(session.id)}&size=300x300`;
    
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR-${session.title.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Cetak QR Code Session</h2>
        <Button variant="outline" onClick={onClose}>
          Kembali
        </Button>
      </div>

      <div className="print-area">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{session.title}</CardTitle>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{session.date}</p>
              <p>{session.start_time} - {session.end_time}</p>
              {session.location && <p>{session.location}</p>}
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <QRCodeGenerator 
              value={session.id} 
              title="Scan untuk Check-in"
              size={250}
            />
            <p className="text-xs text-gray-500 mt-4">
              Peserta dapat scan QR code ini untuk check-in otomatis
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center space-x-4 no-print">
        <Button onClick={handlePrint} className="flex items-center space-x-2">
          <Printer className="h-4 w-4" />
          <span>Cetak</span>
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Download QR</span>
        </Button>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-area {
            margin: 0;
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
