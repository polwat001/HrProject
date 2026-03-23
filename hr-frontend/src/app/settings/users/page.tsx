"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import UserAssignments from "@/components/permissions/UserAssignments";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // จำลองการดึงข้อมูล Users
    setTimeout(() => {
      setUsers([
        { id: 1, username: "admin", firstname_th: "สมชาย", lastname_th: "แอดมิน", role_name: "Super Admin", user_status: "active", is_super_admin: true },
        { id: 2, username: "hr_user", firstname_th: "สมหญิง", lastname_th: "ใจดี", role_name: "HR Manager", user_status: "active", is_super_admin: false },
        { id: 3, username: "employee01", firstname_th: "มานะ", lastname_th: "ขยัน", role_name: "Employee", user_status: "active", is_super_admin: false },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">User Assignments</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">จัดการบัญชีผู้ใช้งานระบบและกำหนด Role</p>
      </div>
      <UserAssignments users={users} />
    </div>
  );
}