'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations';
import { Loader, Search, XCircle, User, Check, X, ClockPlus, Briefcase } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_OT_REQUESTS, MOCK_DEPARTMENTS_OT } from '@/mocks/otData';
import { StatusBadge } from './Shared';

export default function AdminOvertime() {
  const { currentCompanyId, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  
  // States สำหรับ Filters
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = MOCK_OT_REQUESTS;
      if (currentCompanyId) {
        filteredData = filteredData.filter(log => log.company_id === currentCompanyId);
      }
      setRequests(filteredData);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  // ประมวลผลตัวกรองข้อมูล
  const displayedRequests = useMemo(() => {
    return requests.filter(r => {
      const matchDate = selectedDate ? r.date === selectedDate : true;
      const matchSearch = searchQuery 
        ? `${r.employee_name} ${r.employee_code}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchDept = filterDepartment ? r.department_id === filterDepartment : true;
      
      return matchDate && matchSearch && matchDept;
    });
  }, [requests, selectedDate, searchQuery, filterDepartment]);

  const handleAction = (id: number, newStatus: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">OT Management</h1>
          <p className="text-slate-500 font-medium">จัดการคำร้องขอล่วงเวลา (Admin)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* 1. ตัวกรองแผนก (เพิ่มเข้ามาใหม่) */}
          <div className="relative">
            <Briefcase className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value ? Number(e.target.value) : "")}
              className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm appearance-none min-w-[200px] cursor-pointer"
            >
              <option value="">ทุกแผนก (All Departments)</option>
              {MOCK_DEPARTMENTS_OT.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* 2. ช่องค้นหาชื่อ/รหัสพนักงาน */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm w-56"
            />
          </div>

          {/* 3. ตัวกรองวันที่ */}
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

      <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="py-6 px-8 text-left">{t.colEmployee || "พนักงาน"}</th>
                  {/* ✅ เพิ่มหัวตารางคอลัมน์แผนก */}
                  <th className="text-left px-4">แผนก (Department)</th> 
                  <th className="text-center">{t.colDate || "วันที่ขอ OT"}</th>
                  <th className="text-center">{t.colOTHours || "จำนวน (ชม.)"}</th>
                  <th className="text-left">เหตุผล</th>
                  <th className="text-center">{t.colStatus || "สถานะ"}</th>
                  <th className="text-center px-8">{t.colAction || "จัดการ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 group transition-all">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">{req.employee_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* ✅ แสดงชื่อแผนกในตาราง */}
                    <td className="text-left px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap">
                        <Briefcase size={12} /> {req.department_name}
                      </span>
                    </td>

                    <td className="text-center font-bold text-slate-600 text-sm whitespace-nowrap">
                      {new Date(req.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}
                    </td>
                    <td className="text-center font-black text-blue-600 text-lg">
                      {req.hours} <span className="text-[10px] text-slate-400">{t.hrs || "ชม."}</span>
                    </td>
                    <td className="text-left text-sm text-slate-600 max-w-[200px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="text-center px-8">
                      <StatusBadge status={req.status} t={t} />
                    </td>
                    <td className="text-center px-8">
                      {req.status === 'pending' ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleAction(req.id, 'approved')} className="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors" title="อนุมัติ"><Check size={16} /></button>
                          <button onClick={() => handleAction(req.id, 'rejected')} className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors" title="ปฏิเสธ"><X size={16} /></button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase ">ดำเนินการแล้ว</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayedRequests.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <ClockPlus className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-300 font-black uppercase tracking-widest">ไม่พบคำขอ OT</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}