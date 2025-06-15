
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, Search, Calendar, Clock, Users, Download, BookOpen, UserX } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  participant_id: string;
  session_id: string;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  notes: string | null;
  participants: {
    name: string;
    email: string;
    phone: string | null;
  };
  kajian_sessions: {
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string | null;
  };
}

export default function AttendanceHistory() {
  const { profile } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (profile) {
      fetchAttendanceHistory();
      fetchTotalSessions();
    }
  }, [profile]);

  const fetchTotalSessions = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('kajian_sessions')
        .select('id')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching total sessions:', error);
      } else {
        setTotalSessions(data?.length || 0);
      }
    } catch (error) {
      console.error('Error in fetchTotalSessions:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!profile) {
      console.log('No profile available, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching attendance history for role:', profile?.role);
      
      let query = supabase
        .from('attendance')
        .select(`
          *,
          participants (name, email, phone),
          kajian_sessions (title, date, start_time, end_time, location)
        `)
        .order('check_in_time', { ascending: false });

      // Jika participant, hanya tampilkan data mereka sendiri
      if (profile?.role === 'participant' && profile.participant_id) {
        console.log('Filtering for participant:', profile.participant_id);
        query = query.eq('participant_id', profile.participant_id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching attendance history:', error);
        throw error;
      }
      
      console.log('Attendance history fetched successfully:', data?.length || 0, 'records');
      setAttendanceRecords(data || []);
    } catch (error: any) {
      console.error('Error in fetchAttendanceHistory:', error);
      toast({
        title: "Error",
        description: `Gagal memuat riwayat kehadiran: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = !searchTerm || 
      record.participants.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.kajian_sessions.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.participants.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = !selectedMonth || 
      record.kajian_sessions.date.startsWith(selectedMonth);
    
    return matchesSearch && matchesMonth;
  });

  const exportToCSV = () => {
    const csvData = filteredRecords.map(record => ({
      'Nama Peserta': record.participants.name,
      'Email': record.participants.email,
      'Session': record.kajian_sessions.title,
      'Tanggal': record.kajian_sessions.date,
      'Waktu Session': `${record.kajian_sessions.start_time} - ${record.kajian_sessions.end_time}`,
      'Check-in': format(new Date(record.check_in_time), 'dd/MM/yyyy HH:mm'),
      'Check-out': record.check_out_time ? format(new Date(record.check_out_time), 'dd/MM/yyyy HH:mm') : '-',
      'Status': record.status,
      'Lokasi': record.kajian_sessions.location || '-',
      'Catatan': record.notes || '-'
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(field => 
        typeof field === 'string' && field.includes(',') ? `"${field}"` : field
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `riwayat-kehadiran-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="secondary">Hadir</Badge>;
      case 'late':
        return <Badge variant="destructive">Terlambat</Badge>;
      case 'absent':
        return <Badge variant="outline">Tidak Hadir</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate statistics
  const absentCount = totalSessions - new Set(filteredRecords.map(r => r.session_id)).size;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Riwayat Kehadiran</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Riwayat Kehadiran</h1>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Riwayat Kehadiran</h1>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          {profile?.role === 'admin' 
            ? 'Lihat riwayat kehadiran semua peserta' 
            : 'Lihat riwayat kehadiran Anda'
          }
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Search className="h-5 w-5 mr-2" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cari Peserta/Session</label>
              <Input
                placeholder="Nama peserta, email, atau judul session"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filter Bulan</label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={exportToCSV} 
                disabled={filteredRecords.length === 0}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{filteredRecords.length}</div>
            <div className="text-sm text-gray-600">Total Kehadiran</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold">{totalSessions}</div>
            <div className="text-sm text-gray-600">Total Sesi Kajian</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold">
              {new Set(filteredRecords.map(r => r.session_id)).size}
            </div>
            <div className="text-sm text-gray-600">Session Dihadiri</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold">
              {filteredRecords.filter(r => r.status === 'present').length}
            </div>
            <div className="text-sm text-gray-600">Hadir Tepat Waktu</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <History className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold">
              {filteredRecords.filter(r => r.status === 'late').length}
            </div>
            <div className="text-sm text-gray-600">Terlambat</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserX className="h-8 w-8 mx-auto text-gray-600 mb-2" />
            <div className="text-2xl font-bold">{absentCount}</div>
            <div className="text-sm text-gray-600">Tidak Hadir</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Tidak ada riwayat kehadiran ditemukan</p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="font-medium">{record.participants.name}</p>
                    <p className="text-sm text-gray-600">{record.participants.email}</p>
                    {record.participants.phone && (
                      <p className="text-sm text-gray-600">{record.participants.phone}</p>
                    )}
                  </div>
                  
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
