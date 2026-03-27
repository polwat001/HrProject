"use client";

import Image from "next/image";
import { useState, useEffect, useMemo, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/locales/translations";
import {
  Loader,
  Search,
  XCircle,
  User,
  Check,
  X,
  ClockPlus,
  Briefcase,
  Download,
  Upload,
  Share,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_OT_REQUESTS, MOCK_DEPARTMENTS_OT } from "@/mocks/otData";
import { StatusBadge } from "./Shared";

export default function AdminOvertime() {
  const { currentCompanyId, language } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);

  const t =
    translations[language as keyof typeof translations] || translations["en"];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredData = MOCK_OT_REQUESTS;
      if (currentCompanyId) {
        filteredData = filteredData.filter(
          (log) => log.company_id === currentCompanyId,
        );
      }
      setRequests(filteredData);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(
        "  ส่งออกข้อมูล OT สำเร็จ! (Demo)\nระบบได้ดาวน์โหลดไฟล์ ot_records.csv แล้ว",
      );
    }, 1200);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      alert(`  นำเข้าข้อมูล OT จากไฟล์ ${file.name} สำเร็จ! (Demo)`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  const displayedRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchDate = selectedDate ? r.date === selectedDate : true;
      const matchSearch = searchQuery
        ? `${r.employee_name} ${r.employee_code}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : true;
      const matchDept = filterDepartment
        ? r.department_id === filterDepartment
        : true;

      return matchDate && matchSearch && matchDept;
    });
  }, [requests, selectedDate, searchQuery, filterDepartment]);

  const handleAction = (id: number, newStatus: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)),
    );
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          {/* เพิ่มปุ่ม Info ข้างๆ หัวข้อ */}
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase ">
              การจัดการทำงานล่วงเวลา
            </h1>
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="ดูข้อมูลเพิ่มเติม"
            >
              <Info size={24} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
            accept=".csv, .xlsx, .xls"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isImporting ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Download size={16} />
            )}
            <span className="hidden sm:inline">นำเข้าข้อมูล</span>
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isExporting ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              <Share size={16} />
            )}
            <span className="hidden sm:inline">ส่งออกข้อมูล</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Briefcase
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <select
            value={filterDepartment}
            onChange={(e) =>
              setFilterDepartment(e.target.value ? Number(e.target.value) : "")
            }
            className="pl-10 pr-8 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm appearance-none min-w-[200px] cursor-pointer"
          >
            <option value="">ทุกแผนก (All Departments)</option>
            {MOCK_DEPARTMENTS_OT.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3 top-2.5 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          />
        </div>

        <div className="relative">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate("")}
              className="absolute right-10 top-2.5 text-slate-300 hover:text-red-500 transition-colors"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="py-6 px-8 text-left">
                    {t.colEmployee || "พนักงาน"}
                  </th>
                  <th className="text-left px-4">แผนก (Department)</th>
                  <th className="text-center">{t.colDate || "วันที่ขอ OT"}</th>
                  <th className="text-center">
                    {t.colOTHours || "จำนวน (ชม.)"}
                  </th>
                  <th className="text-left">เหตุผล</th>
                  <th className="text-center">{t.colStatus || "สถานะ"}</th>
                  <th className="text-center px-8">
                    {t.colAction || "จัดการ"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayedRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50 group transition-all"
                  >
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all text-slate-400">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-tight">
                            {req.employee_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {req.employee_code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-left px-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold whitespace-nowrap">
                        <Briefcase size={12} /> {req.department_name}
                      </span>
                    </td>
                    <td className="text-center font-bold text-slate-600 text-sm whitespace-nowrap">
                      {new Date(req.date).toLocaleDateString(
                        language === "th" ? "th-TH" : "en-GB",
                      )}
                    </td>
                    <td className="text-center font-black text-blue-600 text-lg">
                      {req.hours}{" "}
                      <span className="text-[10px] text-slate-400">
                        {t.hrs || "ชม."}
                      </span>
                    </td>
                    <td
                      className="text-left text-sm text-slate-600 max-w-[200px] truncate"
                      title={req.reason}
                    >
                      {req.reason}
                    </td>
                    <td className="text-center px-8">
                      <StatusBadge status={req.status} t={t} />
                    </td>
                    <td className="text-center px-8">
                      {req.status === "pending" ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleAction(req.id, "approved")}
                            className="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-colors"
                            title="อนุมัติ"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, "rejected")}
                            className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-colors"
                            title="ปฏิเสธ"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase ">
                          ดำเนินการแล้ว
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayedRequests.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <ClockPlus className="mx-auto text-slate-200" size={64} />
              <p className="text-slate-300 font-black uppercase tracking-widest">
                ไม่พบคำขอ OT
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/*Information Modal */}
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

            <div className="relative w-full h-[40vh]">
              <Image
                src="/ot.png"
                alt="Information Detail"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
