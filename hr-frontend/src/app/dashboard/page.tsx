"use client";

import { useAppStore } from "@/store/useAppStore";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import EmployeeSelfService from "@/components/dashboard/EmployeeSelfService";

export default function DashboardPage() {
  const { user } = useAppStore();
  
  // Safe Fallback: ถ้าหา user ไม่เจอ ให้ถือว่าเป็นสิทธิ์พนักงาน (Role 4) เพื่อความปลอดภัย
  const activeUser = user || { id: 4, role_id: 4, username: "Guest", firstName: "Guest" };
  
  const roleId = activeUser ? Number(activeUser.role_id || activeUser.is_super_admin) : 4;
  const isEmployee = roleId === 4;

  // Render ตามสิทธิ์ผู้ใช้งาน
  return isEmployee ? (
    <EmployeeSelfService user={activeUser} />
  ) : (
    <AdminDashboard user={activeUser} />
  );
}