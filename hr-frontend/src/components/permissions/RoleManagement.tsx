"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Plus, Search } from "lucide-react";

// รายการเมนูสำหรับใช้ในฟอร์ม Permission
const permissionsList = [
  { key: "user", label: "ผู้ใช้งาน" },
  { key: "role", label: "บทบาท" },
  { key: "employee", label: "พนักงาน" },
  { key: "attendance", label: "เวลาเข้างาน" },
  { key: "leave", label: "ลางาน" },
  { key: "contract", label: "สัญญาจ้าง" },
  { key: "reports", label: "รายงาน" },
];

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

export default function RoleManagement({ roles = [] }: { roles: Role[] }) {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [editData, setEditData] = useState<any>({ key: "", name: "", permissions: {} });

  // ✅ แก้ปัญหา Error ด้วยการใส่ [] เผื่อไว้ และใช้ Optional Chaining
  const filteredRoles = (roles || []).filter(r => 
    r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.name?.toLowerCase().replace(/\s/g, '_').includes(searchTerm.toLowerCase())
  );

  const handleEdit = (role: Role) => {
    setEditData({ 
      id: role.id, 
      key: role.name.toLowerCase().replace(/\s/g, '_'), 
      name: role.name 
    });
    setView('edit');
  };

  return (
    <div className="space-y-6">
      {/* Header Area */}
      {view === 'list' && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Role Management</h1>
            <p className="text-slate-500 text-sm font-medium">จัดการบทบาทและกำหนดสิทธิ์การใช้งาน</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อบทบาท..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-64 shadow-sm"
              />
            </div>
            <button 
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-red-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest"
            >
              <Plus size={18} /> เพิ่ม Role
            </button>
          </div>
        </div>
      )}

      {view === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-200/60 border-b border-slate-300">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-800">Role Key</th>
                <th className="px-6 py-4 font-bold text-slate-800">Role Name</th>
                <th className="px-6 py-4 font-bold text-slate-800 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRoles.length > 0 ? (
                filteredRoles.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-[14px] ">{r.name.toLowerCase().replace(/\s/g, '_')}</td>
                    <td className="px-6 py-4 text-slate-700 ">{r.name}</td>
                    <td className="px-6 py-4 flex justify-center gap-4">
                      <button 
                        onClick={() => handleEdit(r)} 
                        className="text-red-500 hover:text-red-700 transition-all border border-red-500 rounded p-1.5 hover:bg-red-50 shadow-sm"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center text-slate-400 font-medium ">
                    ไม่พบข้อมูลบทบาทที่คุณค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* View: Add/Edit Form (คงเดิมตามภาพที่ต้องการ) */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-bottom-4">
           <h2 className="text-xl font-black text-slate-800 mb-6 border-b pb-4 uppercase tracking-tight">
            {view === 'add' ? 'เพิ่มบทบาทใหม่' : 'แก้ไขบทบาท'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">หน้าที่หลัก (Role Key)</label>
              <input 
                type="text" 
                className="w-full p-2.5 border border-slate-300 rounded-md bg-slate-50 text-slate-400 font-mono cursor-not-allowed" 
                value={editData.key} 
                readOnly 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">ชื่อบทบาท (Role Name)</label>
              <input 
                type="text" 
                className="w-full p-2.5 border border-slate-300 rounded-md outline-none focus:ring-1 focus:ring-blue-500 font-bold" 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-black text-slate-600 uppercase text-[10px] tracking-widest">Menu System</th>
                  {['ดู', 'สร้าง', 'อัปเดต', 'ลบ'].map(h => (
                    <th key={h} className="px-4 py-4 text-center font-black text-slate-600 text-[10px] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsList.map(m => (
                  <tr key={m.key} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-700">{m.label}</td>
                    {[1, 2, 3, 4].map(i => (
                      <td key={i} className="text-center px-4 py-3">
                        <Checkbox className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 w-5 h-5 rounded-md" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 mt-10">
            <button 
              onClick={() => setView('list')} 
              className="bg-[#00e600] hover:bg-green-500 text-white font-black py-2.5 px-10 rounded-md transition-all shadow-lg shadow-green-100 uppercase text-xs tracking-widest"
            >
              ตกลง
            </button>
            <button 
              onClick={() => setView('list')} 
              className="bg-[#ff0000] hover:bg-red-600 text-white font-black py-2.5 px-10 rounded-md transition-all shadow-lg shadow-red-100 uppercase text-xs tracking-widest"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}