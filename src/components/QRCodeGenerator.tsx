
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRCodeGeneratorProps {
  value: string;
  title?: string;
  size?: number;
}

export function QRCodeGenerator({ value, title, size = 200 }: QRCodeGeneratorProps) {
  return (
    <Card className="w-fit">
      <CardHeader>
        <CardTitle className="text-center">{title || 'QR Code'}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <QRCode value={value} size={size} />
      </CardContent>
    </Card>
  );
}
