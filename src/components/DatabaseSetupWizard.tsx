
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, FileText, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DATABASE_SCHEMA_SQL = `-- Kajian Attendance System Database Schema
-- Run this SQL script in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'participant'::text,
  participant_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  qr_code text,
  is_blacklisted boolean NOT NULL DEFAULT false,
  blacklist_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create kajian_sessions table
CREATE TABLE IF NOT EXISTS public.kajian_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  max_participants integer,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL,
  session_id uuid NOT NULL,
  check_in_time timestamp with time zone NOT NULL DEFAULT now(),
  check_out_time timestamp with time zone,
  status text NOT NULL DEFAULT 'present'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create participant_invitations table
CREATE TABLE IF NOT EXISTS public.participant_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  token text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + '24:00:00'::interval),
  used boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kajian_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Basic - Admin can manage everything)
CREATE POLICY "Enable all access for authenticated users" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.participants FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.kajian_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.attendance FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON public.participant_invitations FOR ALL USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'participant');
  RETURN NEW;
END;
$function$;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default admin user (update email as needed)
-- INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, role) 
-- VALUES ('admin@example.com', crypt('defaultpassword', gen_salt('bf')), now(), 'authenticated');`;

interface DatabaseSetupWizardProps {
  onClose: () => void;
}

export function DatabaseSetupWizard({ onClose }: DatabaseSetupWizardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(DATABASE_SCHEMA_SQL);
      setCopied(true);
      toast({
        title: "Berhasil",
        description: "SQL script berhasil disalin ke clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyalin ke clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Setup Database Schema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Langkah 1: Buat project Supabase baru di <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a>
            </AlertDescription>
          </Alert>
          
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Langkah 2: Buka SQL Editor di dashboard Supabase Anda dan jalankan script berikut:
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Database Schema SQL:</label>
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'Disalin!' : 'Salin'}</span>
              </Button>
            </div>
            <Textarea
              value={DATABASE_SCHEMA_SQL}
              readOnly
              className="font-mono text-xs h-64 resize-none"
            />
          </div>

          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Langkah 3: Setelah menjalankan SQL script, kembali ke halaman pengaturan dan masukkan Supabase URL dan Anon Key Anda.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Tutup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
