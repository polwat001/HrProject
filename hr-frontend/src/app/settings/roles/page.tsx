"use client";

import { useState, useEffect } from "react";
import { Loader, ShieldCheck } from "lucide-react";
import RoleManagement from "@/components/permissions/RoleManagement";

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    // จำลองการดึงข้อมูล Roles อ้างอิงตามระบบ Login ปัจจุบัน (Role 1, 2, 3 = Admin/HR, Role 4 = Employee)
    setTimeout(() => {
      setRoles([
        { 
          id: 1, 
          name: "Super Admin", 
          permissions: ["dashboard", "organization", "employee", "attendance", "leave", "contract", "reports", "permissions"],
          description: "ผู้ดูแลระบบสูงสุด เข้าถึงและแก้ไขได้ทุกฟังก์ชัน"
        },
        { 
          id: 2, 
          name: "HR Manager", 
          permissions: ["dashboard", "organization", "employee", "attendance", "leave", "contract", "reports"],
          description: "ผู้จัดการฝ่ายบุคคล จัดการข้อมูลพนักงานและอนุมัติรายการต่างๆ"
        },
        { 
          id: 3, 
          name: "HR Staff", 
          permissions: ["dashboard", "employee", "attendance", "leave"],
          description: "เจ้าหน้าที่บุคคล ดูแลเรื่องเวลาเข้าออกและวันลา"
        },
        { 
          id: 4, 
          name: "Employee", 
          permissions: ["dashboard", "attendance", "leave"],
          description: "พนักงานทั่วไป ใช้งานระบบ Self-Service ดูข้อมูลของตนเอง"
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Role Management</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            จัดการบทบาทผู้ใช้งานและกำหนดสิทธิ์การเข้าถึงโมดูลต่างๆ อ้างอิงตามระดับ (Role ID 1-4)
          </p>
        </div>
      </div>
      
      {/* เรียกใช้งาน Component RoleManagement และส่ง roles เข้าไป */}
      <RoleManagement roles={roles} />
    </div>
  );
}