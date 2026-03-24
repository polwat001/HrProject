"use client";

import { useState } from "react";
import { Edit, Plus, Search } from "lucide-react";

interface User {
  id: number;
  username: string;
  firstname_th: string;
  lastname_th: string;
  role_name: string;
  user_status: string;
  email?: string;
}

export default function UserAssignments({ users = [] }: { users: User[] }) {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState<any>({ fullName: "", email: "", role: "user", status: "Active" });

  // ✅ แก้ปัญหาข้อมูลไม่ขึ้น: ใส่ [] ป้องกัน undefined และทำ Filter
  const filteredUsers = (users || []).filter(u => 
    u.firstname_th?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastname_th?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (u: User) => {
    setFormData({ 
      fullName: `${u.firstname_th} ${u.lastname_th}`, 
      email: u.email || `${u.username}@ryobi.co.th`, 
      role: u.role_name || "admin", 
      status: u.user_status === 'active' ? 'Active' : 'Inactive' 
    });
    setView('edit');
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      {view === 'list' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">User Assignments</h1>
            <p className="text-slate-500 text-sm font-medium">จัดการบัญชีผู้ใช้งานและผูกบทบาท</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาผู้ใช้งาน..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-64 shadow-sm" 
              />
            </div>
            <button 
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest"
            >
              <Plus size={18} /> เพิ่มผู้ใช้งาน
            </button>
          </div>
        </div>
      )}

      {view === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto p-4">
            <table className="w-full text-sm text-left border-collapse border border-slate-100 rounded-lg overflow-hidden">
              <thead className="bg-slate-200/80 border-b border-slate-300">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider">Full Name</th>
                  <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider">Email</th>
                  <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider">Roles</th>
                  <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{u.firstname_th} {u.lastname_th}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{u.email || `${u.username}@ryobi.co.th`}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md text-[10px] font-black uppercase text-slate-600 border border-slate-200">
                          {u.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${u.user_status === 'active' ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-50'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.user_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                          {u.user_status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleEdit(u)} 
                          className="text-red-500 hover:text-red-700 transition-all border border-red-500 rounded-md p-1.5 hover:bg-red-50 shadow-sm active:scale-90"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-medium italic bg-slate-50/30">
                       ไม่พบข้อมูลผู้ใช้งานที่ค้นหา หรือ ไม่มีข้อมูลในระบบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View: Add/Edit Form (คงเดิมตามภาพที่ต้องการ) */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 animate-in fade-in zoom-in-95">
          <h2 className="text-2xl font-black text-slate-800 mb-8 border-b pb-4 uppercase tracking-tighter">
            {view === 'add' ? 'เพิ่มผู้ใช้ใหม่' : 'แก้ไขข้อมูลผู้ใช้'}
          </h2>
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อ-นามสกุล</label>
              <input type="text" className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold" value={formData.fullName} onChange={(e)=>setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">อีเมล</label>
              <input type="email" className={`w-full p-3 border border-slate-300 rounded-xl outline-none transition-all ${view === 'edit' ? 'bg-slate-50 text-slate-400' : 'focus:ring-2 focus:ring-blue-500'}`} value={formData.email} disabled={view === 'edit'} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                {view === 'add' ? 'รหัสผ่านแรกเข้า' : 'รหัสผ่านใหม่ (เว้นว่างไว้หากไม่ต้องการเปลี่ยน)'}
              </label>
              <input type="password" placeholder="••••••••" className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">บทบาทพนักงาน</label>
                <select className="w-full p-3 border border-slate-300 rounded-xl bg-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.role} onChange={(e)=>setFormData({...formData, role: e.target.value})}>
                  <option value="admin">admin</option><option value="user">user</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">สถานะบัญชี</label>
                <select className="w-full p-3 border border-slate-300 rounded-xl bg-white font-bold outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.status} onChange={(e)=>setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active (ปกติ)</option><option value="Inactive">Inactive (ระงับ)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 pt-8">
              <button onClick={() => setView('list')} className="bg-[#00e600] hover:bg-green-500 text-white font-black py-3 px-12 rounded-xl transition-all shadow-lg shadow-green-100 uppercase text-xs tracking-widest">ตกลง</button>
              <button onClick={() => setView('list')} className="bg-[#ff0000] hover:bg-red-600 text-white font-black py-3 px-12 rounded-xl transition-all shadow-lg shadow-red-100 uppercase text-xs tracking-widest">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}