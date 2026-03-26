'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CalendarClock, Loader, CalendarDays, Clock, Briefcase } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"; 

const INLINE_MOCK_MY_SHIFTS = [
  { id: 1, date: "2026-03-24", shiftName: "กะเช้า (Morning Shift)", startTime: "08:00", endTime: "17:00", type: "normal" },
  { id: 2, date: "2026-03-25", shiftName: "กะเช้า (Morning Shift)", startTime: "08:00", endTime: "17:00", type: "normal" },
  { id: 3, date: "2026-03-26", shiftName: "กะบ่าย (Afternoon Shift)", startTime: "16:00", endTime: "01:00", type: "late" },
  { id: 4, date: "2026-03-27", shiftName: "กะบ่าย (Afternoon Shift)", startTime: "16:00", endTime: "01:00", type: "late" },
  { id: 5, date: "2026-03-28", shiftName: "วันหยุด (Day Off)", startTime: "-", endTime: "-", type: "off" },
  { id: 6, date: "2026-03-29", shiftName: "วันหยุด (Day Off)", startTime: "-", endTime: "-", type: "off" },
  { id: 7, date: "2026-03-30", shiftName: "กะดึก (Night Shift)", startTime: "00:00", endTime: "09:00", type: "night" },
  { id: 8, date: "2026-03-31", shiftName: "กะเช้า (Morning Shift)", startTime: "08:00", endTime: "17:00", type: "normal" },
];

export default function EmployeeShift() {
  const { language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [myShifts, setMyShifts] = useState<any[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("2026-03"); 

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMyShifts(INLINE_MOCK_MY_SHIFTS);
      setLoading(false);
    }, 500);
  }, []);

  const displayedShifts = useMemo(() => {
    return filterMonth === "all" || !filterMonth
      ? myShifts 
      : myShifts.filter(shift => shift.date.startsWith(filterMonth));
  }, [myShifts, filterMonth]);

  const shiftSummary = useMemo(() => {
    const summary = { morning: 0, afternoon: 0, night: 0, off: 0 };
    displayedShifts.forEach(s => {
      if (s.type === 'normal') summary.morning += 1;
      else if (s.type === 'late') summary.afternoon += 1;
      else if (s.type === 'night') summary.night += 1;
      else if (s.type === 'off') summary.off += 1;
    });
    return summary;
  }, [displayedShifts]);

  const getShiftBadge = (type: string) => {
    switch(type) {
      case 'normal': return "bg-blue-50 text-blue-600 border-blue-100";
      case 'late': return "bg-orange-50 text-orange-600 border-orange-100";
      case 'night': return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case 'off': return "bg-slate-100 text-slate-500 border-slate-200";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6 bg-slate-50 min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4 md:pb-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-3">
            ตารางกะ
          </h1>
        </div>
        
        <div className="relative w-full md:w-auto">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">เลือกเดือน</label>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full md:w-auto px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-slate-600 cursor-pointer"
          />
        </div>
      </div>

      <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">   
          <div className="overflow-x-auto">
            
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/80 font-black text-base text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  
                  <th className="py-4 md:py-5 px-4 md:px-8 w-auto md:w-48">วันที่ </th>
                  <th className="py-4 md:py-5 px-4 md:px-6">ชื่อกะ </th>
                  <th className="py-4 md:py-5 px-4 md:px-6 text-center">เวลาเข้า - ออก </th>
                  <th className="py-4 md:py-5 px-4 md:px-8 text-center w-auto md:w-32">ประเภท</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {displayedShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 md:py-5 px-4 md:px-8 font-bold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex shrink-0 items-center justify-center ${shift.type === 'off' ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-500'}`}>
                          <CalendarDays size={16} />
                        </div>
                        {new Date(shift.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="py-4 md:py-5 px-4 md:px-6 font-black text-slate-700">{shift.shiftName}</td>
                    <td className="text-center py-4 md:py-5 px-4 md:px-6">
                      {shift.type === 'off' ? (
                        <span className="text-slate-300 font-black">-</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                          <Clock size={14} className="text-blue-500"/> {shift.startTime} - {shift.endTime} น.
                        </span>
                      )}
                    </td>
                    <td className="text-center py-4 md:py-5 px-4 md:px-8">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getShiftBadge(shift.type)}`}>
                        {shift.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayedShifts.length === 0 && (
            <div className="py-16 md:py-20 text-center space-y-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <CalendarClock className="text-slate-300" size={32} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-xs md:text-sm">ไม่พบตารางกะในเดือนที่เลือก</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}