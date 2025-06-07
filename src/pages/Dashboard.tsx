
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { ProfileDisplay } from '@/components/ProfileDisplay';
import { Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

type KajianSession = Tables<'kajian_sessions'>;

export default function Dashboard() {
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
    if (!loading && profile) {
      console.log('Profile loaded in dashboard:', profile);
      fetchDashboardData();
    }
  }, [profile, loading]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data for role:', profile?.role);
      
      // Fetch statistics - only for admin
      if (profile?.role === 'admin') {
        console.log('Fetching admin statistics...');
        
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
          console.log('Recent sessions:', sessions);
          setRecentSessions(sessions || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{statsLoading ? '...' : value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang, {profile?.email} 
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            {profile?.role === 'admin' ? 'Administrator' : 'Peserta'}
          </span>
        </p>
      </div>

      {/* Profile Display */}
      <ProfileDisplay />

      {/* Admin Stats - Only show for admin */}
      {profile?.role === 'admin' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardTitle>Sesi Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <p className="text-gray-500">Belum ada sesi kajian</p>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{session.title}</h3>
                        <p className="text-sm text-gray-600">{session.date} | {session.start_time} - {session.end_time}</p>
                        {session.location && <p className="text-sm text-gray-500">{session.location}</p>}
                      </div>
                      <div className={`px-2 py-1 rounded text-sm ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {session.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Participant specific content */}
      {profile?.role === 'participant' && (
        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang Peserta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Anda terdaftar sebagai peserta kajian. Gunakan menu QR Code untuk melihat 
              QR code Anda dan tunjukkan kepada admin saat check-in.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Fitur yang tersedia:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Lihat QR code Anda di menu "Scan QR"</li>
                <li>• Edit profil Anda dengan tombol "Edit" di atas</li>
                <li>• Tunjukkan QR code kepada admin saat check-in</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
