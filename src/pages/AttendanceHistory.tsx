
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AttendanceFilters from '@/components/AttendanceFilters';
import AttendanceStatistics from '@/components/AttendanceStatistics';
import AttendanceRecordsList from '@/components/AttendanceRecordsList';
import { 
  AttendanceRecord, 
  filterAttendanceRecords, 
  exportAttendanceToCSV 
} from '@/utils/attendanceUtils';

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

  const filteredRecords = filterAttendanceRecords(attendanceRecords, searchTerm, selectedMonth);

  const handleExportCSV = () => {
    exportAttendanceToCSV(filteredRecords);
  };

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
            ? 'Lihat riwayat kehadiran semua peserta untuk evaluasi' 
            : 'Lihat riwayat kehadiran Anda'
          }
        </p>
      </div>

      <AttendanceFilters
        searchTerm={searchTerm}
        selectedMonth={selectedMonth}
        filteredRecordsCount={filteredRecords.length}
        onSearchChange={setSearchTerm}
        onMonthChange={setSelectedMonth}
        onExportCSV={handleExportCSV}
      />

      <AttendanceStatistics
        filteredRecords={filteredRecords}
        totalSessions={totalSessions}
      />

      <AttendanceRecordsList records={filteredRecords} />
    </div>
  );
}
