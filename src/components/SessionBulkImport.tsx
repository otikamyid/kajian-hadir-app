
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SessionImportData {
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  location?: string;
  max_participants?: number;
}

interface SessionBulkImportProps {
  onImportComplete: () => void;
  onCancel: () => void;
}

export function SessionBulkImport({ onImportComplete, onCancel }: SessionBulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<SessionImportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const templateData = [
      {
        'Judul Session': 'Kajian Mingguan',
        'Deskripsi': 'Kajian rutin mingguan',
        'Tanggal (YYYY-MM-DD)': '2024-01-15',
        'Waktu Mulai (HH:MM)': '19:00',
        'Waktu Selesai (HH:MM)': '21:00',
        'Lokasi': 'Masjid Al-Ikhlas',
        'Maks Peserta': 50
      },
      {
        'Judul Session': 'Kajian Bulanan',
        'Deskripsi': 'Kajian bulanan khusus',
        'Tanggal (YYYY-MM-DD)': '2024-01-30',
        'Waktu Mulai (HH:MM)': '20:00',
        'Waktu Selesai (HH:MM)': '22:00',
        'Lokasi': 'Aula Masjid',
        'Maks Peserta': 100
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    const wscols = [
      { wch: 20 }, // Judul Session
      { wch: 25 }, // Deskripsi
      { wch: 18 }, // Tanggal
      { wch: 15 }, // Waktu Mulai
      { wch: 15 }, // Waktu Selesai
      { wch: 20 }, // Lokasi
      { wch: 12 }  // Maks Peserta
    ];
    ws['!cols'] = wscols;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Session');
    XLSX.writeFile(wb, 'template_session_kajian.xlsx');

    toast({
      title: "Template Downloaded",
      description: "Template Excel berhasil didownload",
    });
  };

  // Helper function to convert Excel date serial number to date string
  const convertExcelDate = (excelDate: any): string => {
    if (typeof excelDate === 'string') {
      // If it's already a string, check if it's a valid date format
      if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
        return excelDate;
      }
    }
    
    if (typeof excelDate === 'number') {
      // Excel stores dates as serial numbers starting from 1900-01-01
      const excelEpoch = new Date(1900, 0, 1);
      const date = new Date(excelEpoch.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    }
    
    return '';
  };

  // Helper function to convert Excel time to HH:MM format
  const convertExcelTime = (excelTime: any): string => {
    if (typeof excelTime === 'string') {
      // If it's already a string, check if it's a valid time format
      if (/^\d{1,2}:\d{2}$/.test(excelTime)) {
        return excelTime;
      }
    }
    
    if (typeof excelTime === 'number') {
      // Excel stores time as fraction of a day (0.5 = 12:00)
      const totalMinutes = Math.round(excelTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    return '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      parseExcelFile(selectedFile);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Raw Excel data:', jsonData);

        const parsedData: SessionImportData[] = jsonData.map((row: any, index: number) => {
          console.log(`Processing row ${index + 1}:`, row);
          
          const processedRow = {
            title: row['Judul Session'] || '',
            description: row['Deskripsi'] || '',
            date: convertExcelDate(row['Tanggal (YYYY-MM-DD)']),
            start_time: convertExcelTime(row['Waktu Mulai (HH:MM)']),
            end_time: convertExcelTime(row['Waktu Selesai (HH:MM)']),
            location: row['Lokasi'] || '',
            max_participants: row['Maks Peserta'] ? parseInt(row['Maks Peserta'].toString()) : undefined
          };
          
          console.log(`Processed row ${index + 1}:`, processedRow);
          return processedRow;
        });

        setPreviewData(parsedData);
        
        // Validate data immediately after parsing
        const errors = validateData(parsedData);
        setValidationErrors(errors);
        
        toast({
          title: "File Parsed",
          description: `${parsedData.length} session ditemukan dalam file`,
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast({
          title: "Error",
          description: "Gagal membaca file Excel. Pastikan format sesuai template.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const validateData = (data: SessionImportData[]): string[] => {
    const errors: string[] = [];
    
    data.forEach((session, index) => {
      const rowNum = index + 2; // +2 because Excel starts from row 1 and we have header
      
      if (!session.title) {
        errors.push(`Baris ${rowNum}: Judul session wajib diisi`);
      }
      if (!session.date) {
        errors.push(`Baris ${rowNum}: Tanggal wajib diisi`);
      }
      if (!session.start_time) {
        errors.push(`Baris ${rowNum}: Waktu mulai wajib diisi`);
      }
      if (!session.end_time) {
        errors.push(`Baris ${rowNum}: Waktu selesai wajib diisi`);
      }
      
      // Validate date format
      if (session.date && !/^\d{4}-\d{2}-\d{2}$/.test(session.date)) {
        errors.push(`Baris ${rowNum}: Format tanggal tidak valid (${session.date}). Gunakan format YYYY-MM-DD`);
      }
      
      // Validate time format
      if (session.start_time && !/^\d{1,2}:\d{2}$/.test(session.start_time)) {
        errors.push(`Baris ${rowNum}: Format waktu mulai tidak valid (${session.start_time}). Gunakan format HH:MM`);
      }
      if (session.end_time && !/^\d{1,2}:\d{2}$/.test(session.end_time)) {
        errors.push(`Baris ${rowNum}: Format waktu selesai tidak valid (${session.end_time}). Gunakan format HH:MM`);
      }
      
      // Validate time logic
      if (session.start_time && session.end_time) {
        const startTime = new Date(`2000-01-01 ${session.start_time}`);
        const endTime = new Date(`2000-01-01 ${session.end_time}`);
        if (startTime >= endTime) {
          errors.push(`Baris ${rowNum}: Waktu mulai harus lebih awal dari waktu selesai`);
        }
      }
      
      // Validate date is not in the past
      if (session.date) {
        const sessionDate = new Date(session.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (sessionDate < today) {
          errors.push(`Baris ${rowNum}: Tanggal tidak boleh di masa lalu`);
        }
      }
    });

    return errors;
  };

  const handleImport = async () => {
    console.log('Starting import process...');
    console.log('Preview data:', previewData);
    console.log('Validation errors:', validationErrors);

    if (previewData.length === 0) {
      toast({
        title: "Error",
        description: "Tidak ada data untuk diimport",
        variant: "destructive",
      });
      return;
    }

    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: `${validationErrors.length} error ditemukan. Silakan perbaiki file Excel.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Inserting data to database:', previewData);
      
      const { data, error } = await supabase
        .from('kajian_sessions')
        .insert(previewData)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Import successful:', data);

      toast({
        title: "Berhasil",
        description: `${previewData.length} session berhasil diimport`,
      });

      onImportComplete();
    } catch (error: any) {
      console.error('Error importing sessions:', error);
      toast({
        title: "Error",
        description: `Gagal mengimport session: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSpreadsheet className="h-5 w-5" />
          <span>Import Session Bulk</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Download Template Section */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">1. Download Template Excel</h3>
          <p className="text-sm text-gray-600 mb-3">
            Download template Excel untuk memastikan format data yang benar
          </p>
          <Button onClick={downloadTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        {/* Upload File Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">2. Upload File Excel</h3>
          <div className="space-y-2">
            <Label htmlFor="excel-file">Pilih File Excel</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {file && (
              <p className="text-sm text-green-600">
                File selected: {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-red-800">Error Validasi:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview Data Section */}
        {previewData.length > 0 && (
          <div className={`p-4 rounded-lg ${validationErrors.length > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <h3 className="font-medium mb-2">3. Preview Data</h3>
            <div className="text-sm text-gray-600 mb-3">
              {previewData.length} session ditemukan dalam file
            </div>
            <div className="max-h-60 overflow-y-auto border rounded bg-white">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Judul</th>
                    <th className="p-2 text-left">Tanggal</th>
                    <th className="p-2 text-left">Waktu</th>
                    <th className="p-2 text-left">Lokasi</th>
                    <th className="p-2 text-left">Max Peserta</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((session, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{session.title}</td>
                      <td className="p-2">{session.date}</td>
                      <td className="p-2">{session.start_time} - {session.end_time}</td>
                      <td className="p-2">{session.location}</td>
                      <td className="p-2">{session.max_participants || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={handleImport} 
            disabled={loading || previewData.length === 0 || validationErrors.length > 0}
            className="flex-1"
          >
            {loading ? 'Mengimport...' : `Import ${previewData.length} Session`}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Batal
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Petunjuk:</p>
              <ul className="text-yellow-700 mt-1 space-y-1">
                <li>• Download template Excel terlebih dahulu</li>
                <li>• Isi data session sesuai format yang ada</li>
                <li>• Format tanggal: YYYY-MM-DD (contoh: 2024-01-15)</li>
                <li>• Format waktu: HH:MM (contoh: 19:00)</li>
                <li>• Jangan mengubah nama kolom di header</li>
                <li>• Kolom wajib: Judul Session, Tanggal, Waktu Mulai, Waktu Selesai</li>
                <li>• Pastikan tanggal tidak di masa lalu</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
