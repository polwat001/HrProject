'use client';

import { useAppStore } from '@/store/useAppStore';
import AdminOvertime from './components/AdminOvertime';
import EmployeeOvertime from './components/EmployeeOvertime';

export default function OvertimePage() {
  const { user } = useAppStore();
  
  // เช็คสิทธิ์
  const roleId = Number(user?.role_id || user?.is_super_admin);
  const isEmployee = roleId === 4;

  // สลับหน้าจอตามสิทธิ์
  return isEmployee ? <EmployeeOvertime /> : <AdminOvertime />;
}
