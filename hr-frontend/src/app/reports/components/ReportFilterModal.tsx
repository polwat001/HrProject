'use client';

import { useState } from 'react';
import { X, FileSpreadsheet, FileText, Loader, Filter, Calendar, Briefcase } from 'lucide-react';
import { ReportConfig, MOCK_DEPARTMENTS_REPORT } from '@/mocks/reportData';

interface ReportFilterModalProps {
  report: ReportConfig;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportFilterModal({ report, isOpen, onClose }: ReportFilterModalProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  // States สำหรับเก็บค่า Filter
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  if (!isOpen) return null;

  const handleGenerate = (format: 'excel' | 'pdf') => {
    setGenerating(format);
    
    // จำลองการโหลดสร้างไฟล์รายงาน 2 วินาที
    setTimeout(() => {
      setGenerating(null);
      alert(`🎉 สร้างรายงาน "${report.title}" รูปแบบ ${format.toUpperCase()} สำเร็จแล้ว!\n(แผนก: ${department})`);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !generating && onClose()} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-start bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-white rounded-xl shadow-sm">{report.icon}</div>
              <h3 className="text-xl font-black text-slate-900  tracking-tight">{report.title}</h3>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-1">
              <Filter size={12}/> Report Configuration
            </p>
          </div>
          <button onClick={onClose} disabled={generating !== null} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm transition-all disabled:opacity-50"><X size={20}/></button>
        </div>
        
        {/* Form Fields */}
        <div className="p-8 space-y-6">
          
          {/* แผนก (มีทุกรายงาน) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Briefcase size={12}/> แผนก (Department)</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              <option value="all">ทุกแผนก (All Departments)</option>
              {MOCK_DEPARTMENTS_REPORT.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* เงื่อนไข: วันที่ (สำหรับรายงาน Attendance) */}
          {report.filterType === 'date-range' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={12}/> ตั้งแต่วันที่</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={12}/> ถึงวันที่</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" />
              </div>
              <p className="col-span-2 text-[10px] text-slate-400 font-bold ">* หากต้องการดูรายวัน ให้เลือกวันที่เริ่มและสิ้นสุดเป็นวันเดียวกัน</p>
            </div>
          )}

          {/* เงื่อนไข: เดือน-ปี (สำหรับรายงาน Payroll, Leave) */}
          {report.filterType === 'month-year' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={12}/> ประจำเดือน</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>เดือนที่ {i+1}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Calendar size={12}/> ปี (Year)</label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            </div>
          )}

          {/* เงื่อนไข: สถานะ (สำหรับรายงาน Organization) */}
          {report.filterType === 'status-only' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สถานะพนักงาน</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                <option value="all">ทั้งหมด (All)</option>
                <option value="active">กำลังทำงาน (Active)</option>
                <option value="resigned">ลาออกแล้ว (Resigned)</option>
              </select>
            </div>
          )}
          
        </div>

        {/* Footer Buttons */}
        <div className="px-8 py-6 bg-slate-50 flex gap-4 border-t border-slate-100">
          {report.formats.includes('excel') && (
            <button
              onClick={() => handleGenerate('excel')}
              disabled={generating !== null}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {generating === 'excel' ? <Loader size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              {generating === 'excel' ? 'Generating...' : 'Export Excel'}
            </button>
          )}
          {report.formats.includes('pdf') && (
            <button
              onClick={() => handleGenerate('pdf')}
              disabled={generating !== null}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-red-200 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
            >
              {generating === 'pdf' ? <Loader size={16} className="animate-spin" /> : <FileText size={16} />}
              {generating === 'pdf' ? 'Generating...' : 'Export PDF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}