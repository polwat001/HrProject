"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { 
  Shield, Search, Edit2, Trash2, AlertTriangle, UserCheck, 
  UserX, UserPlus, X, Users, CheckCircle2, XCircle, LayoutGrid
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// ==========================================
// 📦 MOCK DATA: อิงจาก 2 Role หลักของระบบ
// ==========================================
const MOCK_ROLE_GROUPS = [
  { id: 1, name: "Admin / HR", badge: "bg-blue-100 text-blue-700", description: "ผู้ดูแลระบบและฝ่ายบุคคล (เข้าถึงและจัดการได้ทุกเมนู)" },
  { id: 4, name: "Employee", badge: "bg-slate-100 text-slate-700", description: "พนักงานทั่วไป (ระบบ Self-Service ดูเฉพาะข้อมูลตัวเอง)" },
];

const MOCK_USERS = [
  { id: 1, employee_code: "EMP-000", name: "ผู้ดูแลระบบ", email: "admin@company.com", role_id: 1, status: "active" },
  { id: 2, employee_code: "EMP-HR-01", name: "สมศรี งานบุคคล", email: "somsri.hr@company.com", role_id: 1, status: "active" },
  { id: 3, employee_code: "EMP-001", name: "สมชาย มั่นคง", email: "somchai@company.com", role_id: 4, status: "active" },
  { id: 4, employee_code: "EMP-002", name: "สมหญิง ใจดี", email: "somying@company.com", role_id: 4, status: "inactive" },
];

const PERMISSION_MATRIX = [
  { module: "Dashboard", admin: "ดูภาพรวมทั้งหมด", emp: "ดูสถิติส่วนตัว" },
  { module: "Organization & Employees", admin: "จัดการ เพิ่ม/ลบ/แก้ไข", emp: "เข้าถึงไม่ได้ (ซ่อนเมนู)" },
  { module: "Attendance (เวลาเข้างาน)", admin: "ดูและแก้ไขของทุกคน", emp: "ดูเฉพาะของตัวเอง" },
  { module: "OT & Leaves (โอที/ลางาน)", admin: "จัดการและกด อนุมัติ/ปฏิเสธ", emp: "ดูโควต้าและ กดส่งคำขอ (Request)" },
  { module: "Payroll (เงินเดือน)", admin: "ดูข้อมูลทั้งหมดและดาวน์โหลดสลิป", emp: "ดูและดาวน์โหลดสลิปของตัวเอง" },
  { module: "Reports (รายงาน)", admin: "Export ข้อมูลได้ทั้งหมด", emp: "เข้าถึงไม่ได้ (ซ่อนเมนู)" },
];

