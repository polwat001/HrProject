"use client";

import { useAppStore } from "@/store/useAppStore";
import { Loader } from "lucide-react";
// สมมติว่าคุณแยก Component ไว้
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeSelfService";

export default function DashboardPage() {
  const { user, loading } = useAppStore();

  // 1. ป้องกันหน้าขาวระหว่างรอโหลดข้อมูล User
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // 2. เช็ค Role ID ตามที่คุณตั้งไว้ (Admin=1,2,3 / Employee=4)
  const roleId = Number(user.role_id);
  const isAdmin = roleId === 1 || roleId === 2 || roleId === 3 || user.is_super_admin;

  return (
    <div className="p-6">
      {isAdmin ? (
        <AdminDashboard user={user} />
      ) : (
        /* ✅ ต้องมั่นใจว่ามี Component นี้ และไม่ได้พังข้างใน */
        <EmployeeDashboard user={user} />
      )}
    </div>
  );
}