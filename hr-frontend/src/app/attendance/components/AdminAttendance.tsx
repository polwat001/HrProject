'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations'; 
import { Calendar, Loader, User, XCircle, Search } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ATTENDANCE_LOGS, getStatusStyle, translateStatus, formatTime } from '@/mocks/attendanceData';

export default function AdminAttendance() {
  const { currentCompanyId, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = MOCK_ATTENDANCE_LOGS;
      if (currentCompanyId) {
        filteredData = filteredData.filter(log => log.company_id === currentCompanyId);
      }
      setAttendanceLogs(filteredData);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  const displayedLogs = useMemo(() => {
    return attendanceLogs.filter(log => {
      const matchDate = selectedDate ? log.date === selectedDate : true;
      const matchSearch = searchQuery 
        ? `${log.firstname_th} ${log.lastname_th} ${log.employee_code}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchDate && matchSearch;
    });
  }, [attendanceLogs, selectedDate, searchQuery]);

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{t.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm w-64"
            />
          </div>

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

      <Card className="rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50 font-black text-lg text-black uppercase tracking-widest border-b-2 border-gray-300">
              <tr>
                <th className="py-6 px-8 text-left pl-12">{t.colEmployee}</th>
                <th className="text-center">{language === 'th' ? 'วันที่' : 'Date'}</th> 
                <th className="text-center">{t.colCheckIn}</th>
                <th className="text-center">{t.colCheckOut}</th>
                <th className="text-center">{t.colLate}</th>
                <th className="text-center">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedLogs.map((record) => (
                <tr key={record.id} className="hover:bg-slate-200 group transition-all">
                  <td className="py-5 px-8 ">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">
                          {record.firstname_th} {record.lastname_th}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {record.employee_code}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center font-bold text-slate-600 text-sm">
                    {new Date(record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}
                  </td>
                  <td className="text-center font-black text-slate-700 font-mono">
                    {formatTime(record.check_in_time)}
                  </td>
                  <td className="text-center font-black text-slate-700 font-mono">
                    {formatTime(record.check_out_time)}
                  </td>
                  <td className={`text-center font-black ${record.late_minutes > 0 ? 'text-red-500' : 'text-slate-400'}`}>
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