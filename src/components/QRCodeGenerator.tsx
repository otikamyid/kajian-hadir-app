
interface QRCodeGeneratorProps {
  value: string;
  title?: string;
  size?: number;
}

export function QRCodeGenerator({ value, title, size = 200 }: QRCodeGeneratorProps) {
  // Encode the value for URL
  const encodedValue = encodeURIComponent(value);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodedValue}&size=${size}x${size}`;

  return (
    <div className="flex flex-col items-center space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-center">{title}</h3>
      )}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <img 
          src={qrUrl} 
          alt={`QR Code: ${value}`}
          className="mx-auto"
          width={size}
          height={size}
        />
      </div>
      <p className="text-xs text-gray-500 text-center max-w-xs break-all">
        Data: {value}
      </p>
    </div>
  );
}
