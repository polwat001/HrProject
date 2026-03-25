"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations';
import { 
  Loader, Search, ClockPlus, CalendarDays, Plus, X 
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from './Shared'; // ตรวจสอบ path ของ StatusBadge ด้วยนะครับ

// ==========================================
// 🚀 INLINE MOCK DATA: จำลองข้อมูล OT ของฉัน
// ==========================================
const INLINE_MOCK_OT_REQUESTS = [
  {
    id: 1,
    employee_id: 999, 
    company_id: 1,
    date: "2026-03-20",
    hours: 3,
    reason: "เคลียร์เอกสารปิดงบประจำเดือน",
    status: "approved",
  },
  {
    id: 2,
    employee_id: 999,
    company_id: 1,
    date: "2026-03-25",
    hours: 2.5,
    reason: "ประชุมทีมต่างประเทศ (Timezone อเมริกา)",
    status: "pending",
  },
  {
    id: 3,
    employee_id: 999,
    company_id: 1,
    date: "2026-04-02",
    hours: 4,
    reason: "Deploy ระบบขึ้น Production นอกเวลางาน",
    status: "rejected",
  },
  {
    id: 4,
    employee_id: 999,
    company_id: 1,
    date: "2026-04-10",
    hours: 2,
    reason: "ทำสรุปรายงานการประชุมด่วนให้ผู้บริหาร",
    status: "approved",
  }
];

export default function EmployeeOvertime() {
  const { currentCompanyId, language, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  
  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  
  // Modal ขอ OT
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ date: "", hours: "", reason: "" });

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // ✅ ใช้ Mock Data ที่ฝังไว้ในไฟล์ โยนเข้า State โดยตรงเพื่อให้แสดงผลทันที
      setMyRequests(INLINE_MOCK_OT_REQUESTS);
      setLoading(false);
    }, 500);
  }, []); // นำ dependencies ออกชั่วคราวเพื่อไม่ให้มันรีเฟรชข้อมูลทิ้ง

  const displayedRequests = useMemo(() => {
    return myRequests.filter(r => {
      const matchSearch = r.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMonth = filterMonth === "all" ? true : r.date.startsWith(filterMonth);
      return matchSearch && matchMonth;
    });
  }, [myRequests, searchQuery, filterMonth]);

  const handleRequestOT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.date || !requestForm.hours) return;
    
    // จำลองการเพิ่มคำขอ OT ใหม่
    const newRequest = {
      id: Date.now(),
      employee_id: user?.id || 999,
      company_id: currentCompanyId,
      date: requestForm.date,
      hours: Number(requestForm.hours),
      reason: requestForm.reason || "-",
      status: "pending",
      employee_name: user?.firstName || user?.username || "คุณ",
      employee_code: "EMP-NEW"
    };

    setMyRequests([newRequest, ...myRequests]);
    setIsRequestModalOpen(false);
    setRequestForm({ date: "", hours: "", reason: "" });
    alert("✅ ส่งคำขอ OT สำเร็จ (รออนุมัติ)");
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase ">ประวัติการทำ OT</h1>
        </div>
        
        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest w-full md:w-auto justify-center"
        >
          <Plus size={18} /> {t.btnRequestOT || "ยื่นคำขอ OT"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาจากเหตุผล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="relative w-full sm:w-auto">
          <input 
            type="month" 
            value={filterMonth === "all" ? "" : filterMonth}
            onChange={(e) => setFilterMonth(e.target.value || "all")}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm text-slate-600"
          />
        </div>
      </div>

      {/* ตารางข้อมูล */}
      <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="text-left py-5 px-8">{t.colDate || "วันที่ขอ OT"}</th>
                  <th className="text-center px-4">{t.colOTHours || "จำนวน (ชม.)"}</th>
                  <th className="text-left px-4">เหตุผล</th>
                  <th className="text-center px-8">{t.colStatus || "สถานะ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-8 font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} className="text-blue-500" />
                        {new Date(req.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                    <td className="text-center font-black text-blue-600 text-lg py-4 px-4">
                      {req.hours} <span className="text-[10px] text-slate-400">{t.hrs || "ชม."}</span>
                    </td>
                    <td className="text-left text-slate-600 max-w-[300px] truncate py-4 px-4" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="text-center py-4 px-8">
                      <StatusBadge status={req.status} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayedRequests.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <ClockPlus className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">คุณยังไม่มีประวัติการขอ OT</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ MODAL: ยื่นคำขอ OT */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsRequestModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <ClockPlus className="text-blue-600"/> ยื่นคำขอ OT
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} className="p-2 bg-white hover:bg-slate-200 rounded-xl text-slate-400 transition-colors shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleRequestOT} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่ต้องการทำ OT <span className="text-red-500">*</span></label>
                <input 
                  type="date" required 
                  value={requestForm.date} onChange={(e) => setRequestForm({...requestForm, date: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนชั่วโมง <span className="text-red-500">*</span></label>
                <input 
                  type="number" min="0.5" step="0.5" required placeholder="เช่น 2 หรือ 2.5"
                  value={requestForm.hours} onChange={(e) => setRequestForm({...requestForm, hours: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เหตุผลการขอ OT <span className="text-red-500">*</span></label>
                <textarea 
                  required rows={3} placeholder="ระบุเหตุผลและงานที่ต้องรับผิดชอบ..."
                  value={requestForm.reason} onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 resize-none" 
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-3 text-slate-500 font-black tracking-widest uppercase text-xs hover:bg-slate-100 rounded-xl transition-all">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-black tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                  ส่งคำขอ OT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}