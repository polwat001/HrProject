"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, Plus, X, Loader2 } from "lucide-react";


const MOCK_SHIFT_EMPLOYEES = Array.from({ length: 150 }).map((_, i) => ({
  id: i + 1, code: `EMP-${String(i + 1).padStart(3, '0')}`, name: `พนักงานคนที่ ${i + 1}`, 
  department: i < 50 ? "แผนกพัฒนาซอฟต์แวร์" : i < 100 ? "แผนกสรรหาบุคลากร" : "แผนกบัญชีทั่วไป"
}));

const DEFAULT_SHIFTS = [
  { name: "กะเช้า", startTime: "08:00", endTime: "17:00", quota: "" },
  { name: "กะบ่าย", startTime: "16:00", endTime: "01:00", quota: "" },
];

function CreateShiftContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedDept = searchParams.get("dept");
  
  
  const { addShifts, divisions, sections, departments } = useAppStore();
  
  const [step, setStep] = useState(1);
  const [selectedDiv, setSelectedDiv] = useState("");
  const [selectedSec, setSelectedSec] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [configs, setConfigs] = useState(DEFAULT_SHIFTS);

  const [previewData, setPreviewData] = useState<any[]>([]);
  const [generatedShifts, setGeneratedShifts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  
  const ORG_HIERARCHY = useMemo(() => {
    return divisions.map(div => {
      
      const deptsInDiv = departments.filter(dept => {
        if (!dept.divisionName) return false;
        if (dept.divisionName === div.name) return true;
        
        const divNameStr = div.name || "";
        const deptDivStr = dept.divisionName || "";
        
        if (divNameStr.includes("บริหาร") && deptDivStr.includes("บริหาร")) return true;
        if (divNameStr.includes("ปฏิบัติการ") && deptDivStr.includes("ปฏิบัติการ")) return true;
        if (divNameStr.includes("เทคโนโลยี") && deptDivStr.includes("เทคโนโลยี")) return true;
        if (divNameStr.includes("การตลาด") && deptDivStr.includes("การตลาด")) return true;
        
        return false;
      });

      
      const uniqueSections = Array.from(new Set(deptsInDiv.map(d => d.sectionName)));

      
      const sectionsList = uniqueSections.map(secName => {
        return {
          section: secName || "ส่วนงานทั่วไป",
          departments: deptsInDiv
            .filter(d => d.sectionName === secName)
            .map(d => d.name)
        };
      });

      return {
        division: div.name,
        sections: sectionsList
      };
    });
  }, [divisions, departments]); 

  useEffect(() => {
    if (preSelectedDept) {
      setSelectedDept(preSelectedDept);
      for (const div of ORG_HIERARCHY) {
        for (const sec of div.sections) {
          if (sec.departments.includes(preSelectedDept)) {
            setSelectedDiv(div.division);
            setSelectedSec(sec.section);
          }
        }
      }
    }
  }, [preSelectedDept, ORG_HIERARCHY]);

  const availableSections = useMemo(() => ORG_HIERARCHY.find(d => d.division === selectedDiv)?.sections || [], [selectedDiv, ORG_HIERARCHY]);
  const availableDepts = useMemo(() => availableSections.find(s => s.section === selectedSec)?.departments || [], [selectedSec, availableSections]);

  const handleDivChange = (val: string) => { setSelectedDiv(val); setSelectedSec(""); setSelectedDept(""); };
  const handleSecChange = (val: string) => { setSelectedSec(val); setSelectedDept(""); };

  const empInDeptCount = useMemo(() => MOCK_SHIFT_EMPLOYEES.filter(e => e.department === selectedDept).length, [selectedDept]);
  const totalQuota = useMemo(() => configs.reduce((sum, c) => sum + (Number(c.quota) || 0), 0), [configs]);
  
  const handleProcessPreview = () => {
    if (!selectedDept || !startDate || !endDate) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    if (totalQuota !== empInDeptCount) return alert(`โควต้ารวม (${totalQuota}) ไม่ตรงกับจำนวนพนักงาน (${empInDeptCount})`);

    setStep(2); 
    setTimeout(() => {
      const sortedEmps = MOCK_SHIFT_EMPLOYEES.filter(e => e.department === selectedDept).sort((a, b) => a.code.localeCompare(b.code));
      let currentIdx = 0;
      const previewList = [];
      const newShiftsToStore = [];

      for (let i = 0; i < configs.length; i++) {
        const config = configs[i];
        const q = Number(config.quota) || 0;
        if (q > 0) {
          const assigned = sortedEmps.slice(currentIdx, currentIdx + q);
          assigned.forEach(emp => {
            previewList.push({ ...emp, assignedShift: config.name, shiftTime: `${config.startTime} - ${config.endTime}` });
          });
          newShiftsToStore.push({
            id: Date.now() + i,
            department: selectedDept,
            name: config.name,
            startDate, endDate,
            startTime: config.startTime, endTime: config.endTime,
            employeeIds: assigned.map(e => e.id)
          });
          currentIdx += q;
        }
      }
      setPreviewData(previewList);
      setGeneratedShifts(newShiftsToStore);
      setStep(3); 
    }, 1500); 
  };

  const handleConfirmSave = () => {
    addShifts(generatedShifts); 
    setStep(4); 
  };

  
  const totalPages = Math.ceil(previewData.length / itemsPerPage);
  const paginatedData = previewData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) { 
      for (let i = 1; i <= totalPages; i++) pages.push(i); 
    } else {
      if (currentPage <= 4) pages = [1, 2, 3, 4, 5, '...', totalPages];
      else if (currentPage >= totalPages - 3) pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      else pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
    return pages;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50 pb-24">
      
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button onClick={() => router.push('/shift')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 shadow-sm"><ArrowLeft size={20} /></button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Auto Allocate Shifts</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">กำหนดจำนวน แล้วระบบจัดให้</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center max-w-2xl mx-auto mb-8">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-slate-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-2 ${step >= 1 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200'}`}>1</div>
          <span className="text-[10px] font-black uppercase tracking-widest">ตั้งค่ากะ</span>
        </div>
        <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600' : 'text-slate-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-2 ${step >= 3 ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200'}`}>2</div>
          <span className="text-[10px] font-black uppercase tracking-widest">ตรวจสอบ</span>
        </div>
        <div className={`flex-1 h-1 mx-4 rounded-full ${step >= 4 ? 'bg-indigo-600' : 'bg-slate-200'}`} />
        <div className={`flex flex-col items-center ${step >= 4 ? 'text-green-600' : 'text-slate-300'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mb-2 ${step >= 4 ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-slate-200'}`}><CheckCircle size={16}/></div>
          <span className="text-[10px] font-black uppercase tracking-widest">เสร็จสิ้น</span>
        </div>
      </div>

      {step === 1 && (
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8 animate-in fade-in">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Division</label>
                <select value={selectedDiv} onChange={e => handleDivChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none">
                  <option value="">-- เลือก Division --</option>
                  {ORG_HIERARCHY.map(d => <option key={d.division} value={d.division}>{d.division}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
                <select disabled={!selectedDiv} value={selectedSec} onChange={e => handleSecChange(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none disabled:opacity-50">
                  <option value="">-- เลือก Section --</option>
                  {availableSections.map(s => <option key={s.section} value={s.section}>{s.section}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department <span className="text-red-500">*</span></label>
                <select disabled={!selectedSec} value={selectedDept} onChange={e => setSelectedDept(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none disabled:opacity-50">
                  <option value="">-- เลือก แผนก --</option>
                  {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่เริ่ม</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"/>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันสิ้นสุด</label>
                <input type="date" min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-indigo-500 outline-none"/>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border ${selectedDept ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-50 pointer-events-none'} transition-all`}>
               <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-slate-800 text-sm">กำหนดจำนวนพนักงานแต่ละกะ</h4>
                  {selectedDept && <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-lg uppercase tracking-widest shadow-sm">พนักงานในแผนก: {empInDeptCount} คน</span>}
                </div>

                <div className="space-y-3">
                  {configs.map((config, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative pr-10">
                      <input type="text" value={config.name} onChange={e => { const c=[...configs]; c[idx].name=e.target.value; setConfigs(c); }} className="w-full sm:w-1/3 p-2 text-sm font-bold border-none outline-none focus:ring-1 bg-slate-50 rounded-lg" placeholder="ชื่อกะ" />
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="time" value={config.startTime} onChange={e => { const c=[...configs]; c[idx].startTime=e.target.value; setConfigs(c); }} className="w-1/2 sm:w-24 p-2 text-sm font-bold border-none outline-none bg-slate-50 rounded-lg" />
                        <span className="text-slate-300 font-black">-</span>
                        <input type="time" value={config.endTime} onChange={e => { const c=[...configs]; c[idx].endTime=e.target.value; setConfigs(c); }} className="w-1/2 sm:w-24 p-2 text-sm font-bold border-none outline-none bg-slate-50 rounded-lg" />
                      </div>
                      <div className="w-full sm:flex-1 relative">
                        <input type="number" min="0" value={config.quota} onChange={e => { const c=[...configs]; c[idx].quota=e.target.value; setConfigs(c); }} className="w-full p-2 pr-8 text-sm font-black border-none outline-none bg-slate-50 rounded-lg text-right text-indigo-600" placeholder="0" />
                        <span className="absolute right-3 top-2.5 text-[10px] font-black text-slate-400">คน</span>
                      </div>
                      {configs.length > 1 && <button onClick={() => setConfigs(configs.filter((_, i) => i !== idx))} className="absolute right-2 top-3 sm:top-1/2 sm:-translate-y-1/2 text-slate-300 hover:text-red-500"><X size={16}/></button>}
                    </div>
                  ))}
                </div>
                <button onClick={() => setConfigs([...configs, { name:"", startTime:"08:00", endTime:"17:00", quota:"" }])} className="mt-4 text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1"><Plus size={14}/> เพิ่มกะ</button>
            </div>

            <button onClick={handleProcessPreview} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
              ดูตัวอย่างก่อนบันทึก <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-3xl mx-auto py-32 text-center animate-in fade-in zoom-in-95">
          <Loader2 size={48} className="mx-auto text-indigo-600 animate-spin mb-4" />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">กำลังประมวลผลจัดกะ...</h2>
          <p className="text-slate-500 text-sm mt-2">ระบบกำลังดึงข้อมูลพนักงานและจัดสรรตามโควต้า</p>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 fade-in">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase">ตรวจสอบการจัดกะ</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedDept} | {startDate} ถึง {endDate}</p>
            </div>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-black uppercase">รวม {previewData.length} คน</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="py-4 px-6 text-center w-16">ลำดับ</th>
                  <th className="py-4 px-6">รหัสพนักงาน</th>
                  <th className="py-4 px-6">ชื่อ-นามสกุล</th>
                  <th className="py-4 px-6">กะที่ได้รับมอบหมาย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-slate-400 text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-4 px-6 font-black text-slate-600 uppercase text-xs tracking-widest">{emp.code}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{emp.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100 text-[10px] font-black tracking-widest">
                        {emp.assignedShift} <span className="opacity-50">({emp.shiftTime})</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">
                Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, previewData.length)} of {previewData.length}
              </p>
              <div className="flex items-center gap-1 sm:gap-2 mx-auto sm:mx-0">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors">
                  <ChevronLeft size={18} strokeWidth={2.5} />
                </button>
                {getPaginationGroup().map((page, index) => {
                  if (page === '...') return <span key={`ellipsis-${index}`} className="w-8 text-center text-slate-400 font-bold tracking-widest">...</span>;
                  const isActive = page === currentPage;
                  return (
                    <button key={index} onClick={() => setCurrentPage(page as number)} className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${isActive ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 bg-transparent"}`}>
                      {page}
                    </button>
                  );
                })}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors">
                  <ChevronRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          )}

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-3 text-slate-500 hover:bg-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">ย้อนกลับไปแก้ไข</button>
            <button onClick={handleConfirmSave} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 text-xs font-black uppercase tracking-widest flex justify-center items-center gap-2"><CheckCircle size={16}/> บันทึกการจัดกะ</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-lg mx-auto py-20 text-center animate-in zoom-in-95 fade-in">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-100">
            <CheckCircle size={48} strokeWidth={2.5}/>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">จัดกะสำเร็จ!</h2>
          <p className="text-slate-500 font-medium mb-10">ระบบได้บันทึกข้อมูลพนักงานเข้าสู่กะการทำงานเรียบร้อยแล้ว</p>
          <button onClick={() => router.push('/shift')} className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
            กลับหน้าหลัก (Dashboard)
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreateAutoShiftWrapper() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-400"><Loader2 className="animate-spin mx-auto mb-2"/> Loading...</div>}>
      <CreateShiftContent />
    </Suspense>
  );
}