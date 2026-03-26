'use client';

import { useAppStore } from '@/store/useAppStore';
import AdminShift from './components/AdminShift';
import EmployeeShift from './components/EmployeeShift';

export default function ShiftPage() {
  const { user } = useAppStore();
  
  // เช็คสิทธิ์
  const roleId = Number(user?.role_id || user?.is_super_admin);
  const isEmployee = roleId === 4;

  // สลับหน้าจอตามสิทธิ์
  return isEmployee ? <EmployeeShift /> : <AdminShift />;
}