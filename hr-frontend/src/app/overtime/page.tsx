'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { otAPI, employeeAPI } from '@/services/api';
import { translations } from '@/locales/translations';
import {
  Clock, CheckCircle, Loader, Search, Check, X, User, Filter, XCircle
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function OTManagementPage() {
  const { currentCompanyId, language, user } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [otRecords, setOtRecords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ เพิ่ม State สำหรับกรองวันที่ (ค่าเริ่มต้นเป็นว่างเพื่อให้เห็นทั้งหมดตอนแรก)
  const [selectedDate, setSelectedDate] = useState("");

  const t = translations[language as keyof typeof translations];

  const roleId = Number(user?.role_id || user?.is_super_admin);
  const isEmployee = roleId === 4;

  const loadOTData = useCallback(async () => {
    setLoading(true);
    try {
      let empIdToFilter = null;

      if (isEmployee && user) {
        const empRes = await employeeAPI.getEmployees();
        const currentEmp = empRes.data.find((e: any) => Number(e.user_id) === Number(user.id));
        empIdToFilter = currentEmp?.id || user.id;
      }

      // ✅ เตรียม Params สำหรับค้นหา (ถ้ามีวันที่ให้ส่งไปด้วย)
      const queryParams: any = { 
        company_id: currentCompanyId || undefined 
      };
      
      if (selectedDate) {
        queryParams.startDate = selectedDate;
        queryParams.endDate = selectedDate;
      }

      const res = await otAPI.getOTRecords(queryParams);
      let filtered = res.data || [];

      if (isEmployee && empIdToFilter) {
        filtered = filtered.filter((item: any) => item.employee_id === empIdToFilter);
      }

      setOtRecords(filtered);
    } catch (error) {
      console.error("Load OT Error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId, user, isEmployee, selectedDate]);

  useEffect(() => {
    loadOTData();
  }, [loadOTData]);

  const handleOTAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await otAPI.updateStatus(id, status);
      setOtRecords(prev => prev.map(r => r.id === id ? { ...r, log_status: status } : r));
    } catch (error) {
      console.error("Update Status Error:", error);
      alert("Failed to update status");
    }
  };

  const filteredRecords = otRecords.filter(r => 
    `${r.firstname_th} ${r.lastname_th}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.employee_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const translateStatus = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'approved') return t.statusApproved;
    if (s === 'rejected') return t.statusRejected;
    if (s === 'pending') return t.statusPending;
    return status;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen italic">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            {isEmployee ? (language === 'th' ? "ประวัติ OT ของฉัน" : "My OT Records") : t.titleOT}
          </h1>
        </div>
        
        {/* ✅ ส่วน Filter: ค้นหาชื่อ + เลือกวันที่ */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Filter Date</label>
            <div className="relative">
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-4 pr-10 py-3 bg-white shadow-sm rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate("")}
                  className="absolute right-3 top-3.5 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
          </div>

          
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b font-black text-[10px] text-slate-400 uppercase tracking-widest">
                <th className="py-6 px-8 text-left">{t.colEmployee}</th>
                <th className="text-center">{t.colDate}</th>
                <th className="text-center">{t.colOTHours}</th>
                <th className="text-center">{t.colStatus}</th>
                {!isEmployee && <th className="text-center">{t.colAction}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 group transition-all">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{record.firstname_th} {record.lastname_th}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{record.employee_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center font-bold text-slate-500 text-sm">
                    {new Date(record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}
                  </td>
                  <td className="text-center font-black text-slate-900 italic">
                    {record.hours} <span className="text-[10px]">{t.hrs}</span>
                  </td>
                  <td className="text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      record.log_status === 'approved' ? 'bg-green-100 text-green-700' : 
                      record.log_status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {translateStatus(record.log_status)}
                    </span>
                  </td>
                  
                  {!isEmployee && (
                    <td className="px-6 text-center">
                      {record.log_status !== 'approved' && record.log_status !== 'rejected' ? (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleOTAction(record.id, 'approved')} className="p-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all" title="Approve"><Check size={18}/></button>
                          <button onClick={() => handleOTAction(record.id, 'rejected')} className="p-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="Reject"><X size={18}/></button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase italic">{t.done}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={isEmployee ? 4 : 5} className="text-center py-20 text-slate-300 font-black uppercase tracking-widest">
                    <Clock size={48} className="mx-auto mb-4 opacity-20" />
                    {language === 'th' ? "ไม่พบประวัติการทำ OT ในวันที่เลือก" : "No OT Records found for this date"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
