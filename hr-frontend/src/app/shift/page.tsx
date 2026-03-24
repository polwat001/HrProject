"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { 
  CalendarClock, Plus, Search, Edit2, Trash2, Eye, 
  X, Users, Clock, CalendarDays, Briefcase, Building, 
  AlertTriangle, CheckCircle 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ==========================================
// 📦 MOCK DATA (ปรับเพิ่ม user_id ให้ตรงกับระบบจำลอง)
// ==========================================
const MOCK_EMPLOYEES = [
  { id: 1, user_id: 4, name: "สมชาย มั่นคง", code: "IT-001", department: "IT" }, // สมมติให้ user_id: 4 คือสมชาย (พนักงานทั่วไป)
  { id: 2, user_id: 5, name: "สมหญิง ใจดี", code: "HR-001", department: "Human Resources" },
  { id: 3, user_id: 6, name: "มานะ อดทน", code: "OP-001", department: "Operations" },
  { id: 4, user_id: 7, name: "วิชัย เก่งกาจ", code: "MK-001", department: "Marketing" },
  { id: 5, user_id: 8, name: "สุดา สวยงาม", code: "FN-001", department: "Finance" },
  { id: 6, user_id: 9, name: "สมศักดิ์ รักดี", code: "OP-002", department: "Operations" },
];

const MOCK_SHIFTS = [
  { 
    id: 1, 
    name: "กะเช้า (Morning Shift)", 
    date: new Date().toISOString().split("T")[0], 
    startTime: "08:00", 
    endTime: "17:00", 
    employeeIds: [1, 2, 3] 
  },
  { 
    id: 2, 
    name: "กะบ่าย (Afternoon Shift)", 
    date: new Date().toISOString().split("T")[0], 
    startTime: "13:00", 
    endTime: "22:00", 
    employeeIds: [4, 6, 1] // สมชาย (1) มีกะนี้ด้วย
  },
  { 
    id: 3, 
    name: "กะดึก (Night Shift)", 
    date: "2026-03-25", 
    startTime: "22:00", 
    endTime: "07:00", 
    employeeIds: [5] 
  },
];

