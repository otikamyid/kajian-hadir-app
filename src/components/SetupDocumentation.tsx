
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, ExternalLink, Github, Database } from 'lucide-react';

export function SetupDocumentation() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Panduan Setup Mandiri</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Github className="h-4 w-4" />
            <AlertDescription>
              Sistem Absensi Kajian adalah aplikasi open source yang dapat di-deploy secara mandiri dengan database Supabase Anda sendiri.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Langkah 1: Persiapan Supabase</h3>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Buat akun di <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></li>
                <li>Buat project baru di dashboard Supabase</li>
                <li>Catat Project URL dan Anon Key dari Settings → API</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Langkah 2: Setup Database</h3>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Buka SQL Editor di dashboard Supabase</li>
                <li>Gunakan fitur "Setup Database" di panel konfigurasi untuk mendapatkan SQL script</li>
                <li>Jalankan script tersebut untuk membuat semua tabel yang diperlukan</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Langkah 3: Konfigurasi Aplikasi</h3>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Masukkan Supabase URL dan Anon Key di panel konfigurasi</li>
                <li>Test koneksi untuk memastikan konfigurasi benar</li>
                <li>Simpan konfigurasi</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Langkah 4: Deploy Aplikasi</h3>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Deploy aplikasi ke platform pilihan (Netlify, Vercel, dll)</li>
                <li>Pastikan environment variables dikonfigurasi untuk production</li>
                <li>Update Site URL dan Redirect URLs di Supabase Auth settings</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Fitur Utama:</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Manajemen Peserta</Badge>
              <Badge variant="secondary">Sesi Kajian</Badge>
              <Badge variant="secondary">QR Code Check-in</Badge>
              <Badge variant="secondary">Laporan Kehadiran</Badge>
              <Badge variant="secondary">Bulk Import Excel</Badge>
              <Badge variant="secondary">Multi-role (Admin/Peserta)</Badge>
            </div>
          </div>

          <Alert>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Catatan Keamanan:</strong> Untuk production, pertimbangkan untuk menggunakan environment variables 
              alih-alih menyimpan konfigurasi di localStorage browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
