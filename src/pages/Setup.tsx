
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ProtectedSupabaseConfig } from '@/components/ProtectedSupabaseConfig';
import { DatabaseSetupWizard } from '@/components/DatabaseSetupWizard';
import { FirstAdminForm } from '@/components/FirstAdminForm';
import { useSetupDetection } from '@/hooks/useSetupDetection';
import { dynamicSupabase } from '@/integrations/supabase/dynamic-client';
import { Database, Settings, User, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type SetupStep = 'database' | 'schema' | 'admin' | 'complete';

export default function Setup() {
  const [currentStep, setCurrentStep] = useState<SetupStep>('database');
  const [showSchemaWizard, setShowSchemaWizard] = useState(false);
  const { markSetupComplete } = useSetupDetection();
  const navigate = useNavigate();

  const steps = [
    { id: 'database', title: 'Konfigurasi Database', icon: Database },
    { id: 'schema', title: 'Setup Schema', icon: Settings },
    { id: 'admin', title: 'Buat Admin Pertama', icon: User },
    { id: 'complete', title: 'Selesai', icon: CheckCircle }
  ];

  const handleDatabaseConfigured = () => {
    setCurrentStep('schema');
  };

  const handleSchemaSetup = () => {
    setCurrentStep('admin');
  };

  const handleAdminCreated = () => {
    setCurrentStep('complete');
    markSetupComplete();
    setTimeout(() => {
      navigate('/admin/dashboard');
    }, 2000);
  };

  const isStepCompleted = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    return stepIndex < currentIndex;
  };

  const isStepActive = (stepId: string) => stepId === currentStep;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Setup Hadir Kajian
            </h1>
            <p className="text-lg text-gray-600">
              Selamat datang! Mari setup sistem absensi kajian Anda
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isStepCompleted(step.id) 
                      ? 'bg-green-500 text-white' 
                      : isStepActive(step.id)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <div className={`text-sm font-medium ${
                      isStepCompleted(step.id) || isStepActive(step.id)
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isStepCompleted(step.id) ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 'database' && (
              <div>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Langkah 1:</strong> Konfigurasi koneksi ke database Supabase Anda. 
                    Jika belum punya project Supabase, buat dulu di <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a>
                  </AlertDescription>
                </Alert>
                <ProtectedSupabaseConfig />
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => {
                      if (dynamicSupabase.isConfigured()) {
                        handleDatabaseConfigured();
                      }
                    }}
                    disabled={!dynamicSupabase.isConfigured()}
                  >
                    Lanjut ke Setup Schema
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'schema' && (
              <div>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Langkah 2:</strong> Setup database schema yang diperlukan untuk sistem absensi kajian.
                  </AlertDescription>
                </Alert>
                {!showSchemaWizard ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Setup Database Schema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">
                        Sistem memerlukan beberapa tabel database untuk menyimpan data kajian, peserta, dan absensi.
                      </p>
                      <div className="flex space-x-4">
                        <Button onClick={() => setShowSchemaWizard(true)}>
                          Lihat SQL Script
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleSchemaSetup}
                        >
                          Skip (Sudah Setup Manual)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div>
                    <DatabaseSetupWizard onClose={() => setShowSchemaWizard(false)} />
                    <div className="mt-6 text-center">
                      <Button onClick={handleSchemaSetup}>
                        Lanjut ke Pembuatan Admin
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'admin' && (
              <div>
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Langkah 3:</strong> Buat akun admin pertama untuk mengelola sistem.
                  </AlertDescription>
                </Alert>
                <FirstAdminForm onSuccess={handleAdminCreated} />
              </div>
            )}

            {currentStep === 'complete' && (
              <Card>
                <CardHeader className="text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl text-green-600">Setup Berhasil!</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-gray-600">
                    Sistem Hadir Kajian telah berhasil dikonfigurasi. Anda akan diarahkan ke dashboard admin.
                  </p>
                  <Badge variant="secondary" className="text-green-600">
                    Mengarahkan ke dashboard...
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
