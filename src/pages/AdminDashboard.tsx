
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

type KajianSession = Tables<'kajian_sessions'>;

export default function AdminDashboard() {
  const { profile, loading } = useAuth();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalParticipants: 0,
    todayAttendance: 0,
    blacklistedCount: 0,
  });
  const [recentSessions, setRecentSessions] = useState<KajianSession[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [profile, loading]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching admin dashboard data...');
      
      const [sessionsResult, participantsResult, attendanceResult, blacklistResult] = await Promise.all([
        supabase.from('kajian_sessions').select('id'),
        supabase.from('participants').select('id'),
        supabase.from('attendance').select('id').eq('check_in_time', new Date().toISOString().split('T')[0]),
        supabase.from('participants').select('id').eq('is_blacklisted', true),
      ]);

      console.log('Admin stats results:', {
        sessions: sessionsResult.data?.length,
        participants: participantsResult.data?.length,
        attendance: attendanceResult.data?.length,
        blacklisted: blacklistResult.data?.length
      });

      setStats({
        totalSessions: sessionsResult.data?.length || 0,
        totalParticipants: participantsResult.data?.length || 0,
        todayAttendance: attendanceResult.data?.length || 0,
        blacklistedCount: blacklistResult.data?.length || 0,
      });

      // Fetch recent sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('kajian_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      } else {
        setRecentSessions(sessions || []);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-center sm:text-left">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-center sm:text-left">{statsLoading ? '...' : value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Administrator</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Selamat datang, Admin {profile?.email || 'User'}
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            Administrator
          </span>
        </p>
      </div>

      {/* Profile Display */}
      <ProfileDisplay />

      {/* Admin Stats - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Sesi"
          value={stats.totalSessions}
          icon={Calendar}
          color="text-blue-600"
        />
        <StatCard
          title="Total Peserta"
          value={stats.totalParticipants}
          icon={Users}
          color="text-green-600"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={stats.todayAttendance}
          icon={CheckCircle}
          color="text-purple-600"
        />
        <StatCard
          title="Diblokir"
          value={stats.blacklistedCount}
          icon={XCircle}
          color="text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sesi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-center sm:text-left">Belum ada sesi kajian</p>
          ) : (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border rounded-lg space-y-2 sm:space-y-0">
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-sm sm:text-base">{session.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{session.date} | {session.start_time} - {session.end_time}</p>
                    {session.location && <p className="text-xs sm:text-sm text-gray-500">{session.location}</p>}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs sm:text-sm text-center sm:text-left ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {session.is_active ? 'Aktif' : 'Tidak Aktif'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions - Responsive Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium text-sm sm:text-base">Kelola Sesi</h3>
                <p className="text-xs sm:text-sm text-gray-600">Buat dan atur sesi kajian</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium text-sm sm:text-base">Kelola Peserta</h3>
                <p className="text-xs sm:text-sm text-gray-600">Lihat dan atur peserta</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6 text-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-medium text-sm sm:text-base">Scan QR</h3>
                <p className="text-xs sm:text-sm text-gray-600">Scan QR code peserta</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
