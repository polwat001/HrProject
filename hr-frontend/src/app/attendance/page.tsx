'use client';

import { useAppStore } from '@/store/useAppStore';
import AdminAttendance from './components/AdminAttendance';
import EmployeeAttendance from './components/EmployeeAttendance';

export default function AttendancePage() {
  const { user } = useAppStore();
  
  // เช็คสิทธิ์จาก Role ID 
  // (จาก Mock Data หรือโครงสร้างที่คุณใช้ Role 4 คือ พนักงานปกติ)
  const roleId = Number(user?.role_id || user?.is_super_admin);
  const isEmployee = roleId === 4;

  // ถ้าเป็นพนักงานให้เรนเดอร์หน้า EmployeeAttendance 
  // ถ้าเป็นแอดมิน/HR ให้เรนเดอร์หน้า AdminAttendance
  return isEmployee ? <EmployeeAttendance /> : <AdminAttendance />;
}





