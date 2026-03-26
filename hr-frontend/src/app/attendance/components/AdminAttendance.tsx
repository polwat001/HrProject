'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/locales/translations'; 
import { 
  Calendar, Loader, User, XCircle, Search, Download, Upload, 
  ExternalLink, Import, Share, Info, X // 🔴 เพิ่ม Info และ X
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_ATTENDANCE_LOGS, getStatusStyle, translateStatus, formatTime } from '@/mocks/attendanceData';

export default function AdminAttendance() {
  const { currentCompanyId, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🔴 เพิ่ม State สำหรับเปิด/ปิด Information Modal
  const [showInfoModal, setShowInfoModal] = useState(false);

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = MOCK_ATTENDANCE_LOGS;
      if (currentCompanyId) {
        filteredData = filteredData.filter(log => log.company_id === currentCompanyId);
      }
      setAttendanceLogs(filteredData);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  const displayedLogs = useMemo(() => {
    return attendanceLogs.filter(log => {
      const matchDate = selectedDate ? log.date === selectedDate : true;
      const matchSearch = searchQuery 
        ? `${log.firstname_th} ${log.lastname_th} ${log.employee_code}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchDate && matchSearch;
    });
  }, [attendanceLogs, selectedDate, searchQuery]);

  const handleExport = () => {
    if (displayedLogs.length === 0) {
      alert("ไม่มีข้อมูลสำหรับส่งออก");
      return;
    }

    setIsExporting(true);

    setTimeout(() => {
      const headers = [
        "employee_code",
        "firstname_th",
        "lastname_th",
        "date",
        "check_in_time",
        "check_out_time",
        "late_minutes",
        "STATUS"
      ];

      const rows = displayedLogs.map(log => [
        log.employee_code,
        log.firstname_th,
        log.lastname_th,
        log.date,
        log.check_in_time,
        log.check_out_time,
        log.late_minutes,
        log.STATUS
      ]);

      const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "attendance_logs.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
    }, 800);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter(line => line.trim() !== "");
        const headers = lines[0].split(",");

        const data = lines.slice(1).map((line, index) => {
          const values = line.split(",");
          const obj: any = {};
          headers.forEach((header, i) => {
            obj[header.trim()] = values[i];
          });

          return {
            id: Date.now() + index,
            ...obj,
            late_minutes: Number(obj.late_minutes || 0),
            company_id: currentCompanyId,
          };
        });

        setAttendanceLogs(data);
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        alert(` นำเข้าข้อมูลการเข้างานสำเร็จ!`);
      }, 1000);
    };

    reader.readAsText(file);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {t.title || "Attendance Logs"}
          </h1>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info size={24} />
          </button>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".csv" />
          
          <button 
            onClick={() => fileInputRef.current?.click()} disabled={isImporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isImporting ? <Loader className="animate-spin" size={16} /> : <Download size={16} />} 
            <span className="hidden sm:inline">นำเข้าข้อมูล</span>
          </button>

          <button 
            onClick={handleExport} disabled={isExporting || displayedLogs.length === 0}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isExporting ? <Loader className="animate-spin" size={16} /> : <Share size={16} />} 
            <span className="hidden sm:inline">ส่งออกข้อมูล</span>
          </button>
        </div>
      </div>

      {/* ✅ Filters Area */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* 🔍 Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหารหัส หรือชื่อพนักงาน..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* 📅 Date */}
        <div className="relative w-full sm:w-auto">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm text-slate-600"
          />
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate("")}
              className="absolute right-10 top-3.5 text-slate-300 hover:text-red-500 transition-colors"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      <Card className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 font-black text-base text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="py-6 pl-12 px-8 text-left">{t.colEmployee || "พนักงาน"}</th>
                  <th className="text-center px-4">{language === 'th' ? 'วันที่' : 'Date'}</th> 
                  <th className="text-center px-4">{t.colCheckIn || "เวลาเข้า"}</th>
                  <th className="text-center px-4">{t.colCheckOut || "เวลาออก"}</th>
                  <th className="text-center px-4">{t.colLate || "สาย (นาที)"}</th>
                  <th className="text-center px-8">{t.colStatus || "สถานะ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {displayedLogs.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400 shrink-0">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">
                            {record.firstname_th} {record.lastname_th}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {record.employee_code}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="text-center font-bold text-slate-600 py-4 px-4 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    <td className="text-center font-black font-mono text-slate-800 py-4 px-4">
                      {formatTime(record.check_in_time)}
                    </td>

                    <td className="text-center font-black font-mono text-slate-800 py-4 px-4">
                      {formatTime(record.check_out_time)}
                    </td>

                    <td className={`text-center font-black py-4 px-4 ${record.late_minutes > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                      {record.late_minutes > 0 ? `+${record.late_minutes}` : '-'}
                    </td>

                    <td className="text-center px-8 py-4">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(record.STATUS)}`}>
                        {translateStatus(record.STATUS, t)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayedLogs.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <Calendar className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t.noRecords || "ไม่พบข้อมูลการลงเวลา"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🔴 Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Info className="text-blue-600" size={20} />
                *ตัวอย่างแบบการนำเข้าข้อมูล
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center min-h-[300px] p-4">
              {/* เปลี่ยน src รูปภาพเป็นของข้อมูล Attendance ได้เลยครับ */}
              <img
                src="/attendance_tem.png" 
                alt="Information Detail"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}