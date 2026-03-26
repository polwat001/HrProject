'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations'; 
import { Calendar, Loader, XCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { getStatusStyle, translateStatus, formatTime } from '@/mocks/attendanceData';


const INLINE_MOCK_ATTENDANCE = [
  { id: 1, date: "2026-03-24", check_in_time: "08:25:00", check_out_time: "17:35:00", late_minutes: 0, STATUS: "present" },
  { id: 2, date: "2026-03-23", check_in_time: "08:45:00", check_out_time: "18:00:00", late_minutes: 15, STATUS: "late" },
  { id: 3, date: "2026-03-22", check_in_time: "08:15:00", check_out_time: "17:15:00", late_minutes: 0, STATUS: "present" },
  { id: 4, date: "2026-03-21", check_in_time: null, check_out_time: null, late_minutes: 0, STATUS: "absent" },
  { id: 5, date: "2026-03-20", check_in_time: "08:28:00", check_out_time: "19:30:00", late_minutes: 0, STATUS: "present" },
];

export default function EmployeeAttendance() {
  const { language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAttendanceLogs(INLINE_MOCK_ATTENDANCE);
      setLoading(false);
    }, 500);
  }, []);

  const displayedLogs = useMemo(() => {
    return selectedDate ? attendanceLogs.filter(log => log.date === selectedDate) : attendanceLogs;
  }, [attendanceLogs, selectedDate]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
   
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase ">{t.title}</h1>
        </div>
        <div className="text-left md:text-right space-y-1 w-full md:w-auto">
            <label className="text-[10px] font-black uppercase text-slate-400 ">{t.filterDate}</label>
            <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                />
                {selectedDate && (
                  <button onClick={() => setSelectedDate("")} className="absolute right-3 top-2.5 text-slate-300 hover:text-red-500 transition-colors">
                    <XCircle size={16} />
                  </button>
                )}
            </div>
        </div>
      </div>

      <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-300 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-slate-50 font-black text-base text-slate-400 uppercase tracking-widest border-b border-slate-300">
                <tr>
                  <th className="py-4 md:py-6 px-4 md:px-8 text-left">{language === 'th' ? 'วันที่' : 'Date'}</th> 
                  <th className="py-4 md:py-6 px-4 text-center">{t.colCheckIn}</th>
                  <th className="py-4 md:py-6 px-4 text-center">{t.colCheckOut}</th>
                  <th className="py-4 md:py-6 px-4 text-center">{t.colLate}</th>
                  <th className="py-4 md:py-6 px-4 md:px-8 text-center">{t.colStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedLogs.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 group transition-all">
                    <td className="py-4 px-4 md:px-8 font-bold text-slate-900 text-sm">
                      {new Date(record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-700 font-mono text-sm">
                      {formatTime(record.check_in_time)}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-slate-700 font-mono text-sm">
                      {formatTime(record.check_out_time)}
                    </td>
                    <td className="py-4 px-4 text-center font-black text-red-500 text-sm">
                      {record.late_minutes > 0 ? `+${record.late_minutes}` : '-'}
                    </td>
                    <td className="py-4 px-4 md:px-8 text-center">
                      <span className={`px-3 md:px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(record.STATUS)}`}>
                        {translateStatus(record.STATUS, t)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayedLogs.length === 0 && (
            <div className="py-16 text-center space-y-4">
              <Calendar className="mx-auto text-slate-200" size={48} />
              <p className="text-slate-300 font-black uppercase tracking-widest text-sm">{t.noRecords}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}