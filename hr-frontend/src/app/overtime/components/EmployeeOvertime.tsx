'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations';
import { Plus, Loader, XCircle, ClockPlus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_OT_REQUESTS } from '@/mocks/otData';
import { StatusBadge } from './Shared';

export default function EmployeeOvertime() {
  const { user, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: "", hours: 1, reason: "" });

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const myLogs = MOCK_OT_REQUESTS.filter(r => Number(r.user_id) === Number(user?.id || 4));
      setRequests(myLogs);
      setLoading(false);
    }, 500);
  }, [user]);

  const displayedRequests = useMemo(() => {
    return selectedDate ? requests.filter(r => r.date === selectedDate) : requests;
  }, [requests, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = {
      id: Math.random(), user_id: user?.id || 4, employee_name: user?.firstName || "สมชาย", employee_code: "EMP-NEW",
      date: form.date, hours: form.hours, reason: form.reason, status: "pending", company_id: 1
    };
    setRequests([newReq, ...requests]);
    setShowModal(false);
    setForm({ date: "", hours: 1, reason: "" });
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">
            {language === 'th' ? "ประวัติ OT ของฉัน" : "My OT Records"}
          </h1>
          <p className="text-slate-500 font-medium">Overtime History</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="relative">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                />
                {selectedDate && (
                  <button onClick={() => setSelectedDate("")} className="absolute right-10 top-3 text-slate-300 hover:text-red-500 transition-colors">
                    <XCircle size={16} />
                  </button>
                )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">
              <Plus size={18} /> ขอ OT
            </button>
        </div>
      </div>

      <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <tr>
                <th className="py-6 px-8 text-left">{t.colDate || "วันที่ขอ OT"}</th>
                <th className="text-center">{t.colOTHours || "จำนวน (ชม.)"}</th>
                <th className="text-left">เหตุผล</th>
                <th className="text-center px-8">{t.colStatus || "สถานะ"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50 group transition-all">
                  <td className="py-5 px-8 font-bold text-slate-900 text-sm">
                    {new Date(req.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'})}
                  </td>
                  <td className="text-center font-black text-blue-600 text-lg">
                    {req.hours} <span className="text-[10px] text-slate-400">{t.hrs || "ชม."}</span>
                  </td>
                  <td className="text-left text-sm text-slate-600">{req.reason}</td>
                  <td className="text-center px-8">
                    <StatusBadge status={req.status} t={t} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedRequests.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <ClockPlus className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-300 font-black uppercase tracking-widest">ไม่พบประวัติการทำ OT</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal ขอ OT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase">Request Overtime</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">วันที่ทำ OT</label>
                <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">จำนวนชั่วโมง</label>
                <input type="number" step="0.5" min="0.5" required value={form.hours} onChange={e => setForm({...form, hours: Number(e.target.value)})} className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">เหตุผลการขอ</label>
                <textarea required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all">ส่งคำขอ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}