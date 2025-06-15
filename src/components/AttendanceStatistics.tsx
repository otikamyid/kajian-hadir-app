
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Calendar, Clock, History, BookOpen, UserX } from 'lucide-react';
import { AttendanceRecord } from '@/utils/attendanceUtils';

interface AttendanceStatisticsProps {
  filteredRecords: AttendanceRecord[];
  totalSessions: number;
}

export default function AttendanceStatistics({ filteredRecords, totalSessions }: AttendanceStatisticsProps) {
  const absentCount = totalSessions - new Set(filteredRecords.map(r => r.session_id)).size;

  return (
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
  );
}
