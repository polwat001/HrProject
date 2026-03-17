'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { attendanceAPI, employeeAPI } from '@/services/api';
import { translations } from '@/locales/translations'; 
import {
  Calendar, Loader, User, XCircle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function AttendancePage() {
  const { currentCompanyId, language, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  // ✅ เหลือแค่การกรองวันที่
  const [selectedDate, setSelectedDate] = useState("");

  const t = translations[language as keyof typeof translations] || translations['en'];
  const roleId = Number(user?.role_id || user?.is_super_admin);
  const isEmployee = roleId === 4;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let empIdToFilter = null;
      if (isEmployee && user) {
        const empRes = await employeeAPI.getEmployees();
        const currentEmp = empRes.data.find((e: any) => Number(e.user_id) === Number(user.id));
        empIdToFilter = currentEmp?.id || user.id;
      }

      const queryParams: any = {};
      if (selectedDate) {
        queryParams.startDate = selectedDate;
        queryParams.endDate = selectedDate;
      }

      const res = await attendanceAPI.getAttendanceLogs(queryParams);
      let data = res.data || [];

      // กรองเบื้องต้นตามสิทธิ์และบริษัท
      if (currentCompanyId) {
        data = data.filter((item: any) => item.company_id == currentCompanyId);
      }
      if (isEmployee && empIdToFilter) {
        data = data.filter((item: any) => item.employee_id === empIdToFilter);
      }

      setAttendanceLogs(data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, selectedDate, isEmployee, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'present' || s === 'on_time') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'late') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s === 'absent') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const translateStatus = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'present') return t.statusPresent;
    if (s === 'late') return t.statusLate;
    if (s === 'absent') return t.statusAbsent;
    if (s === 'on_time') return t.statusOnTime;
    return status; 
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    return timeStr.split('.')[0].slice(0, 5); 
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic"> {t.title}</h1>
        </div>
        
        {/* ค้นหาด้วยวันที่ (ปุ่มกดเลือกวันที่มุมขวาบน) */}
        <div className="text-right space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 italic">{t.filterDate}</label>
            <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                />
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate("")}
                    className="absolute right-10 top-2.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                )}
            </div>
        </div>
      </div>

      {/* Table Section */}
      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="py-6 px-8 text-left">{t.colEmployee}</th>
                <th className="text-center">{language === 'th' ? 'วันที่' : 'Date'}</th> 
                <th className="text-center">{t.colCheckIn}</th>
                <th className="text-center">{t.colCheckOut}</th>
                <th className="text-center">{t.colLate}</th>
                <th className="text-center">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendanceLogs.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 group transition-all">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
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
                    {new Date(record.DATE || record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}
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
                      {translateStatus(record.STATUS)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {attendanceLogs.length === 0 && (
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
