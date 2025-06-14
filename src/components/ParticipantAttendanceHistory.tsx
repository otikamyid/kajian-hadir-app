
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ParticipantAttendanceRecord {
  id: string;
  session_id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  notes: string | null;
  kajian_sessions: {
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string | null;
  };
}

interface ParticipantData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface ParticipantAttendanceHistoryProps {
  participantId: string;
  onBack: () => void;
}

export function ParticipantAttendanceHistory({ participantId, onBack }: ParticipantAttendanceHistoryProps) {
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<ParticipantAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchParticipantData();
    fetchAttendanceHistory();
  }, [participantId]);

  const fetchParticipantData = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (error) throw error;
      setParticipant(data);
    } catch (error: any) {
      console.error('Error fetching participant:', error);
      toast({
        title: "Error",
        description: `Gagal memuat data peserta: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          kajian_sessions (title, date, start_time, end_time, location)
        `)
        .eq('participant_id', participantId)
        .order('check_in_time', { ascending: false });

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching attendance history:', error);
      toast({
        title: "Error",
        description: `Gagal memuat riwayat kehadiran: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record =>
    !searchTerm || 
    record.kajian_sessions.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.kajian_sessions.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const totalSessions = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status === 'present').length;
  const lateCount = filteredRecords.filter(r => r.status === 'late').length;
  const attendanceRate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat riwayat kehadiran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Riwayat Kehadiran Peserta</h2>
          {participant && (
            <div className="text-gray-600">
              <p>{participant.name}</p>
              <p className="text-sm">{participant.email}</p>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{totalSessions}</div>
            <div className="text-sm text-gray-600">Total Session</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">{presentCount}</div>
            <div className="text-sm text-gray-600">Hadir Tepat Waktu</div>
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
            {attendanceRate >= 80 ? (
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
            ) : (
              <TrendingDown className="h-8 w-8 mx-auto text-red-600 mb-2" />
            )}
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <div className="text-sm text-gray-600">Tingkat Kehadiran</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Cari session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Tidak ada session yang ditemukan' : 'Belum ada riwayat kehadiran'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div>
                    <p className="font-medium">{record.kajian_sessions.title}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(record.kajian_sessions.date), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {record.kajian_sessions.start_time} - {record.kajian_sessions.end_time}
                    </p>
                    {record.kajian_sessions.location && (
                      <p className="text-sm text-gray-600">{record.kajian_sessions.location}</p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Check-in:</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(record.check_in_time), 'dd/MM/yyyy HH:mm')}
                    </p>
                    {record.check_out_time && (
                      <>
                        <p className="text-sm font-medium mt-2">Check-out:</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(record.check_out_time), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </>
                    )}
                  </div>
                  
                  <div className="text-right">
                    {getStatusBadge(record.status)}
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
