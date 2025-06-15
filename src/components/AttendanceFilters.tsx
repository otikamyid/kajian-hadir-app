
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';

interface AttendanceFiltersProps {
  searchTerm: string;
  selectedMonth: string;
  filteredRecordsCount: number;
  onSearchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onExportCSV: () => void;
}

export default function AttendanceFilters({
  searchTerm,
  selectedMonth,
  filteredRecordsCount,
  onSearchChange,
  onMonthChange,
  onExportCSV
}: AttendanceFiltersProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Filter Bulan</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={onExportCSV} 
              disabled={filteredRecordsCount === 0}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
