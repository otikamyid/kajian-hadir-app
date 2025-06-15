
import { format } from 'date-fns';

export interface AttendanceRecord {
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

export const filterAttendanceRecords = (
  records: AttendanceRecord[],
  searchTerm: string,
  selectedMonth: string
) => {
  return records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.participants.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.kajian_sessions.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.participants.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMonth = !selectedMonth || 
      record.kajian_sessions.date.startsWith(selectedMonth);
    
    return matchesSearch && matchesMonth;
  });
};

export const exportAttendanceToCSV = (records: AttendanceRecord[]) => {
  const csvData = records.map(record => ({
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
