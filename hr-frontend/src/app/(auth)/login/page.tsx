'use client';

import { useRouter } from 'next/navigation';
import { Building2, Shield, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAppStore();

  // ข้อมูลจำลองสำหรับ HR / Admin (Super Admin)
  const handleLoginAsAdmin = () => {
    const adminData = {
      id: 1,
      username: "superadmin",
      firstName: "ผู้ดูแลระบบ",
      lastName: "ส่วนกลาง",
      role_id: 1, 
      is_super_admin: true,
      email: "admin@hrgroup.com"
    };

    // จำลองตั้งค่า Store และ LocalStorage
    localStorage.setItem('hr_token', 'mock_admin_token_123');
    setUser(adminData);
    setToken('mock_admin_token_123');
    

    router.push('/dashboard');
  };

  // 📦 ข้อมูลจำลองสำหรับ พนักงาน (Employee)
  const handleLoginAsEmployee = () => {
    const employeeData = {
      id: 1, // ตรงกับ Employee ID ใน Mock Data ของหน้า Dashboard
      username: "nadech",
      firstName: "สมชาย",
      lastName: "มั่นคง",
      role_id: 4, // 4 = Employee
      is_super_admin: false,
      email: "somchai@hrgroup.com",
      position: "Senior Developer",
      department: "IT",
      employeeCode: "IT-001"
    };

    // จำลองตั้งค่า Store และ LocalStorage
    localStorage.setItem('hr_token', 'mock_employee_token_456');
    setUser(employeeData);
    setToken('mock_employee_token_456');
    
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-6">
          <div className="w-20 h-20 bg-white shadow-xl shadow-blue-100/50 rounded-3xl flex items-center justify-center border border-blue-50">
             <Building2 size={40} className="text-blue-600" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight  uppercase">
          HR Group System
        </h2>
        <p className="mt-2 text-center text-sm font-bold text-slate-500 uppercase tracking-widest">
          Demo Login Portal
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl shadow-slate-200/50 border border-slate-100 sm:rounded-[2.5rem] space-y-6">
          
          <div className="text-center mb-8">
             <h3 className="text-slate-800 font-black text-lg">เลือกสิทธิ์การเข้าใช้งาน</h3>
             <p className="text-slate-400 text-xs font-bold mt-1">คลิกที่ปุ่มด้านล่างเพื่อเข้าสู่ระบบทันที (ไม่ต้องใส่รหัสผ่าน)</p>
          </div>

          <div className="space-y-4">
            {/* ปุ่มเข้าสู่ระบบ Admin */}
            <button
              onClick={handleLoginAsAdmin}
              className="w-full flex items-center gap-5 p-5 rounded-3xl border-2 border-blue-50 hover:border-blue-600 hover:bg-blue-600 group transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-white group-hover:text-blue-600 transition-colors shadow-sm">
                <Shield size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 group-hover:text-white text-lg">Admin</h4>
              </div>
            </button>

            {/* ปุ่มเข้าสู่ระบบ Employee */}
            <button
              onClick={handleLoginAsEmployee}
              className="w-full flex items-center gap-5 p-5 rounded-3xl border-2 border-emerald-50 hover:border-emerald-500 hover:bg-emerald-500 group transition-all duration-300 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-white group-hover:text-emerald-600 transition-colors shadow-sm">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 group-hover:text-white text-lg">Employee</h4>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">For Demonstration Purposes Only</p>
          </div>

        </div>
      </div>
    </div>
  );
}