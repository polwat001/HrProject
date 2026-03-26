"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Save,
  CalendarDays,
  Clock,
  Users,
  Building,
  Trash2,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAppStore } from "@/store/useAppStore";

import { MOCK_SHIFT_EMPLOYEES } from "@/mocks/shiftData";

export default function EditShiftPage() {
  const params = useParams();
  const router = useRouter();
  
  
  const { shifts } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [shiftData, setShiftData] = useState<any>(null);

  
  const [searchEmp, setSearchEmp] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    
    const shiftIdFromUrl = String(params?.id);
    
    
    const foundShift = shifts.find((s) => String(s.id) === shiftIdFromUrl);
    
    if (foundShift) {
      setShiftData({ ...foundShift });
    }
    setLoading(false);
  }, [params?.id, shifts]);

  
  const employeesInShift = useMemo(() => {
    if (!shiftData || !shiftData.employeeIds) return [];
    
    return MOCK_SHIFT_EMPLOYEES.filter((emp) =>
      shiftData.employeeIds.includes(emp.id),
    ).filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchEmp.toLowerCase()) ||
        emp.code.toLowerCase().includes(searchEmp.toLowerCase()),
    );
  }, [shiftData, searchEmp]);

  
  const totalPages = Math.ceil(employeesInShift.length / itemsPerPage);
  const paginatedEmployees = employeesInShift.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  
  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages = [1, 2, 3, 4, 5, "...", totalPages];
      } else if (currentPage >= totalPages - 3) {
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      }
    }
    return pages;
  };

  
  const handleRemoveEmployee = (empId: number) => {
    if (confirm("ต้องการนำพนักงานคนนี้ออกจากกะใช่หรือไม่?")) {
      setShiftData((prev: any) => ({
        ...prev,
        employeeIds: prev.employeeIds.filter((id: number) => id !== empId),
      }));
    }
  };

  const handleSave = () => {
    alert("✅ บันทึกการแก้ไขข้อมูลสำเร็จ!");
    router.push("/shift"); 
  };

  if (loading)
    return (
      <div className="p-20 text-center text-slate-400 font-black">
        Loading...
      </div>
    );
  if (!shiftData)
    return (
      <div className="p-20 text-center text-red-500 font-black">
        ไม่พบข้อมูลกะนี้
      </div>
    );

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50 pb-24">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/shift")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Edit Shift Details
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              แก้ไขรายละเอียดและรายชื่อพนักงาน
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all font-black text-sm uppercase tracking-widest"
        >
          <Save size={18} /> บันทึกข้อมูล
        </button>
      </div>

      <div className=" gap-6">
        
        <div className=" space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <Building size={20} />
              </div>
              <div>
                <p className="text-base font-black text-slate-400 uppercase tracking-widest">
                  แผนก  {shiftData.department}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-base font-black text-slate-500 uppercase tracking-widest ml-1">
                ชื่อกะ
              </label>
              <input
                type="text"
                value={shiftData.name}
                onChange={(e) =>
                  setShiftData({ ...shiftData, name: e.target.value })
                }
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-base font-black text-slate-500 uppercase tracking-widest ml-1">
                วันที่ 
              </label>
              <div className="relative">
                <CalendarDays
                  className="absolute left-3 top-3 text-blue-500"
                  size={16}
                />
                <input
                  type="date"
                  value={shiftData.date || shiftData.startDate}
                  onChange={(e) =>
                    setShiftData({ ...shiftData, date: e.target.value, startDate: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-base font-black text-slate-500 uppercase tracking-widest ml-1">
                  เวลาเข้า
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-3 text-indigo-500"
                    size={16}
                  />
                  <input
                    type="time"
                    value={shiftData.startTime}
                    onChange={(e) =>
                      setShiftData({ ...shiftData, startTime: e.target.value })
                    }
                    className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-base font-black text-slate-500 uppercase tracking-widest ml-1">
                  เวลาออก
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-3 text-indigo-500"
                    size={20}
                  />
                  <input
                    type="time"
                    value={shiftData.endTime}
                    onChange={(e) =>
                      setShiftData({ ...shiftData, endTime: e.target.value })
                    }
                    className="w-full pl-10 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="lg:mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center grid grid-cols-3 gap-4 bg-slate-50/50">
              <h4 className="font-black text-slate-800 text-lg flex items-center grid-span-1 gap-2 uppercase tracking-wide">
                <Users className="text-blue-600" /> พนักงานในกะ{" "}
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs">
                  {shiftData.employeeIds?.length || 0} คน
                </span>
              </h4>

              <div className="flex items-center gap-3 w-full col-span-2 justify-between sm:w-auto">
                <div className="relative w-2/3 ">
                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="ค้นหารหัส หรือ ชื่อ..."
                    value={searchEmp}
                    onChange={(e) => setSearchEmp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                <div>
                  <button
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    title="เพิ่มพนักงาน"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-0 flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-base uppercase tracking-widest text-slate-400">
                  <tr>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">รหัส (Code)</th>
                    <th className="py-4 px-6">ชื่อ-นามสกุล (Name)</th>
                    <th className="py-4 px-6 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-indigo-100 transition-colors group"
                    >
                      <td className="py-2 px-6 text-slate-500 uppercase tracking-widest text-base">
                        {emp.id}
                      </td>
                      <td className="py-2 px-6 text-slate-500 uppercase tracking-widest text-base">
                        {emp.code}
                      </td>
                      <td className="py-2 px-6 text-base text-slate-800">
                        {emp.name}
                      </td>
                      <td className="py-2 px-6 text-center">
                        <button
                          onClick={() => handleRemoveEmployee(emp.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                          title="นำออก"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-16 text-center text-slate-400 font-bold text-sm"
                      >
                        ไม่พบพนักงานที่ค้นหา
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            
            {totalPages > 1 && (
              <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between rounded-b-lg">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                  Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    employeesInShift.length,
                  )}{" "}
                  of {employeesInShift.length}
                </p>

                <div className="flex items-center gap-1 sm:gap-2 mx-auto sm:mx-0">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>

                  {getPaginationGroup().map((page, index) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${index}`}
                          className="w-8 text-center text-slate-400 font-bold tracking-widest"
                        >
                          ...
                        </span>
                      );
                    }

                    const isActive = page === currentPage;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(page as number)}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg text-base font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 bg-transparent"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
