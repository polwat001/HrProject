"use client";

import Image from "next/image";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  CalendarClock,
  Search,
  ChevronDown,
  CalendarDays,
  Clock,
  Users,
  Building,
  Wand2,
  Network,
  Filter,
  Trash2,
  Layers,
  AlertTriangle,
  Download,
  Share,
  Info,
  X,
  Loader,
} from "lucide-react";

const MOCK_SHIFT_EMPLOYEES = Array.from({ length: 50 }).map((_, i) => ({
  id: i + 1,
  code: `EMP-${i + 1}`,
  name: `พนักงาน ${i + 1}`,
  department:
    i < 15
      ? "แผนกพัฒนาซอฟต์แวร์"
      : i < 30
        ? "แผนกสรรหาบุคลากร"
        : "แผนกโครงสร้างพื้นฐาน",
}));

export default function AdminShift() {
  const router = useRouter();
  const { language, shifts, deleteShift, divisions, sections, departments } =
    useAppStore();

  const [viewMode, setViewMode] = useState<"hierarchy" | "flat">("hierarchy");
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedDivisions, setExpandedDivisions] = useState<
    Record<string, boolean>
  >({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>(
    {},
  );
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  //  เพิ่ม State สำหรับปุ่ม นำเข้า, ส่งออก, Information
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ORG_HIERARCHY = useMemo(() => {
    return divisions.map((div) => {
      const deptsInDiv = departments.filter((dept) => {
        if (!dept.divisionName) return false;
        if (dept.divisionName === div.name) return true;
        const divNameStr = div.name || "";
        const deptDivStr = dept.divisionName || "";

        if (divNameStr.includes("บริหาร") && deptDivStr.includes("บริหาร"))
          return true;
        if (
          divNameStr.includes("ปฏิบัติการ") &&
          deptDivStr.includes("ปฏิบัติการ")
        )
          return true;
        if (
          divNameStr.includes("เทคโนโลยี") &&
          deptDivStr.includes("เทคโนโลยี")
        )
          return true;
        if (divNameStr.includes("การตลาด") && deptDivStr.includes("การตลาด"))
          return true;

        return false;
      });

      const uniqueSections = Array.from(
        new Set(deptsInDiv.map((d) => d.sectionName)),
      );
      const sectionsList = uniqueSections.map((secName) => {
        return {
          section: secName || "ส่วนงานทั่วไป",
          departments: deptsInDiv
            .filter((d) => d.sectionName === secName)
            .map((d) => d.name),
        };
      });
      return {
        division: div.name,
        sections: sectionsList,
      };
    });
  }, [divisions, departments]);

  const ALL_COMPANY_DEPARTMENTS = useMemo(
    () => departments.map((d) => d.name),
    [departments],
  );

  const getHierarchyByDept = (deptName: string) => {
    const dept = departments.find((d) => d.name === deptName);
    return {
      division: dept?.divisionName || "Unknown",
      section: dept?.sectionName || "Unknown",
    };
  };

  useEffect(() => {
    if (
      viewMode === "flat" &&
      ALL_COMPANY_DEPARTMENTS.length > 0 &&
      Object.keys(expandedDepts).length === 0
    ) {
      setExpandedDepts({ [ALL_COMPANY_DEPARTMENTS[0]]: true });
    }
  }, [viewMode, ALL_COMPANY_DEPARTMENTS]);

  useEffect(() => {
    if (
      viewMode === "hierarchy" &&
      ORG_HIERARCHY.length > 0 &&
      Object.keys(expandedDivisions).length === 0
    ) {
      setExpandedDivisions({ [ORG_HIERARCHY[0].division]: true });
    }
  }, [viewMode, ORG_HIERARCHY]);

  const groupedShiftsFlat = useMemo(() => {
    const filtered = shifts.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const groups: Record<string, any[]> = {};
    filtered.forEach((shift) => {
      if (!groups[shift.department]) groups[shift.department] = [];
      groups[shift.department].push(shift);
    });
    return groups;
  }, [shifts, searchQuery]);

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteShift(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  // 🔴 ฟังก์ชันสำหรับ Export / Import
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(
        " ส่งออกข้อมูลกะการทำงานสำเร็จ! (Demo)\nระบบได้ดาวน์โหลดไฟล์ shifts_export.csv แล้ว",
      );
    }, 1200);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      alert(` นำเข้าข้อมูลกะการทำงานจากไฟล์ ${file.name} สำเร็จ! (Demo)`);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 1500);
  };

  const getEmpCountInDept = (deptName: string) =>
    MOCK_SHIFT_EMPLOYEES.filter((e) => e.department === deptName).length;
  const getEmpCountInSection = (depts: string[]) =>
    depts.reduce((sum, d) => sum + getEmpCountInDept(d), 0);
  const getEmpCountInDiv = (secs: any[]) =>
    secs.reduce((sum, sec) => sum + getEmpCountInSection(sec.departments), 0);

  const getDisplayDate = (startDateStr: string, endDateStr: string) => {
    return startDateStr === endDateStr
      ? new Date(startDateStr).toLocaleDateString(
          language === "th" ? "th-TH" : "en-GB",
          { month: "short", day: "numeric", year: "numeric" },
        )
      : `${new Date(startDateStr).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", { month: "short", day: "numeric" })} - ${new Date(endDateStr).toLocaleDateString(language === "th" ? "th-TH" : "en-GB", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 min-h-screen bg-slate-50/50 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              <CalendarClock className="text-blue-600" size={32} /> การจัดการกะ
            </h1>
            {/*  ปุ่ม Info */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
              title="ดูข้อมูลเพิ่มเติม"
            >
              <Info size={24} />
            </button>
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1">
            จัดการกะการทำงานตามโครงสร้างองค์กร (แอดมิน)
          </p>
        </div>

        {/*  ปุ่ม Import / Export / เพิ่มกะทำงาน */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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
            <span className="hidden sm:inline">นำเข้า</span>
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
            <span className="hidden sm:inline">ส่งออก</span>
          </button>

          <button
            onClick={() => router.push("/shift/create")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest w-full sm:w-auto"
          >
            <Wand2 size={18} /> จัดกะทำงาน
          </button>
        </div>
      </div>

      {/* Filter & View Mode */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="ค้นหาแผนก หรือ ชื่อกะ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setViewMode("hierarchy")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${viewMode === "hierarchy" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Network size={14} /> โครงสร้างองค์กร
          </button>
          <button
            onClick={() => setViewMode("flat")}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${viewMode === "flat" ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Filter size={14} /> แยกตามแผนก
          </button>
        </div>
      </div>

      {/*  VIEW: HIERARCHY */}
      {viewMode === "hierarchy" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in">
          {ORG_HIERARCHY.map((div, dIdx) => (
            <div
              key={dIdx}
              className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedDivisions((p) => ({
                    ...p,
                    [div.division]: !p[div.division],
                  }))
                }
                className="w-full px-6 py-4 bg-indigo-50/50 hover:bg-indigo-50 border-b border-indigo-100 flex items-center justify-between transition-colors outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-sm">
                    <Layers size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Division
                    </p>
                    <h2 className="text-lg font-black text-indigo-900 leading-tight">
                      {div.division}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-indigo-700">
                      {div.sections.length} Sections
                    </p>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      พนักงานรวม {getEmpCountInDiv(div.sections)} คน
                    </p>
                  </div>
                  <div
                    className={`p-1.5 rounded-lg transition-transform duration-300 ${expandedDivisions[div.division] ? "rotate-180 bg-indigo-200 text-indigo-700" : "bg-white text-indigo-400 shadow-sm border border-indigo-100"}`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </div>
              </button>

              {expandedDivisions[div.division] && (
                <div className="p-4 space-y-4 bg-slate-50/30">
                  {div.sections.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedSections((p) => ({
                            ...p,
                            [sec.section]: !p[sec.section],
                          }))
                        }
                        className="w-full px-5 py-3.5 bg-slate-100/50 border-b border-slate-100 flex items-center justify-between outline-none"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1 rounded-md transition-transform duration-200 ${expandedSections[sec.section] ? "rotate-90 text-slate-700" : "text-slate-400"}`}
                          >
                            <ChevronDown size={16} />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-black text-slate-800 uppercase">
                                {sec.section}
                              </h3>
                              <span className="text-[10px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                {sec.departments.length} แผนก
                              </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                              พนักงานในส่วนงาน:{" "}
                              {getEmpCountInSection(sec.departments)} คน
                            </p>
                          </div>
                        </div>
                      </button>

                      {expandedSections[sec.section] && (
                        <div className="p-4 space-y-4 bg-white">
                          {sec.departments.map((dept, ptIdx) => {
                            const deptShifts = shifts.filter(
                              (s) =>
                                s.department === dept &&
                                (s.name
                                  .toLowerCase()
                                  .includes(searchQuery.toLowerCase()) ||
                                  dept
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())),
                            );
                            return (
                              <div
                                key={ptIdx}
                                className="border border-slate-100 rounded-xl overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedDepts((p) => ({
                                      ...p,
                                      [dept]: !p[dept],
                                    }))
                                  }
                                  className="w-full px-4 py-3 bg-white hover:bg-slate-50 flex items-center justify-between transition-colors outline-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <Building
                                      size={14}
                                      className="text-slate-400"
                                    />
                                    <h4 className="text-xs font-black text-slate-700">
                                      {dept}
                                    </h4>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                                      กะทำงาน: {deptShifts.length}
                                    </span>
                                  </div>
                                  <ChevronDown
                                    size={14}
                                    className={`text-slate-400 transition-transform ${expandedDepts[dept] ? "rotate-180" : ""}`}
                                  />
                                </button>

                                {expandedDepts[dept] && (
                                  <div className="bg-slate-50/50 border-t border-slate-100">
                                    {deptShifts.length === 0 ? (
                                      <div className="py-8 text-center border-b border-slate-100 bg-white">
                                        <p className="text-xs font-bold text-slate-400 mb-3">
                                          ยังไม่มีกะในแผนกนี้
                                        </p>
                                        <button
                                          onClick={() =>
                                            router.push(
                                              `/shift/create?dept=${dept}`,
                                            )
                                          }
                                          className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 uppercase tracking-widest inline-flex items-center gap-1"
                                        >
                                          สร้างกะให้แผนกนี้
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="overflow-x-auto w-full">
                                        <table className="w-full text-left whitespace-nowrap bg-white">
                                          <thead className="bg-slate-100/50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                            <tr>
                                              <th className="p-3 pl-5">
                                                ชื่อกะ (Shift)
                                              </th>
                                              <th className="p-3">
                                                วันที่ (Date)
                                              </th>
                                              <th className="p-3">
                                                เวลา (Time)
                                              </th>
                                              <th className="p-3 text-center">
                                                พนักงาน (Staff)
                                              </th>
                                              <th className="p-3 text-right pr-5">
                                                จัดการ (Action)
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 text-sm">
                                            {deptShifts.map((shift) => (
                                              <tr
                                                key={shift.id}
                                                className="hover:bg-blue-50/30 transition-colors group"
                                              >
                                                <td className="p-3 pl-5 font-black text-slate-800 text-sm">
                                                  {shift.name}
                                                </td>
                                                <td className="p-3 text-[11px] font-bold text-slate-500">
                                                  <CalendarDays
                                                    size={12}
                                                    className="inline text-blue-500 mr-1"
                                                  />{" "}
                                                  {getDisplayDate(
                                                    shift.startDate ||
                                                      shift.date,
                                                    shift.endDate || shift.date,
                                                  )}
                                                </td>
                                                <td className="p-3 text-[11px] font-black text-slate-600">
                                                  <Clock
                                                    size={12}
                                                    className="inline text-indigo-500 mr-1"
                                                  />{" "}
                                                  {shift.startTime} -{" "}
                                                  {shift.endTime} น.
                                                </td>
                                                <td className="p-3 text-center">
                                                  <span className="bg-blue-50 text-blue-600 font-black text-[10px] px-2 py-1 rounded-lg border border-blue-100">
                                                    <Users
                                                      size={10}
                                                      className="inline mr-1"
                                                    />{" "}
                                                    {shift.employeeIds
                                                      ?.length || 0}{" "}
                                                    คน
                                                  </span>
                                                </td>
                                                <td className="p-3 text-right pr-5">
                                                  <div className="flex justify-end gap-2">
                                                    <button
                                                      onClick={() =>
                                                        router.push(
                                                          `/shift/${shift.id}`,
                                                        )
                                                      }
                                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-1.5"
                                                    >
                                                      <Users size={12} />{" "}
                                                      รายชื่อ
                                                    </button>
                                                    <button
                                                      onClick={() =>
                                                        setDeleteConfirm(
                                                          shift.id,
                                                        )
                                                      }
                                                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                    >
                                                      <Trash2 size={14} />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
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
        </div>
      )}

      {/* VIEW: FLAT */}
      {viewMode === "flat" && (
        <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in">
          {Object.entries(groupedShiftsFlat).map(([dept, deptShifts]) => {
            const hierarchy = getHierarchyByDept(dept);
            return (
              <div
                key={dept}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() =>
                    setExpandedDepts((p) => ({ ...p, [dept]: !p[dept] }))
                  }
                  className="w-full px-5 py-3.5 bg-slate-50 hover:bg-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-colors outline-none gap-2 sm:gap-0"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-sm shrink-0">
                      <Building size={16} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide leading-tight">
                        {dept}
                      </h2>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                          {hierarchy.division}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          {hierarchy.section}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="inline-block px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                      รวม{" "}
                      {deptShifts.reduce(
                        (sum, s) => sum + (s.employeeIds?.length || 0),
                        0,
                      )}{" "}
                      คน
                    </span>
                    <div
                      className={`p-1 rounded-md transition-transform duration-300 ${expandedDepts[dept] ? "rotate-180 bg-slate-200 text-slate-700" : "bg-white text-slate-400 shadow-sm border border-slate-200"}`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </div>
                </button>

                {expandedDepts[dept] && (
                  <div className="border-t border-slate-100 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                    {deptShifts.length === 0 ? (
                      <div className="p-8 text-center border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                          ยังไม่มีกะในแผนกนี้
                        </p>
                        <button
                          onClick={() =>
                            router.push(`/shift/create?dept=${dept}`)
                          }
                          className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 uppercase tracking-widest inline-flex items-center gap-1"
                        >
                          สร้างกะให้แผนกนี้
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left whitespace-nowrap bg-white">
                          <thead className="bg-slate-50/80 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                            <tr>
                              <th className="p-3 pl-5">ชื่อกะ (Shift)</th>
                              <th className="p-3">วันที่ (Date)</th>
                              <th className="p-3">เวลา (Time)</th>
                              <th className="p-3 text-center">
                                พนักงาน (Staff)
                              </th>
                              <th className="p-3 text-right pr-5">
                                จัดการ (Action)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {deptShifts.map((shift) => (
                              <tr
                                key={shift.id}
                                className="hover:bg-blue-50/30 transition-colors group"
                              >
                                <td className="p-3 pl-5 font-black text-slate-800 text-sm">
                                  {shift.name}
                                </td>
                                <td className="p-3 text-[11px] font-bold text-slate-500">
                                  <CalendarDays
                                    size={12}
                                    className="inline text-blue-500 mr-1"
                                  />{" "}
                                  {getDisplayDate(
                                    shift.startDate || shift.date,
                                    shift.endDate || shift.date,
                                  )}
                                </td>
                                <td className="p-3 text-[11px] font-black text-slate-600">
                                  <Clock
                                    size={12}
                                    className="inline text-indigo-500 mr-1"
                                  />{" "}
                                  {shift.startTime} - {shift.endTime} น.
                                </td>
                                <td className="p-3 text-center">
                                  <span className="bg-blue-50 text-blue-600 font-black text-[10px] px-2 py-1 rounded-lg border border-blue-100">
                                    <Users size={10} className="inline mr-1" />{" "}
                                    {shift.employeeIds?.length || 0} คน
                                  </span>
                                </td>
                                <td className="p-3 text-right pr-5">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() =>
                                        router.push(`/shift/${shift.id}`)
                                      }
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[10px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-1.5"
                                    >
                                      <Users size={12} /> รายชื่อ
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirm(shift.id)}
                                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">
              ยืนยันการลบ
            </h3>
            <p className="text-sm font-bold text-slate-500 mb-8">
              คุณแน่ใจหรือไม่ว่าต้องการลบกะการทำงานนี้?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white hover:bg-red-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200 transition-all"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Modal */}
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
                src="/shift_tem.png"
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
