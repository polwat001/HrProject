'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { attendanceAPI } from '@/services/api';
import {
  Calendar,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader,
  Filter,
  User,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function AttendancePage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    loadAttendance();
  }, [currentCompanyId, selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      // เรียกใช้ API getAttendanceLogs ตามที่ระบุใน api.ts
      const res = await attendanceAPI.getAttendanceLogs({ 
        startDate: selectedDate, 
        endDate: selectedDate 
      });

      // กรองเฉพาะบริษัทที่เลือก (ถ้า Backend ยังไม่ได้กรองมาให้)
      const filtered = currentCompanyId 
        ? res.data.filter((item: any) => item.company_id === currentCompanyId)
        : res.data;

      setAttendanceLogs(filtered);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper สำหรับสี Status
  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'present' || s === 'on_time') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'late') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s === 'absent') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 italic uppercase">⏱️ Attendance Logs</h1>
      </div>

      <Card className="rounded-[2rem] border-none shadow-sm p-6 bg-white">
        <div className="flex items-center gap-4">
          <Filter className="text-blue-600" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-slate-100 rounded-xl font-black text-slate-700 outline-none"
          />
        </div>
      </Card>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center"><Loader className="animate-spin mx-auto text-blue-600" /></div>
          ) : attendanceLogs.length === 0 ? (
            <div className="py-20 text-center text-slate-300 font-black uppercase">No Data Found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="py-6 px-8 text-left">Employee</th>
                  <th className="text-center">Check In</th>
                  <th className="text-center">Check Out</th>
                  <th className="text-center">Late (Min)</th>
                  <th className="text-center">Status</th>
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
                          <p className="font-black text-slate-900 leading-tight">{record.firstname_th} {record.lastname_th}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{record.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    {/* ✅ แก้ชื่อฟิลด์ให้ตรงกับ attendance_logs */}
                    <td className="text-center font-black text-slate-700">{record.check_in_time || '--:--'}</td>
                    <td className="text-center font-black text-slate-700">{record.check_out_time || '--:--'}</td>
                    <td className="text-center font-black text-red-500">{record.late_minutes > 0 ? `+${record.late_minutes}` : '-'}</td>
                    <td className="text-center px-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter border ${getStatusStyle(record.STATUS)}`}>
                        {record.STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
