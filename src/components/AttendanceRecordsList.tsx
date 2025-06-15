
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceRecord } from '@/utils/attendanceUtils';

interface AttendanceRecordsListProps {
  records: AttendanceRecord[];
}

export default function AttendanceRecordsList({ records }: AttendanceRecordsListProps) {
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

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Tidak ada riwayat kehadiran ditemukan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
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
      ))}
    </div>
  );
}
