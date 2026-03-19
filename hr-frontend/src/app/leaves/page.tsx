'use client';

import { useAppStore } from '@/store/useAppStore';
import AdminLeaves from './components/AdminLeaves';
import EmployeeLeaves from './components/EmployeeLeaves';

export default function LeavesPage() {
  const { user } = useAppStore();
  
  // เช็คสิทธิ์จาก Role ID (Role 4 = พนักงาน)
  const roleId = Number(user?.role_id || user?.is_super_admin);
  const isEmployee = roleId === 4;

  // สลับหน้าจอตามสิทธิ์ผู้ใช้งาน
  return isEmployee ? <EmployeeLeaves /> : <AdminLeaves />;
}