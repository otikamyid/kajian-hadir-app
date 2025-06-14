
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, UserX, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  participant_id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  notes: string | null;
  participants: {
    name: string;
    email: string;
    phone: string | null;
  };
}

interface SessionAttendanceMonitorProps {
  sessionId: string;
  sessionTitle: string;
  onClose: () => void;
}

export function SessionAttendanceMonitor({ sessionId, sessionTitle, onClose }: SessionAttendanceMonitorProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttendanceRecords();
  }, [sessionId]);

  const fetchAttendanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          participants (name, email, phone)
        `)
        .eq('session_id', sessionId)
        .order('check_in_time', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: `Gagal memuat data kehadiran: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Hadir</Badge>;
      case 'late':
        return <Badge variant="destructive">Terlambat</Badge>;
      case 'absent':
        return <Badge variant="outline">Tidak Hadir</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Memuat data kehadiran...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalAttendees = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const lateCount = attendanceRecords.filter(r => r.status === 'late').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Monitoring Kehadiran</h2>
          <p className="text-gray-600">{sessionTitle}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <Eye className="h-4 w-4 mr-2" />
          Kembali ke Sessions
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{totalAttendees}</div>
            <div className="text-sm text-gray-600">Total Peserta</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">{presentCount}</div>
            <div className="text-sm text-gray-600">Hadir</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">{lateCount}</div>
            <div className="text-sm text-gray-600">Terlambat</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserX className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold">{absentCount}</div>
            <div className="text-sm text-gray-600">Tidak Hadir</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kehadiran</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Belum ada peserta yang check-in</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{record.participants.name}</div>
                    <div className="text-sm text-gray-600">{record.participants.email}</div>
                    <div className="text-sm text-gray-500">
                      Check-in: {format(new Date(record.check_in_time), 'dd/MM/yyyy HH:mm')}
                    </div>
                    {record.check_out_time && (
                      <div className="text-sm text-gray-500">
                        Check-out: {format(new Date(record.check_out_time), 'dd/MM/yyyy HH:mm')}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(record.status)}
                    {record.notes && (
                      <div className="text-sm text-gray-600 mt-1">{record.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