export default function UserPermissionsPage() {
  const { currentCompanyId } = useAppStore();
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  const [users, setUsers] = useState<any[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<number | "all">("all");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", role_id: 4, status: "active" });

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name.includes(searchQuery) || u.email.includes(searchQuery);
      const matchRole = filterRole === "all" ? true : u.role_id === filterRole;
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, filterRole]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = { id: Math.random(), employee_code: "EMP-NEW", ...formData };
    setUsers([newUser, ...users]);
    setShowModal(false);
    setFormData({ name: "", email: "", role_id: 4, status: "active" });
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">User & Permissions</h1>
        <p className="text-slate-500 font-bold ml-1 mt-1">จัดการผู้ใช้งานและกลุ่มสิทธิ์การเข้าถึง (Role Groups)</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-4 border-b-2 border-slate-200/60 pb-px">
        <button 
          onClick={() => setActiveTab("users")}
          className={`pb-4 px-4 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'users' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="flex items-center gap-2"><Users size={18}/> ผู้ใช้งาน (Users)</span>
          {activeTab === 'users' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("roles")}
          className={`pb-4 px-4 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'roles' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <span className="flex items-center gap-2"><Shield size={18}/> กลุ่มสิทธิ์ (Role Groups)</span>
          {activeTab === 'roles' && <div className="absolute bottom-[-2px] left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
        </button>
      </div>

      {/* ==========================================
          TAB 1: USERS (หน้าจัดการผู้ใช้งาน)
          ========================================== */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Filters & Actions */}
          <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex flex-1 gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" placeholder="ค้นหาชื่อ หรือ อีเมล..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <select 
                value={filterRole} onChange={(e) => setFilterRole(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="w-48 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="all">ทุกกลุ่มสิทธิ์</option>
                {MOCK_ROLE_GROUPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 text-xs tracking-widest uppercase shrink-0">
              <UserPlus size={18} /> เพิ่มผู้ใช้งาน
            </button>
          </div>

          {/* Users Table */}
          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="py-6 px-8">ผู้ใช้งาน (User)</th>
                    <th className="py-6 px-6">กลุ่มสิทธิ์ (Role Group)</th>
                    <th className="py-6 px-6 text-center">สถานะ (Status)</th>
                    <th className="py-6 px-8 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {filteredUsers.map(u => {
                    const role = MOCK_ROLE_GROUPS.find(r => r.id === u.role_id);
                    return (
                      <tr key={u.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-600 shadow-sm">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 leading-tight">{u.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">{u.email} • {u.employee_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${role?.badge}`}>
                            {role?.name}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-center">
                          {u.status === 'active' 
                            ? <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-md uppercase tracking-wider"><UserCheck size={14}/> Active</span>
                            : <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-md uppercase tracking-wider"><UserX size={14}/> Inactive</span>
                          }
                        </td>
                        <td className="py-5 px-8 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all active:scale-90" title="แก้ไข"><Edit2 size={16} /></button>
                            <button className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all active:scale-90" title="ลบ"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-16">
                        <AlertTriangle className="mx-auto text-slate-300 mb-3" size={48} />
                        <p className="text-slate-400 font-black uppercase tracking-widest">ไม่พบผู้ใช้งาน</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==========================================
          TAB 2: ROLE GROUPS (หน้าตารางสิทธิ์)
          ========================================== */}
      {activeTab === "roles" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_ROLE_GROUPS.map(role => (
              <div key={role.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex gap-4 items-start hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-2xl shrink-0 ${role.id === 1 ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                  <Shield size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{role.name}</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Role ID: {role.id}</p>
                  <p className="text-sm font-medium text-slate-600 mt-3 leading-relaxed">{role.description}</p>
                </div>
              </div>
            ))}
          </div>

          <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white mt-8">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="py-6 px-8 text-sm font-black uppercase tracking-widest italic flex items-center gap-2"><LayoutGrid size={18}/> Modules / Features</th>
                    <th className="py-6 px-6 text-center text-[10px] font-black uppercase tracking-widest text-blue-300">Admin / HR (Role 1)</th>
                    <th className="py-6 px-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Employee (Role 4)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERMISSION_MATRIX.map((perm, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-8 font-black text-slate-700 text-sm">{perm.module}</td>
                      <td className="py-5 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                          <CheckCircle2 size={14}/> {perm.admin}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-center">
                        {perm.emp.includes("เข้าถึงไม่ได้") ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold border border-slate-200">
                            <XCircle size={14}/> {perm.emp}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                            <CheckCircle2 size={14}/> {perm.emp}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ==========================================
          MODAL (เพิ่มผู้ใช้งาน)
          ========================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter italic">
                <UserPlus size={24} className="text-blue-600"/> เพิ่มผู้ใช้งาน
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm transition-all"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-2 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="สมชาย มั่นคง" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">อีเมล (ใช้ล็อกอิน)</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full mt-2 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="employee@company.com" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">กลุ่มสิทธิ์ (Role Group)</label>
                <select value={formData.role_id} onChange={(e) => setFormData({...formData, role_id: Number(e.target.value)})} className="w-full mt-2 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  {MOCK_ROLE_GROUPS.map(r => <option key={r.id} value={r.id}>{r.name} (Role {r.id})</option>)}
                </select>
                <p className="text-[10px] text-blue-500 font-bold mt-2 ml-1 italic">* ระบบจะปรับเปลี่ยนเมนูให้พนักงานโดยอัตโนมัติตามสิทธิ์ที่เลือก</p>
              </div>
              
              <div className="flex gap-3 pt-6 border-t border-slate-50 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 text-slate-400 font-black tracking-widest uppercase text-[10px] hover:bg-slate-100 rounded-2xl transition-all">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3.5 bg-blue-600 text-white font-black tracking-widest uppercase text-[10px] rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}