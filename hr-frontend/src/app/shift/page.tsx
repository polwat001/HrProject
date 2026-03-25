"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { 
  CalendarClock, Search, ChevronDown, CalendarDays, Clock, 
  Users, Building, Wand2, Network, Filter, Trash2, Layers, AlertTriangle 
} from "lucide-react";

// สร้าง Mock พนักงานชั่วคราวเพื่อใช้นับจำนวน (การใช้งานจริงให้ดึงจาก Database/Store)
const MOCK_SHIFT_EMPLOYEES = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1, code: `EMP-${i + 1}`, name: `พนักงาน ${i + 1}`, 
  department: i < 15 ? "แผนกพัฒนาซอฟต์แวร์" : i < 30 ? "แผนกสรรหาบุคลากร" : "แผนกโครงสร้างพื้นฐาน"
}));

export default function ShiftManagementPage() {
  const router = useRouter();
  
  // ✅ ดึง State จาก Store ส่วนกลาง
  const { user, shifts, deleteShift, divisions, sections, departments } = useAppStore();
  
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');
  const [searchQuery, setSearchQuery] = useState("");
  
  const [expandedDivisions, setExpandedDivisions] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // ==========================================
  // 🔒 1. ตรวจสอบสิทธิ์และดึงข้อมูลแผนกของ User
  // ==========================================
  const roleId = user ? Number(user.role_id || user.is_super_admin) : 4; 
  const isAdminOrHR = roleId === 1 || roleId === 2 || roleId === 3 || user?.is_super_admin;
  
  // จำลองว่าพนักงานคนนี้อยู่แผนกไหน (ถ้าไม่มีข้อมูล ให้ Default เป็นแผนกใดแผนกหนึ่งเพื่อทดสอบ)
  const userDeptName = (user as any)?.department_name || "แผนกพัฒนาซอฟต์แวร์"; 

  // ==========================================
  // 🔒 2. ระบบจำกัดสิทธิ์ (DATA SCOPING)
  // ==========================================
  
  // กรองแผนก (Departments) ที่มีสิทธิ์มองเห็น
  const allowedDepartments = useMemo(() => {
    if (isAdminOrHR) return departments; // แอดมินเห็นหมด
    return departments.filter(d => d.name === userDeptName); // พนักงานเห็นแค่แผนกตัวเอง
  }, [departments, isAdminOrHR, userDeptName]);

  // กรองส่วนงาน (Sections) ตามแผนกที่เห็นได้
  const allowedSections = useMemo(() => {
    if (isAdminOrHR) return sections;
    const allowedSecNames = allowedDepartments.map(d => d.sectionName);
    return sections.filter(s => allowedSecNames.includes(s.name));
  }, [sections, isAdminOrHR, allowedDepartments]);

  // กรองสายงาน (Divisions) ตามส่วนงานที่เห็นได้
  const allowedDivisions = useMemo(() => {
    if (isAdminOrHR) return divisions;
    const allowedDivNames = allowedSections.map(s => s.divisionName || (s as any).divName);
    return divisions.filter(d => allowedDivNames.includes(d.name));
  }, [divisions, isAdminOrHR, allowedSections]);

  // ✨ นำข้อมูลที่ผ่านการกรองสิทธิ์มาสร้าง โครงสร้างองค์กร (Hierarchy)
  const ORG_HIERARCHY = useMemo(() => {
    return allowedDivisions.map(div => {
      const divSections = allowedSections.filter(sec => sec.divisionId === div.id || sec.divisionName === div.name || (sec as any).divName === div.name);
      return {
        division: div.name,
        sections: divSections.map(sec => {
          const secDepts = allowedDepartments
            .filter(dept => dept.sectionName === sec.name || (dept as any).section_id === sec.id)
            .map(dept => dept.name);
          return { section: sec.name, departments: secDepts };
        }).filter(s => s.departments.length > 0) // ซ่อน Section ที่ไม่มีแผนกที่เกี่ยวข้อง
      };
    }).filter(d => d.sections.length > 0); // ซ่อน Division ที่ไม่มี Section ที่เกี่ยวข้อง
  }, [allowedDivisions, allowedSections, allowedDepartments]);

  const ALL_COMPANY_DEPARTMENTS = useMemo(() => allowedDepartments.map(d => d.name), [allowedDepartments]);

  const getHierarchyByDept = (deptName: string) => {
    const dept = departments.find(d => d.name === deptName);
    return { division: dept?.divisionName || "Unknown", section: dept?.sectionName || "Unknown" };
  };

  useEffect(() => {
    if (viewMode === 'flat' && ALL_COMPANY_DEPARTMENTS.length > 0 && Object.keys(expandedDepts).length === 0) {
      setExpandedDepts({ [ALL_COMPANY_DEPARTMENTS[0]]: true });
    }
  }, [viewMode, ALL_COMPANY_DEPARTMENTS]);

  useEffect(() => {
    if (viewMode === 'hierarchy' && ORG_HIERARCHY.length > 0 && Object.keys(expandedDivisions).length === 0) {
      setExpandedDivisions({ [ORG_HIERARCHY[0].division]: true });
    }
  }, [viewMode, ORG_HIERARCHY]);

  // 🔒 3. กรองกะการทำงาน ให้เห็นเฉพาะแผนกตัวเอง (ถ้าไม่ใช่แอดมิน)
  const groupedShiftsFlat = useMemo(() => {
    const filtered = shifts.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchScope = isAdminOrHR ? true : s.department === userDeptName; // เช็คสิทธิ์มองเห็นกะ
      return matchSearch && matchScope;
    });

    const groups: Record<string, any[]> = {};
    filtered.forEach(shift => {
      if (!groups[shift.department]) groups[shift.department] = [];
      groups[shift.department].push(shift);
    });
    return groups;
  }, [shifts, searchQuery, isAdminOrHR, userDeptName]);

  const handleDelete = () => {
    if (deleteConfirm) { deleteShift(deleteConfirm); setDeleteConfirm(null); }
  };

  const getEmpCountInDept = (deptName: string) => MOCK_SHIFT_EMPLOYEES.filter(e => e.department === deptName).length;
  const getEmpCountInSection = (depts: string[]) => depts.reduce((sum, d) => sum + getEmpCountInDept(d), 0);
  const getEmpCountInDiv = (secs: any[]) => secs.reduce((sum, sec) => sum + getEmpCountInSection(sec.departments), 0);

  // ================= RENDER UI =================
  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
            <CalendarClock className="text-blue-600" size={32} /> Shift Management
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {isAdminOrHR ? "จัดการกะการทำงานตามโครงสร้างองค์กร" : `ตารางกะการทำงาน - ${userDeptName}`}
          </p>
        </div>
        {isAdminOrHR && (
          <button onClick={() => router.push('/shift/create')} className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest w-full sm:w-auto">
            <Wand2 size={18} /> จัดกะทำงาน (อัตโนมัติ)
          </button>
        )}
      </div>

      {/* Filter & View Mode */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="ค้นหาแผนก หรือ ชื่อกะ..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button onClick={() => setViewMode('hierarchy')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'hierarchy' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}><Network size={14}/> โครงสร้างองค์กร</button>
          <button onClick={() => setViewMode('flat')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'flat' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}><Filter size={14}/> แยกตามแผนก</button>
        </div>
      </div>

      {/* 🟦 VIEW: HIERARCHY */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
          {ORG_HIERARCHY.map((div, dIdx) => (
            <div key={dIdx} className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpandedDivisions(p => ({ ...p, [div.division]: !p[div.division] }))} className="w-full px-6 py-4 bg-indigo-50/50 hover:bg-indigo-50 border-b border-indigo-100 flex items-center justify-between transition-colors outline-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-sm"><Layers size={20} /></div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Division</p>
                    <h2 className="text-lg font-black text-indigo-900 leading-tight">{div.division}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-indigo-700">{div.sections.length} Sections</p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">พนักงานรวม {getEmpCountInDiv(div.sections)} คน</p>
                  </div>
                  <div className={`p-1.5 rounded-lg transition-transform duration-300 ${expandedDivisions[div.division] ? "rotate-180 bg-indigo-200 text-indigo-700" : "bg-white text-indigo-400 shadow-sm border border-indigo-100"}`}><ChevronDown size={18} /></div>
                </div>
              </button>

              {expandedDivisions[div.division] && (
                <div className="p-4 space-y-4 bg-slate-50/30">
                  {div.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <button onClick={() => setExpandedSections(p => ({ ...p, [sec.section]: !p[sec.section] }))} className="w-full px-5 py-3.5 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between outline-none">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-md transition-transform duration-200 ${expandedSections[sec.section] ? "rotate-90 text-slate-700" : "text-slate-400"}`}><ChevronDown size={16} /></div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-slate-800 uppercase">{sec.section}</h3>
                              <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded">{sec.departments.length} แผนก</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">พนักงานในส่วนงาน: {getEmpCountInSection(sec.departments)} คน</p>
                          </div>
                        </div>
                      </button>

                      {expandedSections[sec.section] && (
                        <div className="p-4 space-y-4 bg-white">
                          {sec.departments.map((dept, ptIdx) => {
                            const deptShifts = shifts.filter(s => s.department === dept && (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || dept.toLowerCase().includes(searchQuery.toLowerCase())));
                            return (
                              <div key={ptIdx} className="border border-slate-100 rounded-xl overflow-hidden">
                                <button onClick={() => setExpandedDepts(p => ({ ...p, [dept]: !p[dept] }))} className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors outline-none">
                                  <div className="flex items-center gap-2">
                                    <Building size={14} className="text-slate-400"/>
                                    <h4 className="text-xs font-black text-slate-700">{dept}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2">กะทำงาน: {deptShifts.length}</span>
                                  </div>
                                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedDepts[dept] ? "rotate-180" : ""}`}/>
                                </button>

                                {expandedDepts[dept] && (
                                  <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-3">
                                    {deptShifts.length === 0 ? (
                                      <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                        <p className="text-xs font-bold text-slate-400 mb-3">ยังไม่มีกะในแผนกนี้</p>
                                      </div>
                                    ) : (
                                      deptShifts.map(shift => (
                                        <div key={shift.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:border-blue-300 transition-all group">
                                          <div className="flex justify-between items-start mb-3">
                                            <div>
                                              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">{shift.name}</h3>
                                              <p className="text-[10px] font-bold text-slate-500 mt-1"><CalendarDays size={10} className="inline text-blue-500 mr-1"/> {shift.startDate} - {shift.endDate}</p>
                                            </div>
                                            <span className="bg-blue-50 text-blue-600 font-black text-[10px] px-2 py-1 rounded-lg flex items-center gap-1"><Users size={10}/> {shift.employeeIds?.length || 0}</span>
                                          </div>
                                          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                            <span className="text-[10px] font-black text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"><Clock size={10} className="text-indigo-500"/> {shift.startTime} - {shift.endTime} น.</span>
                                            <div className="flex gap-2">
                                              <button onClick={() => router.push(`/shift/${shift.id}`)} className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded text-[10px] font-black transition-all" title="รายชื่อ"><Users size={12}/> รายชื่อ</button>
                                              {isAdminOrHR && <button onClick={() => setDeleteConfirm(shift.id)} className="p-1 text-red-500 hover:bg-red-50 rounded transition-all"><Trash2 size={14}/></button>}
                                            </div>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {ORG_HIERARCHY.length === 0 && (
             <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
               <AlertTriangle className="mx-auto text-amber-400 mb-3" size={40} />
               <p className="text-slate-500 font-bold text-sm">ไม่พบโครงสร้างองค์กรหรือข้อมูลกะสำหรับแผนกของคุณ</p>
             </div>
          )}
        </div>
      )}

      {/* 🟦 VIEW: FLAT (Department Only) */}
      {viewMode === 'flat' && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
          {Object.entries(groupedShiftsFlat).map(([dept, deptShifts]) => {
            const hierarchy = getHierarchyByDept(dept);
            return (
              <div key={dept} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                <button onClick={() => setExpandedDepts(p => ({ ...p, [dept]: !p[dept] }))} className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-colors outline-none gap-2 sm:gap-0">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0"><Building size={16} /></div>
                    <div className="text-left">
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide leading-tight">{dept}</h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">{hierarchy.division}</span>
                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{hierarchy.section}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="inline-block px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">รวม {deptShifts.reduce((sum, s) => sum + (s.employeeIds?.length || 0), 0)} คน</span>
                    <div className={`p-1 rounded-md transition-transform duration-300 ${expandedDepts[dept] ? "rotate-180 bg-slate-200 text-slate-700" : "bg-white text-slate-400 shadow-sm border border-slate-200"}`}><ChevronDown size={16} /></div>
                  </div>
                </button>

                {expandedDepts[dept] && (
                  <div className="p-5 grid grid-cols-1 xl:grid-cols-2 gap-4 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                    {deptShifts.length === 0 ? (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ยังไม่มีกะในแผนกนี้</p>
                      </div>
                    ) : (
                      deptShifts.map(shift => {
                        const startDateStr = shift.startDate || shift.date;
                        const endDateStr = shift.endDate || shift.date;
                        const displayDate = startDateStr === endDateStr 
                          ? new Date(startDateStr).toLocaleDateString("th-TH", { month: 'short', day: 'numeric', year: 'numeric' })
                          : `${new Date(startDateStr).toLocaleDateString("th-TH", { month: 'short', day: 'numeric' })} - ${new Date(endDateStr).toLocaleDateString("th-TH", { month: 'short', day: 'numeric', year: 'numeric' })}`;

                        return (
                          <div key={shift.id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:border-blue-200 transition-all group bg-white">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-black text-slate-900 text-base">{shift.name}</h3>
                                <p className="text-[11px] font-bold text-slate-500 mt-1"><CalendarDays size={12} className="inline text-blue-500 mr-1"/> {displayDate}</p>
                              </div>
                              <span className="bg-blue-50 text-blue-600 font-black text-[10px] px-3 py-1.5 rounded-lg border border-blue-100"><Users size={12} className="inline mr-1"/> {shift.employeeIds?.length || 0} คน</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                              <span className="text-[11px] font-black text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100"><Clock size={12} className="inline text-indigo-500 mr-1"/> {shift.startTime} - {shift.endTime} น.</span>
                              <div className="flex gap-2">
                                <button onClick={() => router.push(`/shift/${shift.id}`)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-1.5"><Users size={12}/> รายชื่อ</button>
                                {isAdminOrHR && <button onClick={() => setDeleteConfirm(shift.id)} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"><Trash2 size={14}/></button>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {Object.keys(groupedShiftsFlat).length === 0 && (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Search className="mx-auto text-slate-200 mb-3" size={40} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">ไม่พบข้อมูลกะสำหรับแผนกของคุณ</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && isAdminOrHR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">ยืนยันการลบ</h3>
            <p className="text-sm font-bold text-slate-500 mb-8">คุณแน่ใจหรือไม่ว่าต้องการลบกะการทำงานนี้? พนักงานที่อยู่ในกะจะถูกถอดออกทั้งหมด</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all">ยกเลิก</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 transition-all">ลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}