const EMPTY_SHIFT = {
  id: 0,
  name: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "08:00",
  endTime: "17:00",
  employeeIds: [] as number[]
};

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================
export default function ShiftManagementPage() {
  const { user } = useAppStore();
  const [shifts, setShifts] = useState(MOCK_SHIFTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Modal States
  const [viewModal, setViewModal] = useState<any | null>(null); 
  const [formModal, setFormModal] = useState<{ show: boolean, data: typeof EMPTY_SHIFT }>({ show: false, data: EMPTY_SHIFT });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ✅ เช็คสิทธิ์การใช้งาน (Admin/HR vs Employee)
  const roleId = user ? Number(user.role_id || user.is_super_admin) : 4; 
  const isAdminOrHR = roleId === 1 || roleId === 2 || roleId === 3 || user?.is_super_admin;

  // หา ID พนักงานปัจจุบัน (สำหรับการจำลอง ให้หาจาก user_id)
  const currentEmp = useMemo(() => {
    return MOCK_EMPLOYEES.find(e => Number(e.user_id) === Number(user?.id)) || MOCK_EMPLOYEES[0];
  }, [user]);

  // ================= LOGIC: FILTER SHIFTS =================
  const filteredShifts = useMemo(() => {
    let baseShifts = shifts;

    // 🔒 ถ้าเป็นพนักงาน ให้เห็นเฉพาะกะที่มี ID ของตัวเอง
    if (!isAdminOrHR && currentEmp) {
      baseShifts = baseShifts.filter(s => s.employeeIds.includes(currentEmp.id));
    }

    // กรองตามการค้นหาและวันที่
    return baseShifts.filter(s => {
      const matchName = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDate = filterDate ? s.date === filterDate : true;
      return matchName && matchDate;
    });
  }, [shifts, searchQuery, filterDate, isAdminOrHR, currentEmp]);

  // ================= ACTIONS =================
  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModal.data.name || !formModal.data.date || !formModal.data.startTime || !formModal.data.endTime) return;
    if (formModal.data.id === 0) setShifts([{ ...formModal.data, id: Date.now() }, ...shifts]);
    else setShifts(shifts.map(s => s.id === formModal.data.id ? formModal.data : s));
    setFormModal({ show: false, data: EMPTY_SHIFT });
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setShifts(shifts.filter(s => s.id !== deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  const toggleEmployeeSelection = (empId: number) => {
    setFormModal(prev => {
      const isSelected = prev.data.employeeIds.includes(empId);
      const newIds = isSelected ? prev.data.employeeIds.filter(id => id !== empId) : [...prev.data.employeeIds, empId];
      return { ...prev, data: { ...prev.data, employeeIds: newIds } };
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <CalendarClock className="text-blue-600" size={32} /> 
            {isAdminOrHR ? "Shift Management" : "My Shifts"}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {isAdminOrHR ? "จัดการกะการทำงานและจัดตารางพนักงาน (Admin)" : "ดูตารางกะการทำงานของคุณ"}
          </p>
        </div>
        
        {/* 🔒 แสดงปุ่มเพิ่มกะ เฉพาะ Admin/HR */}
        {isAdminOrHR && (
          <button 
            onClick={() => setFormModal({ show: true, data: EMPTY_SHIFT })}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest w-full md:w-auto justify-center"
          >
            <Plus size={18} /> เพิ่มกะการทำงาน
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อกะ..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-slate-600"
          />
          {filterDate && (
            <button onClick={() => setFilterDate("")} className="absolute right-10 top-3 text-slate-400 hover:text-red-500">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🟢 VIEW: EMPLOYEE (พนักงานเห็นรูปแบบ Card) */}
      {/* ========================================================= */}
      {!isAdminOrHR && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShifts.map((shift) => (
            <div key={shift.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-blue-50 text-blue-600 px-4 py-2 rounded-bl-[1.5rem] font-black text-[10px] uppercase tracking-widest">
                My Shift
              </div>
              <CalendarClock size={40} className="text-blue-100 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-slate-800 mb-1">{shift.name}</h3>
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-50">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <CalendarDays size={16} className="text-blue-500" />
                  {new Date(shift.date).toLocaleDateString("th-TH", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Clock size={16} className="text-indigo-500" />
                  {shift.startTime} - {shift.endTime} น.
                </p>
              </div>
            </div>
          ))}
          {filteredShifts.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <CalendarClock className="mx-auto text-slate-200 mb-3" size={64} />
               <p className="text-slate-400 font-black uppercase tracking-widest text-sm">คุณไม่มีกะการทำงานในช้วงเวลานี้</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 🔴 VIEW: ADMIN / HR (ตารางจัดการแบบเต็มรูปแบบ) */}
      {/* ========================================================= */}
      {isAdminOrHR && (
        <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="py-5 px-8 text-left">ชื่อกะ (Shift Name)</th>
                    <th className="text-center px-4">วันที่ (Date)</th>
                    <th className="text-center px-4">เวลา (Time)</th>
                    <th className="text-center px-4">จำนวนพนักงาน</th>
                    <th className="text-center px-8">จัดการ (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {filteredShifts.map((shift) => (
                    <tr key={shift.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="py-4 px-8 font-black text-slate-800 text-base">{shift.name}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-600">
                        <div className="flex items-center justify-center gap-2">
                          <CalendarDays size={14} className="text-blue-500" />
                          {new Date(shift.date).toLocaleDateString("th-TH", { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs border border-slate-200">
                          <Clock size={12} className="text-indigo-500" /> {shift.startTime} - {shift.endTime}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button 
                          onClick={() => setViewModal(shift)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl font-black text-xs transition-colors cursor-pointer border border-blue-100"
                        >
                          <Users size={12} /> {shift.employeeIds.length} คน
                        </button>
                      </td>
                      <td className="py-4 px-8 text-center">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewModal(shift)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white rounded-lg transition-all shadow-sm" title="ดูรายชื่อ"><Eye size={16} /></button>
                          <button onClick={() => setFormModal({ show: true, data: shift })} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm" title="แก้ไข"><Edit2 size={16} /></button>
                          <button onClick={() => setDeleteConfirm(shift.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm" title="ลบ"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredShifts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <CalendarClock className="mx-auto text-slate-200 mb-3" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest">ไม่พบข้อมูลกะการทำงาน</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* MODALS (ทำงานเฉพาะแอดมินเวลากดจัดการ) */}
      {/* ========================================================= */}
      
      {/* Modal ดูรายชื่อพนักงาน */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setViewModal(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">{viewModal.name}</h3>
                <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-2">
                  <CalendarDays size={12} /> {new Date(viewModal.date).toLocaleDateString("th-TH")} | <Clock size={12}/> {viewModal.startTime} - {viewModal.endTime}
                </p>
              </div>
              <button onClick={() => setViewModal(null)} className="p-2 bg-white hover:bg-slate-200 rounded-xl text-slate-400 transition-colors shadow-sm"><X size={20}/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">รายชื่อพนักงานในกะ ({viewModal.employeeIds.length} คน)</h4>
              <div className="space-y-3">
                {viewModal.employeeIds.map((empId: number) => {
                  const emp = MOCK_EMPLOYEES.find(e => e.id === empId);
                  if (!emp) return null;
                  return (
                    <div key={emp.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5">
                           <Briefcase size={10} className="text-indigo-400"/> {emp.department}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal จัดการกะ (เพิ่ม/แก้ไข) */}
      {formModal.show && isAdminOrHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setFormModal({ show: false, data: EMPTY_SHIFT })} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
            {/* ส่วนโค้ด Modal ฟอร์ม (คงเดิมตามฉบับแอดมิน) */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                {formModal.data.id === 0 ? <><Plus className="text-blue-600"/> สร้างกะใหม่</> : <><Edit2 className="text-blue-600"/> แก้ไขข้อมูลกะ</>}
              </h3>
              <button onClick={() => setFormModal({ show: false, data: EMPTY_SHIFT })} className="p-2 bg-white hover:bg-slate-200 rounded-xl text-slate-400 transition-colors shadow-sm"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveShift} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อกะ (Shift Name) <span className="text-red-500">*</span></label>
                  <input type="text" required placeholder="เช่น กะเช้า, กะดึก..." value={formModal.data.name} onChange={(e) => setFormModal(p => ({...p, data: {...p.data, name: e.target.value}}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่ (Date) <span className="text-red-500">*</span></label>
                  <input type="date" required value={formModal.data.date} onChange={(e) => setFormModal(p => ({...p, data: {...p.data, date: e.target.value}}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เวลาเข้า <span className="text-red-500">*</span></label>
                    <input type="time" required value={formModal.data.startTime} onChange={(e) => setFormModal(p => ({...p, data: {...p.data, startTime: e.target.value}}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เวลาออก <span className="text-red-500">*</span></label>
                    <input type="time" required value={formModal.data.endTime} onChange={(e) => setFormModal(p => ({...p, data: {...p.data, endTime: e.target.value}}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between items-end">
                  <span>เลือกพนักงานเข้ากะ ({formModal.data.employeeIds.length} คน)</span>
                </label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 max-h-48 overflow-y-auto">
                  {MOCK_EMPLOYEES.map(emp => (
                    <label key={emp.id} className="flex items-center gap-4 p-3 border-b border-slate-200 last:border-0 hover:bg-blue-50 cursor-pointer transition-colors">
                      <input type="checkbox" checked={formModal.data.employeeIds.includes(emp.id)} onChange={() => toggleEmployeeSelection(emp.id)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ml-2" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{emp.name}</p>
                        <p className="text-[10px] font-black text-slate-400 tracking-wider flex items-center gap-1 mt-0.5"><Building size={10} /> {emp.department}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                <button type="button" onClick={() => setFormModal({ show: false, data: EMPTY_SHIFT })} className="flex-1 py-3 text-slate-500 font-black tracking-widest uppercase text-xs hover:bg-slate-100 rounded-xl transition-all">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-black tracking-widest uppercase text-xs rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                  <CheckCircle size={16} /> บันทึกข้อมูลกะ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ลบ (ทำงานเฉพาะแอดมิน) */}
      {deleteConfirm && isAdminOrHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">ยืนยันการลบ</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">คุณแน่ใจหรือไม่ว่าต้องการลบกะการทำงานนี้? พนักงานที่อยู่ในกะจะถูกถอดออกทั้งหมด</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all">ยกเลิก</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 transition-all">ลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}