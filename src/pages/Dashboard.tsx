
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Users, CheckCircle, XCircle } from 'lucide-react';

type KajianSession = Tables<'kajian_sessions'>;
type Attendance = Tables<'attendance'>;
type Participant = Tables<'participants'>;

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalParticipants: 0,
    todayAttendance: 0,
    blacklistedCount: 0,
  });
  const [recentSessions, setRecentSessions] = useState<KajianSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const [sessionsResult, participantsResult, attendanceResult, blacklistResult] = await Promise.all([
        supabase.from('kajian_sessions').select('id'),
        supabase.from('participants').select('id'),
        supabase.from('attendance').select('id').eq('check_in_time', new Date().toISOString().split('T')[0]),
        supabase.from('participants').select('id').eq('is_blacklisted', true),
      ]);

      setStats({
        totalSessions: sessionsResult.data?.length || 0,
        totalParticipants: participantsResult.data?.length || 0,
        todayAttendance: attendanceResult.data?.length || 0,
        blacklistedCount: blacklistResult.data?.length || 0,
      });

      // Fetch recent sessions
      const { data: sessions } = await supabase
        .from('kajian_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

      setRecentSessions(sessions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? '...' : value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {profile?.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={Calendar}
          color="text-blue-600"
        />
        <StatCard
          title="Total Participants"
          value={stats.totalParticipants}
          icon={Users}
          color="text-green-600"
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={CheckCircle}
          color="text-purple-600"
        />
        <StatCard
          title="Blacklisted"
          value={stats.blacklistedCount}
          icon={XCircle}
          color="text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500">No sessions found</p>
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
                    {session.is_active ? 'Active' : 'Inactive'}
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
