"use client";

import { useState, useEffect, useRef } from "react";
import {
  CalendarHeart, Clock, CheckCircle, XCircle, Loader, 
  Plus, Search, AlertCircle, X, Save, MessageSquare, Paperclip, FileText, Filter
} from "lucide-react";

import { leaveAPI, employeeAPI } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";

const EMPTY_FORM = {
  employee_id: 0,
  leave_type: "ลาป่วย (Sick Leave)",
  start_date: "",
  end_date: "",
  reason: "",
};

export default function LeavesPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Create Form States
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Approve/Reject States
  const [confirmData, setConfirmData] = useState<{
    show: boolean; id: number; status: "approved" | "rejected"; reason: string;
  }>({ show: false, id: 0, status: "approved", reason: "" });

  // Notification Toast
  const [notif, setNotif] = useState({ show: false, type: "success" as "success" | "error", message: "" });

  const showNotification = (type: "success" | "error", message: string) => {
    setNotif({ show: true, type, message });
    setTimeout(() => setNotif((prev) => ({ ...prev, show: false })), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaveRes, empRes] = await Promise.all([
        leaveAPI.getLeaveRequests({ companyId: currentCompanyId }),
        employeeAPI.getEmployees(),
      ]);
      const employeesData = empRes.data;
      setEmployees(employeesData);

      const formatted = leaveRes.data.map((item: any) => {
        const emp = employeesData.find((e: any) => Number(e.id) === Number(item.employee_id));
        const start = new Date(item.start_date);
        const end = new Date(item.end_date);
        const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
          id: item.id,
          employeeName: emp ? `${emp.firstname_th} ${emp.lastname_th}` : (item.firstname_th ? `${item.firstname_th} ${item.lastname_th}` : "Unknown"),
          employeeCode: emp?.employee_code || "-",
          leaveType: item.leave_type,
          startDate: item.start_date.split("T")[0],
          endDate: item.end_date.split("T")[0],
          days: diffDays,
          status: (item.STATUS || item.status || "pending").toLowerCase(),
          reason: item.reason,
          rejectReason: item.reject_reason,
          attachment: item.attachment_url
        };
      });
      setLeaveRequests(formatted.sort((a: any, b: any) => b.id - a.id));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [currentCompanyId]);

  const processStatusUpdate = async () => {
    if (confirmData.status === "rejected" && !confirmData.reason.trim()) {
      alert("กรุณาระบุเหตุผลที่ปฏิเสธ");
      return;
    }
    try {
      setSaving(true);
      await leaveAPI.updateLeaveStatus(confirmData.id, confirmData.status, confirmData.reason);
      showNotification("success", `ทำการ${confirmData.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'}สำเร็จ`);
      setConfirmData({ ...confirmData, show: false });
      await loadData();
    } catch (err) { showNotification("error", "เกิดข้อผิดพลาด"); } finally { setSaving(false); }
  };

  const handleSave = async () => {
    setFormError("");
    if (!formData.employee_id || !formData.start_date || !formData.end_date || !formData.reason.trim()) {
      setFormError("กรุณากรอกข้อมูลให้ครบถ้วน"); return;
    }
    try {
      setSaving(true);
      const data = new FormData();
      data.append("employee_id", formData.employee_id.toString());
      data.append("company_id", (currentCompanyId || 1).toString());
      data.append("leave_type", formData.leave_type);
      data.append("start_date", formData.start_date);
      data.append("end_date", formData.end_date);
      data.append("reason", formData.reason);
      if (selectedFile) data.append("attachment", selectedFile);

      await leaveAPI.createLeaveRequest(data);
      setShowModal(false);
      setSelectedFile(null);
      showNotification("success", "ยื่นคำขอลาสำเร็จ");
      await loadData();
    } catch (err) { showNotification("error", "บันทึกไม่สำเร็จ"); } finally { setSaving(false); }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[11px] font-bold border border-green-200 uppercase">Approved</span>;
      case "rejected": return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[11px] font-bold border border-red-200 uppercase">Rejected</span>;
      default: return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[11px] font-bold border border-yellow-200 uppercase">Pending</span>;
    }
  };

  const filteredLeaves = leaveRequests.filter(req => 
    (filterStatus === "all" || req.status === filterStatus) &&
    (req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || req.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/50 relative">
      {/* --- Notification Toast --- */}
      {notif.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-2">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 bg-white ${notif.type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'}`}>
            {notif.type === 'success' ? <CheckCircle className="text-green-500" /> : <AlertCircle className="text-red-500" />}
            <span className="font-black text-sm">{notif.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <CalendarHeart className="text-purple-600" size={36} /> จัดการการลา
          </h1>
          <p className="text-slate-500 font-medium">ระบบตรวจสอบและอนุมัติใบคำขอลาพนักงาน (HR Management)</p>
        </div>
        <button onClick={() => { setFormError(""); setShowModal(true); }} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-black hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-95">
          <Plus size={20} /> ยื่นใบลา
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'รออนุมัติ', count: leaveRequests.filter(r => r.status === 'pending').length, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock },
          { label: 'อนุมัติแล้ว', count: leaveRequests.filter(r => r.status === 'approved').length, color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
          { label: 'ไม่อนุมัติ', count: leaveRequests.filter(r => r.status === 'rejected').length, color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
          { label: 'ทั้งหมด', count: leaveRequests.length, color: 'text-slate-900', bg: 'bg-slate-100', icon: CalendarHeart },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`${stat.color}`} size={28} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="ค้นหาพนักงาน หรือรหัสพนักงาน..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium" />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)} className="px-6 py-3 bg-slate-50 border-none rounded-2xl font-bold text-sm outline-none text-slate-700">
                <option value="all">สถานะ: ทั้งหมด</option>
                <option value="pending">⏳ Waiting Approval</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
            </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[2rem] border border-gray shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b text-slate-400 text-lg uppercase font-black tracking-widest">
                <th className="py-5 px-8">พนักงาน</th>
                <th className="py-5 px-6">ประเภท / เหตุผลการลา</th>
                <th className="py-5 px-6 text-center">จำนวนวัน</th>
                <th className="py-5 px-6">ไฟล์แนบ</th>
                <th className="py-5 px-6">สถานะ</th>
                <th className="py-5 px-6 text-red-500 font-black">หมายเหตุจาก HR</th>
                <th className="py-5 px-8 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredLeaves.map((req) => (
                <tr key={req.id} className="hover:bg-purple-50/30 transition-all group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-100">
                            {req.employeeName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-black text-slate-900 leading-none">{req.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase">{req.employeeCode}</p>
                        </div>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <p className="font-bold text-slate-700">{req.leaveType}</p>
                    <p className="text-[11px] text-slate-400 italic mt-1 leading-tight">"{req.reason || '-'}"</p>
                    <p className="text-[9px] font-black text-slate-400 mt-2 uppercase">{req.startDate} — {req.endDate}</p>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 rounded-xl font-black text-xs border border-purple-100">{req.days} วัน</span>
                  </td>
                  <td className="py-4 px-6">
  {req.attachment_file ? (
    <a 
      href={`http://localhost:5000/uploads/documents/${req.attachment_file}`} 
      target="_blank" 
      className="flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase hover:underline"
    >
      <FileText size={14} /> View Document
    </a>
  ) : (
    <span className="text-slate-200">-</span>
  )}
</td>
                  <td className="py-5 px-6">{getStatusBadge(req.status)}</td>
                  <td className="py-5 px-6">
                    {req.status === 'rejected' && req.rejectReason ? (
                        <div className="flex items-start gap-2 text-red-500 bg-red-50 p-2 rounded-xl border border-red-100 max-w-[180px]">
                            <MessageSquare size={12} className="shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold leading-tight italic">{req.rejectReason}</p>
                        </div>
                    ) : <span className="text-slate-200">-</span>}
                  </td>
                  <td className="py-5 px-8 text-center">
                    {req.status === 'pending' ? (
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setConfirmData({ show: true, id: req.id, status: 'approved', reason: '' })} className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl border border-green-200 transition-all shadow-sm active:scale-90"><CheckCircle size={18}/></button>
                        <button onClick={() => setConfirmData({ show: true, id: req.id, status: 'rejected', reason: '' })} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl border border-red-200 transition-all shadow-sm active:scale-90"><XCircle size={18}/></button>
                      </div>
                    ) : <div className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Processed</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Modal ยืนยันการ อนุมัติ/ปฏิเสธ */}
      {confirmData.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !saving && setConfirmData({...confirmData, show: false})} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-8 text-center ${confirmData.status === 'approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl ${confirmData.status === 'approved' ? 'bg-white text-green-600' : 'bg-white text-red-600'}`}>
                {confirmData.status === 'approved' ? <CheckCircle size={40}/> : <XCircle size={40}/>}
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase">Confirm {confirmData.status}</h3>
              <p className="text-slate-500 text-sm font-medium mt-2">โปรดยืนยันการดำเนินการนี้</p>
            </div>
            <div className="p-8 space-y-4">
              {confirmData.status === 'rejected' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">ระบุเหตุผลที่ปฏิเสธ *</label>
                  <textarea rows={3} value={confirmData.reason} onChange={(e) => setConfirmData({...confirmData, reason: e.target.value})} className="w-full p-4 border-none bg-slate-50 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all" placeholder="กรุณาระบุสาเหตุที่ไม่อนุมัติ..." />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setConfirmData({...confirmData, show: false})} className="flex-1 py-4 font-black text-slate-400 hover:bg-slate-100 rounded-2xl transition-all uppercase text-xs tracking-widest">Cancel</button>
                <button onClick={processStatusUpdate} disabled={saving} className={`flex-1 py-4 font-black text-white rounded-2xl shadow-xl transition-all uppercase text-xs tracking-widest ${confirmData.status === 'approved' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}>
                  {saving ? <Loader className="animate-spin mx-auto" size={18}/> : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal ยื่นใบลาใหม่ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => !saving && setShowModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-900 flex items-center gap-2 italic uppercase tracking-tighter">
                <Plus className="text-purple-600" size={24} /> New Leave Request
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm"><X size={20}/></button>
            </div>
            <div className="p-8 space-y-5">
              {formError && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100 text-center uppercase tracking-widest">{formError}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Employee *</label>
                  <select value={formData.employee_id} onChange={(e)=>setFormData({...formData, employee_id: Number(e.target.value)})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                    <option value={0}>-- Select Employee --</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.employee_code} - {e.firstname_th} {e.lastname_th}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Leave Type *</label>
                  <select value={formData.leave_type} onChange={(e)=>setFormData({...formData, leave_type: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="ลาป่วย (Sick Leave)">🤒 Sick Leave</option>
                    <option value="ลากิจ (Business Leave)">💼 Business Leave</option>
                    <option value="ลาพักร้อน (Annual Leave)">🏖️ Annual Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Attachment</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-purple-50 border border-dashed border-purple-200 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-purple-100 transition-all">
                    <input type="file" ref={fileInputRef} hidden onChange={(e)=>setSelectedFile(e.target.files?.[0] || null)} />
                    <span className="text-[10px] font-black text-purple-600 uppercase truncate">
                        {selectedFile ? selectedFile.name : "Upload File"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Start Date *</label>
                  <input type="date" value={formData.start_date} onChange={(e)=>setFormData({...formData, start_date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">End Date *</label>
                  <input type="date" value={formData.end_date} onChange={(e)=>setFormData({...formData, end_date: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Reason *</label>
                <textarea rows={3} value={formData.reason} onChange={(e)=>setFormData({...formData, reason: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-purple-500" placeholder="เหตุผลการขอลา..." />
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 flex justify-end gap-4">
              <button onClick={() => setShowModal(false)} className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 hover:text-slate-600 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-purple-100 hover:bg-purple-700 active:scale-95 transition-all tracking-widest">
                {saving ? "SAVING..." : "SUBMIT REQUEST"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
