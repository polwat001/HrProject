'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations'; 
import { Calendar, Loader, XCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ATTENDANCE_LOGS, getStatusStyle, translateStatus, formatTime } from '@/mocks/attendanceData';

export default function EmployeeAttendance() {
  const { user, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const myLogs = MOCK_ATTENDANCE_LOGS.filter(log => Number(log.user_id) === Number(user?.id || 4));
      setAttendanceLogs(myLogs);
      setLoading(false);
    }, 500);
  }, [user]);

  const displayedLogs = useMemo(() => {
    return selectedDate ? attendanceLogs.filter(log => log.date === selectedDate) : attendanceLogs;
  }, [attendanceLogs, selectedDate]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">{t.title}</h1>
          <p className="text-slate-500 font-medium">My Attendance History</p>
        </div>
        
        <div className="text-right space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ">{t.filterDate}</label>
            <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                />
                {selectedDate && (
                  <button onClick={() => setSelectedDate("")} className="absolute right-10 top-2.5 text-slate-300 hover:text-red-500 transition-colors">
                    <XCircle size={16} />
                  </button>
                )}
            </div>
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="py-6 px-8 text-left">{language === 'th' ? 'วันที่' : 'Date'}</th> 
                <th className="text-center">{t.colCheckIn}</th>
                <th className="text-center">{t.colCheckOut}</th>
                <th className="text-center">{t.colLate}</th>
                <th className="text-center">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedLogs.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 group transition-all">
                  <td className="py-5 px-8 font-bold text-slate-900 text-sm">
                    {new Date(record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}
                  </td>
                  <td className="text-center font-black text-slate-700 font-mono">
                    {formatTime(record.check_in_time)}
                  </td>
                  <td className="text-center font-black text-slate-700 font-mono">
                    {formatTime(record.check_out_time)}
                  </td>
                  <td className="text-center font-black text-red-500">
                    {record.late_minutes > 0 ? `+${record.late_minutes}` : '-'}
                  </td>
                  <td className="text-center px-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(record.STATUS)}`}>
                      {translateStatus(record.STATUS, t)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedLogs.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Calendar className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-300 font-black uppercase tracking-widest">{t.noRecords}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}