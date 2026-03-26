"use client";

import { useAppStore } from "@/store/useAppStore";
import { Loader } from "lucide-react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import EmployeeDashboard from "@/components/dashboard/EmployeeSelfService";

export default function DashboardPage() {
  const { user, loading } = useAppStore();
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  
  const roleId = Number(user.role_id);
  const isAdmin = roleId === 1 || roleId === 2 || roleId === 3 || user.is_super_admin;

  return (
    <div className="p-6">
      {isAdmin ? (
        <AdminDashboard user={user} />
      ) : (
       
        <EmployeeDashboard user={user} />
      )}
    </div>
  );
}