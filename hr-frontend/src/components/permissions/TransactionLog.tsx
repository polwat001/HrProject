"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Search, User, ShieldAlert, FileEdit, LogIn } from "lucide-react";

// ==========================================
// 📦 MOCK DATA: Transaction Logs
// ==========================================
const MOCK_LOGS = [
  {
    id: 1,
    user: "superadmin",
    action: "Update Permissions",
    module: "Role Management",
    details: "แก้ไขสิทธิ์การเข้าถึงเมนู 'Payroll' สำหรับกลุ่ม HR Manager",
    ip: "192.168.1.105",
    timestamp: "2026-03-24 10:45:22",
    type: "security"
  },
  {
    id: 2,
    user: "superadmin",
    action: "Login Success",
    module: "Auth",
    details: "เข้าสู่ระบบสำเร็จ",
    ip: "192.168.1.105",
    timestamp: "2026-03-24 09:00:15",
    type: "login"
  },
  {
    id: 3,
    user: "hrmanager",
    action: "Edit Employee",
    module: "Employees",
    details: "แก้ไขข้อมูลพนักงาน: สมชาย มั่นคง (EMP-001)",
    ip: "192.168.1.110",
    timestamp: "2026-03-23 15:20:40",
    type: "edit"
  },
  {
    id: 4,
    user: "superadmin",
    action: "Add New User",
    module: "User Assignments",
    details: "สร้างบัญชีผู้ใช้ใหม่: nadech",
    ip: "192.168.1.105",
    timestamp: "2026-03-23 11:10:05",
    type: "add"
  },
  {
    id: 5,
    user: "hrmanager",
    action: "Approve Leave",
    module: "Leaves",
    details: "อนุมัติคำขอลาพักร้อน: สมหญิง ใจดี",
    ip: "192.168.1.110",
    timestamp: "2026-03-23 08:45:12",
    type: "approve"
  }
];

export default function TransactionLog() {
  const [searchTerm, setSearchTerm] = useState("");

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'security': return <ShieldAlert className="text-red-500" size={16} />;
      case 'login': return <LogIn className="text-blue-500" size={16} />;
      case 'edit': return <FileEdit className="text-amber-500" size={16} />;
      default: return <User className="text-slate-400" size={16} />;
    }
  };

  const filteredLogs = MOCK_LOGS.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-sm border-slate-200 overflow-hidden animate-in fade-in">
      <CardHeader className="bg-slate-50/50 border-b p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-slate-500" /> ประวัติการใช้งานระบบ (Logs)
          </CardTitle>
          
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="ค้นหาประวัติ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-200/60 border-b border-slate-300">
              <tr>
                <th className="px-6 py-3 font-bold text-slate-800">Timestamp</th>
                <th className="px-6 py-3 font-bold text-slate-800">User</th>
                <th className="px-6 py-3 font-bold text-slate-800">Action</th>
                <th className="px-6 py-3 font-bold text-slate-800">Module</th>
                <th className="px-6 py-3 font-bold text-slate-800">Details</th>
                <th className="px-6 py-3 font-bold text-slate-800">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    ไม่พบข้อมูลประวัติที่ค้นหา
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <User size={12} className="text-slate-500" />
                        </div>
                        <span className="font-bold text-slate-700">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.type)}
                        <span className="font-medium text-slate-800">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{log.ip}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}