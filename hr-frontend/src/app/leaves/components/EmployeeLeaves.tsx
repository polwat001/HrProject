'use client';

import { useState, useEffect, useRef } from "react";
import { Calendar, CheckCircle, XCircle, Loader, Plus, AlertCircle, X, FileText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from '@/locales/translations'; 
import { getStatusBadge } from "./helpers"; // ตรวจสอบ Path ด้วยนะครับ

// ==========================================
// 🚀 INLINE MOCK DATA: ประวัติการลางาน
// ==========================================
const INLINE_MOCK_LEAVES = [
  { id: 1, leaveType: "ลาพักร้อน (Annual Leave)", startDate: "2026-04-10", endDate: "2026-04-12", days: 3, reason: "ไปเที่ยวต่างประเทศ", status: "approved", attachment_file: "flight_ticket.pdf" },
  { id: 2, leaveType: "ลาป่วย (Sick Leave)", startDate: "2026-03-15", endDate: "2026-03-15", days: 1, reason: "ไข้หวัดใหญ่", status: "approved", attachment_file: "medical_certificate.jpg" },
  { id: 3, leaveType: "ลากิจ (Business Leave)", startDate: "2026-05-05", endDate: "2026-05-05", days: 1, reason: "ต่อใบขับขี่", status: "pending", attachment_file: "" },
  { id: 4, leaveType: "ลากิจ (Business Leave)", startDate: "2026-02-14", endDate: "2026-02-14", days: 1, reason: "ไปงานแต่งเพื่อน", status: "rejected", rejectReason: "ทีมมีคนไม่พอในวันดังกล่าว" }
];

const EMPTY_FORM = {
  leave_type: "ลาป่วย (Sick Leave)",
  start_date: "",
  end_date: "",
  reason: "",
};

export default function EmployeeLeaves() {
  const { user, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);

  const t = translations[language as keyof typeof translations] || translations['en'];

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notif, setNotif] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotif({ show: true, type, message });
    setTimeout(() => setNotif((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // ✅ ใช้ Mock Data ในไฟล์นี้เลย เพื่อให้แสดงผล 100%
      setLeaveRequests(INLINE_MOCK_LEAVES);
      setLoading(false);
    }, 500);
  }, []);

  const handleSave = () => {
    setFormError("");
    if (!formData.start_date || !formData.end_date || !formData.reason.trim()) {
      setFormError(t.errFormIncomplete || "กรุณากรอกข้อมูลให้ครบถ้วน"); return;
    }
    setSaving(true);
    setTimeout(() => {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const newReq = {
        id: Date.now(),
        leaveType: formData.leave_type, startDate: formData.start_date, endDate: formData.end_date,
        days: diffDays, reason: formData.reason, status: "pending", rejectReason: "",
        attachment_file: selectedFile ? selectedFile.name : ""
      };

      setLeaveRequests([newReq, ...leaveRequests]);
      setShowModal(false);
      setFormData({ ...EMPTY_FORM });
      setSelectedFile(null);
      showNotification("success", t.msgLeaveSuccess || "ยื่นใบลาสำเร็จ");
      setSaving(false);
    }, 400);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-600" size={40} /></div>;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 relative animate-in fade-in">
      {/* Notifications */}
      {notif.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
          <div className={`px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 bg-white ${notif.type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'}`}>
            {notif.type === 'success' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
            <span className="font-black text-sm">{notif.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3  uppercase tracking-tighter">
             {t.titleLeave || "My Leaves"}
          </h1>
          <p className="text-slate-500 font-medium text-sm">ประวัติและโควต้าการลางาน</p>
        </div>
        <button onClick={() => { setFormError(""); setFormData({...EMPTY_FORM}); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-95">
          <Plus size={20} /> {t.btnNewLeave || "ขอลางาน"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div><p className="text-xs font-bold text-slate-400 uppercase">ลาป่วย (Sick Leave)</p><p className="text-2xl font-black text-red-500">28 <span className="text-sm font-bold text-slate-400">/ 30 วัน</span></p></div>
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><Calendar size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div><p className="text-xs font-bold text-slate-400 uppercase">ลากิจ (Personal Leave)</p><p className="text-2xl font-black text-orange-500">5 <span className="text-sm font-bold text-slate-400">/ 6 วัน</span></p></div>
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500"><Calendar size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div><p className="text-xs font-bold text-slate-400 uppercase">ลาพักร้อน (Annual Leave)</p><p className="text-2xl font-black text-green-500">10 <span className="text-sm font-bold text-slate-400">/ 10 วัน</span></p></div>
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><Calendar size={20} /></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                <th className="py-5 px-8">{t.colLeaveInfo || "ประเภทการลา"}</th>
                <th className="py-5 px-6 text-center">{t.colLeaveDate || "ช่วงวันที่"}</th>
                <th className="py-5 px-6 text-center">{t.colAttachment || "เอกสาร"}</th>
                <th className="py-5 px-8 text-center">{t.colStatus || "สถานะ"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-purple-50/30 transition-all group">
                  <td className="py-4 px-8">
                    <p className="font-bold text-slate-700">{req.leaveType}</p>
                    <p className="text-slate-400 text-xs">"{req.reason || '-'}"</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-block px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl font-black text-[10px] border border-purple-100">
                      {req.startDate} — {req.endDate} <span className="text-[9px] text-purple-400 block">({req.days} วัน)</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {req.attachment_file ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase hover:underline transition-colors cursor-pointer">
                          <FileText size={14} /> {t.viewDoc || "มีเอกสาร"}
                        </span>
                    ) : (
                        <span className="text-slate-200 font-black text-[10px] tracking-widest">{t.noFile || "ไม่มี"}</span>
                    )}
                  </td>
                  <td className="py-4 px-8 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(req.status, t)}
                        {req.status === 'rejected' && <span className="text-[9px] text-red-400 max-w-[150px] truncate" title={req.rejectReason}>"{req.rejectReason}"</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaveRequests.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Calendar className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-300 font-black uppercase tracking-widest">{t.noRecords || "ไม่พบประวัติการลา"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal ยื่นใบลา */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center tracking-tighter uppercase font-black ">
              <h3 className="text-xl text-slate-900 flex items-center gap-2">
                <Plus className="text-purple-600" size={24} /> {t.btnNewLeave || "ขอลางาน"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm hover:shadow transition-all"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {formError && <div className="p-3 bg-red-50 text-red-600 text-[10px] font-black rounded-xl border border-red-100 text-center uppercase tracking-widest shadow-sm">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t.lblLeaveType || "ประเภทการลา"}</label>
                  <select value={formData.leave_type} onChange={(e)=>setFormData({...formData, leave_type: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                    <option value="ลาป่วย (Sick Leave)">🤒 ลาป่วย (Sick Leave)</option>
                    <option value="ลากิจ (Business Leave)">💼 ลากิจ (Business Leave)</option>
                    <option value="ลาพักร้อน (Annual Leave)">🏖️ ลาพักร้อน (Annual Leave)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t.colAttachment || "เอกสารแนบ"}</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-purple-50/50 border-2 border-dashed border-purple-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-purple-50 transition-all group">
                    <input type="file" ref={fileInputRef} hidden onChange={(e)=>setSelectedFile(e.target.files?.[0] || null)} />
                    <span className="text-xs font-black text-purple-600 uppercase truncate px-2 group-hover:scale-105 transition-transform flex items-center gap-2">
                        <FileText size={16}/> {selectedFile ? selectedFile.name : (t.selFile || "อัปโหลดไฟล์ (ถ้ามี)")}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t.lblStartDate || "วันที่เริ่ม"}</label>
                  <input type="date" value={formData.start_date} onChange={(e)=>setFormData({...formData, start_date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-purple-500 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t.lblEndDate || "วันสิ้นสุด"}</label>
                  <input type="date" min={formData.start_date} value={formData.end_date} onChange={(e)=>setFormData({...formData, end_date: e.target.value})} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-purple-500 transition-all outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">{t.lblReason || "เหตุผลการลา"}</label>
                <textarea rows={3} value={formData.reason} onChange={(e)=>setFormData({...formData, reason: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold resize-none outline-none focus:border-purple-500 transition-all" placeholder={t.plhReason || "ระบุเหตุผล..."} />
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex gap-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-slate-500 hover:bg-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                {saving ? <><Loader size={14} className="animate-spin"/> กำลังบันทึก</> : "ส่งคำร้อง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}