"use client";

import { useState, useEffect } from "react";
import {
  CalendarHeart, Clock, CheckCircle, XCircle, Loader, 
  Search, AlertCircle, MessageSquare, FileText, Filter, X, CalendarDays, User
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from '@/locales/translations'; 
import { MOCK_LEAVE_REQUESTS } from "@/mocks/leaveData";
import { getStatusBadge } from "./helpers";

export default function AdminLeaves() {
  const { currentCompanyId, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  const t = translations[language as keyof typeof translations] || translations['en'];

  const [confirmData, setConfirmData] = useState<{ show: boolean; id: number; status: "approved" | "rejected"; reason: string; }>({ show: false, id: 0, status: "approved", reason: "" });
  const [notif, setNotif] = useState({ show: false, type: "success" as "success" | "error", message: "" });
  
  // ✅ State สำหรับเก็บข้อมูล Modal รายละเอียดการลา
  const [selectedLeaveDetail, setSelectedLeaveDetail] = useState<any | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotif({ show: true, type, message });
    setTimeout(() => setNotif((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = MOCK_LEAVE_REQUESTS;
      if (currentCompanyId) {
        filteredData = filteredData.filter(log => log.company_id === currentCompanyId);
      }
      setLeaveRequests(filteredData);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  const processStatusUpdate = () => {
    if (confirmData.status === "rejected" && !confirmData.reason.trim()) {
      alert(t.errRejectReason || "กรุณาระบุเหตุผลการปฏิเสธ");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setLeaveRequests(prev => prev.map(req => req.id === confirmData.id ? { ...req, status: confirmData.status, rejectReason: confirmData.reason } : req));
      
      // ✅ ถ้าเปิด Modal รายละเอียดอยู่ ให้ซิงค์สถานะใหม่เข้าไปด้วย
      if (selectedLeaveDetail && selectedLeaveDetail.id === confirmData.id) {
        setSelectedLeaveDetail({ ...selectedLeaveDetail, status: confirmData.status, rejectReason: confirmData.reason });
      }

      showNotification("success", `${t.msgProcessSuccess || "ดำเนินการสำเร็จ"} (${confirmData.status})`);
      setConfirmData({ ...confirmData, show: false });
      setSaving(false);
    }, 400);
  };

  const filteredLeaves = leaveRequests.filter(req => 
    (filterStatus === "all" || req.status === filterStatus) &&
    (req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || req.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-purple-600" size={40} /></div>;

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 relative">
      {notif.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
          <div className={`px-6 py-3 rounded-xl shadow-2xl border flex items-center gap-3 bg-white ${notif.type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'}`}>
            {notif.type === 'success' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
            <span className="font-black text-sm">{notif.message}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3  uppercase tracking-tighter">
             Leaves Management
          </h1>
          <p className="text-slate-500 font-medium text-sm">จัดการคำร้องขอลางาน (Admin)</p>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.statPending || "รอตรวจสอบ"}</p>
              <p className="text-3xl font-black mt-1 text-yellow-600">{leaveRequests.filter(r => r.status === 'pending').length}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-50"><Clock className="text-yellow-600" size={28} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.statApproved || "อนุมัติแล้ว"}</p>
              <p className="text-3xl font-black mt-1 text-green-600">{leaveRequests.filter(r => r.status === 'approved').length}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-50"><CheckCircle className="text-green-600" size={28} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.statRejected || "ไม่อนุมัติ"}</p>
              <p className="text-3xl font-black mt-1 text-red-600">{leaveRequests.filter(r => r.status === 'rejected').length}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-50"><XCircle className="text-red-600" size={28} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.statAll || "ทั้งหมด"}</p>
              <p className="text-3xl font-black mt-1 text-slate-900">{leaveRequests.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100"><CalendarHeart className="text-slate-900" size={28} /></div>
          </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder={t.searchEmployee || "ค้นหาพนักงาน..."} value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium" />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="px-6 py-3 bg-slate-50 border-none rounded-xl font-bold text-sm outline-none text-slate-700 cursor-pointer">
                <option value="all">{t.filterStatusAll || "ทุกสถานะ"}</option>
                <option value="pending">⏳ {t.statPending || "รอตรวจสอบ"}</option>
                <option value="approved">✅ {t.statApproved || "อนุมัติแล้ว"}</option>
                <option value="rejected">❌ {t.statRejected || "ไม่อนุมัติ"}</option>
            </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b text-slate-400 text-xs uppercase font-black tracking-widest">
                <th className="py-5 px-8">{t.colEmployee || "พนักงาน"}</th>
                <th className="py-5 px-6">{t.colLeaveInfo || "ข้อมูลการลา"}</th>
                <th className="py-5 px-6 text-center">{t.colLeaveDate || "วันที่ลา"}</th>
                <th className="py-5 px-6 text-center">{t.colAttachment || "เอกสาร"}</th>
                <th className="py-5 px-6 text-center">{t.colStatus || "สถานะ"}</th>
                <th className="py-5 px-8 text-center">{t.colAction || "จัดการ"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredLeaves.map((req) => (
                <tr 
                  key={req.id} 
                  className="hover:bg-purple-50/30 transition-all group cursor-pointer"
                  onClick={() => setSelectedLeaveDetail(req)} // ✅ คลิกที่แถวเพื่อเปิด Detail
                >
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-purple-200">
                            {req.employeeName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 leading-none group-hover:text-purple-700 transition-colors">{req.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider">{req.employeeCode}</p>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-700">{req.leaveType}</p>
                    <p className="text-slate-400 text-xs line-clamp-1 max-w-[200px]">"{req.reason || '-'}"</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 rounded-xl font-black text-[10px] border border-purple-100">
                      {req.startDate} — {req.endDate}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                    {req.attachment_file ? (
                        <span className="inline-flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase hover:underline transition-colors cursor-pointer">
                          <FileText size={14} /> {t.viewDoc || "ดูเอกสาร"}
                        </span>
                    ) : (
                        <span className="text-slate-300 text-xs font-medium">{t.noFile || "ไม่มี"}</span>
                    )}
                  </td>
                  <td className="py-5 px-6 text-center">{getStatusBadge(req.status, t)}</td>
                  <td className="py-5 px-8 text-center" onClick={(e) => e.stopPropagation()}> {/* ✅ หยุด propagation เพื่อไม่ให้ trigger row click */}
                    {req.status === 'pending' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setConfirmData({ show: true, id: req.id, status: 'approved', reason: '' })} className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl border border-green-200 transition-all shadow-sm active:scale-90" title="Approve"><CheckCircle size={18}/></button>
                        <button onClick={() => setConfirmData({ show: true, id: req.id, status: 'rejected', reason: '' })} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all shadow-sm active:scale-90" title="Reject"><XCircle size={18}/></button>
                      </div>
                    ) : (
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.completed || "ดำเนินการแล้ว"}</div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLeaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-bold">ไม่พบข้อมูลการลา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal: Leave Detail */}
      {selectedLeaveDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedLeaveDetail(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <FileText className="text-purple-600" size={20} /> รายละเอียดการลางาน
              </h3>
              <button onClick={() => setSelectedLeaveDetail(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white p-1 rounded-lg shadow-sm border border-slate-100">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Employee Info */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {selectedLeaveDetail.employeeName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">{selectedLeaveDetail.employeeName}</h4>
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                    <User size={12} /> {selectedLeaveDetail.employeeCode}
                  </p>
                </div>
                <div className="ml-auto">
                  {getStatusBadge(selectedLeaveDetail.status, t)}
                </div>
              </div>

              {/* Leave Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ประเภทการลา (Leave Type)</p>
                  <p className="font-bold text-slate-800 text-sm bg-purple-50 text-purple-700 px-3 py-2 rounded-lg border border-purple-100 inline-block">
                    {selectedLeaveDetail.leaveType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่ลา (Duration)</p>
                  <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <CalendarDays size={16} className="text-slate-400" />
                    {selectedLeaveDetail.startDate} ถึง {selectedLeaveDetail.endDate}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เหตุผลการลา (Reason)</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 font-medium">
                  {selectedLeaveDetail.reason || "-"}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ไฟล์แนบ (Attachment)</p>
                {selectedLeaveDetail.attachment_file ? (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700 flex items-center gap-2">
                      <FileText size={16} /> {selectedLeaveDetail.attachment_file}
                    </span>
                    <button className="text-[10px] bg-blue-600 text-white font-black px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-blue-700 transition-colors">
                      ดาวน์โหลด
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400">- ไม่มีไฟล์แนบ -</p>
                )}
              </div>

              {/* Show Reject Reason if status is rejected */}
              {selectedLeaveDetail.status === 'rejected' && selectedLeaveDetail.rejectReason && (
                <div className="space-y-1 pt-2">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <AlertCircle size={12} /> เหตุผลที่ปฏิเสธ (HR Note)
                  </p>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 font-bold">
                    {selectedLeaveDetail.rejectReason}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer (Only if Pending) */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              {selectedLeaveDetail.status === 'pending' && (
                <>
                  <button 
                    onClick={() => {
                      setSelectedLeaveDetail(null);
                      setConfirmData({ show: true, id: selectedLeaveDetail.id, status: 'rejected', reason: '' });
                    }} 
                    className="px-4 py-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    ปฏิเสธ (Reject)
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedLeaveDetail(null);
                      setConfirmData({ show: true, id: selectedLeaveDetail.id, status: 'approved', reason: '' });
                    }} 
                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                  >
                    อนุมัติ (Approve) <CheckCircle size={16} />
                  </button>
                </>
              )}
              {selectedLeaveDetail.status !== 'pending' && (
                <button onClick={() => setSelectedLeaveDetail(null)} className="px-6 py-2.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
                  ปิด (Close)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Action (Approve/Reject) */}
      {confirmData.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !saving && setConfirmData({...confirmData, show: false})} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-8 text-center ${confirmData.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-xl ${confirmData.status === 'approved' ? 'bg-white text-green-600' : 'bg-white text-red-600'}`}>
                {confirmData.status === 'approved' ? <CheckCircle size={32}/> : <XCircle size={32}/>}
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Confirm {confirmData.status}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">{t.confirmStatusDesc || "ยืนยันการทำรายการ"}</p>
            </div>
            <div className="p-8 space-y-4">
              {confirmData.status === 'rejected' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">{t.rejectReasonLabel || "เหตุผลที่ปฏิเสธ"}</label>
                  <textarea rows={3} value={confirmData.reason} onChange={(e) => setConfirmData({...confirmData, reason: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all" placeholder={t.rejectReasonPlaceholder || "ระบุเหตุผล..."} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setConfirmData({...confirmData, show: false})} className="flex-1 py-3.5 font-black text-slate-400 hover:bg-slate-100 rounded-xl transition-all uppercase text-[10px] tracking-widest text-center">{t.btnCancel || "ยกเลิก"}</button>
                <button onClick={processStatusUpdate} disabled={saving} className={`flex-1 py-3.5 font-black text-white rounded-xl shadow-xl transition-all uppercase text-[10px] tracking-widest ${confirmData.status === 'approved' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}>
                  {saving ? <Loader className="animate-spin mx-auto" size={18}/> : (t.btnConfirm || "ยืนยัน")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}