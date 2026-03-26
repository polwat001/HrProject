"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Building,
  User,
  CalendarDays,
  TrendingUp,
  Clock,
  Loader,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Receipt,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import {
  MOCK_EMPLOYEES,
  MOCK_ATTENDANCE,
  MOCK_OTS,
} from "@/mocks/dashboardData";

ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ ปรับแก้ Card สรุปข้อมูลให้ Responsive
function SelfServiceSummaryCard({
  icon: Icon,
  label,
  value,
  color,
  isMono,
}: any) {
  const colorMap: any = {
    emerald: "text-emerald-600 bg-emerald-50",
    teal: "text-teal-600 bg-teal-50",
    blue: "text-blue-600 bg-blue-50",
  };
  const theme = colorMap[color] || "text-slate-600 bg-slate-50";

  return (
    <Card className="rounded-xl border-none shadow-sm overflow-hidden bg-white">
      <CardContent className="p-4 md:p-6 flex items-center gap-3 md:gap-5">
        <div
          className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shrink-0 ${theme}`}
        >
          <Icon className="w-6 h-6 md:w-7 md:h-7" />
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">
            {label}
          </p>
          <p
            className={`text-lg md:text-2xl font-black truncate ${isMono ? "font-mono text-blue-600" : "text-slate-800"}`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ==========================================
// 👤 EMPLOYEE SELF-SERVICE
// ==========================================
export default function EmployeeSelfService({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [otRecords, setOtRecords] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [selectedYear, setSelectedYear] = useState(
    (new Date().getFullYear() - 1).toString(),
  );
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const monthNamesTh = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const prevMonth = () =>
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCalendarDate(
      new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1),
    );

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentEmp =
        MOCK_EMPLOYEES.find(
          (e: any) => Number(e.user_id) === Number(user?.id),
        ) || MOCK_EMPLOYEES[0];
      setEmployeeProfile(currentEmp);

      if (currentEmp) {
        setAttendanceRecords(
          (MOCK_ATTENDANCE || []).filter(
            (a) => a.employee_id === currentEmp.id,
          ),
        );
        setOtRecords(
          (MOCK_OTS || []).filter((o) => o.employee_id === currentEmp.id),
        );
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const tenure = useMemo(() => {
    if (!employeeProfile?.hire_date) return "-";
    const hire = new Date(employeeProfile.hire_date);
    const today = new Date();
    const totalMonths =
      (today.getFullYear() - hire.getFullYear()) * 12 +
      (today.getMonth() - hire.getMonth());
    return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
  }, [employeeProfile?.hire_date]);

  const calendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const attendanceMap = new Map();

    attendanceRecords.forEach((r: any) => {
      const rawDate = r.DATE || r.date;
      if (rawDate && typeof rawDate === "string") {
        const dateStr = rawDate.split("T")[0];
        attendanceMap.set(dateStr, r);
      }
    });

    const cells: { day: number; record?: any; isToday?: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        d === today.getDate();
      cells.push({ day: d, record: attendanceMap.get(dateStr), isToday });
    }
    return cells;
  }, [attendanceRecords, calendarDate]);

  const otTotalHours = otRecords
    .filter((r) => r.log_status === "approved")
    .reduce((sum, r) => sum + Number(r.hours || 0), 0);

  const sortedAtt = [...attendanceRecords].sort((a, b) => {
    const dateA = a.DATE || a.date || "";
    const dateB = b.DATE || b.date || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const latestAtt = sortedAtt.find((r) => r.check_in_time || r.check_in);
  const formatTime = (t: string) =>
    t && typeof t === "string" ? t.split(":").slice(0, 2).join(":") : "--:--";
  const LEAVE_COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

  const handleExport = (type: "payslip" | "twi50") => {
    setIsExporting(type);
    setTimeout(() => {
      setIsExporting(null);
      if (type === "payslip") {
        const [year, month] = selectedMonth.split("-");
        alert(
          `✅ สร้างสลิปเงินเดือน: เดือน ${monthNamesTh[parseInt(month) - 1]} ปี ${year}\nดาวน์โหลดสำเร็จ! (Demo)`,
        );
      } else {
        alert(
          `✅ สร้างหนังสือรับรอง ทวิ 50: ประจำปี ${selectedYear}\nดาวน์โหลดสำเร็จ! (Demo)`,
        );
      }
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-8 animate-in fade-in duration-500 bg-slate-50/30 min-h-screen">
      {/* Profile Card */}
      <Card className="rounded-xl  border border-slate-300 shadow-sm bg-white overflow-hidden">
        <CardContent className="flex flex-col md:flex-row items-center gap-4 md:gap-6 p-6 md:p-8">
          <div className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-[1.5rem] md:rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-lg md:shadow-xl shadow-blue-200">
            {employeeProfile?.firstname_th?.charAt(0) ||
              user?.username?.charAt(0)}
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              {employeeProfile?.firstname_th || user?.username}{" "}
              {employeeProfile?.lastname_th || ""}
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mt-2 text-[10px] md:text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-slate-100">
                <Briefcase size={12} className="text-blue-500" />{" "}
                {employeeProfile?.position_name || "พนักงาน"}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-slate-100">
                <Building size={12} className="text-blue-500" />{" "}
                {employeeProfile?.department_name || "ทั่วไป"}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-slate-100">
                <User size={12} className="text-blue-500" /> รหัส:{" "}
                {employeeProfile?.employee_code || "-"}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 md:px-3 md:py-1 rounded-lg border border-slate-100">
                <CalendarDays size={12} className="text-blue-500" /> อายุงาน:{" "}
                {tenure}
              </span>
            </div>
          </div>
          <Badge
            className={`px-4 py-1.5 md:py-2 mt-2 md:mt-0 font-black uppercase tracking-widest text-[10px] rounded-xl border-none shadow-sm ${employeeProfile?.STATUS === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
          >
            {employeeProfile?.STATUS || "Active"}
          </Badge>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 ">
        <div className="col-span-2 md:col-span-1 rounded-xl border border-slate-300">
          <SelfServiceSummaryCard
            icon={CalendarDays}
            label="วันลาคงเหลือ"
            value="38 วัน"
            color="emerald"
          />
        </div>
        <div className="rounded-xl border border-slate-300">
          <SelfServiceSummaryCard
            icon={TrendingUp}
            label="OT เดือนนี้"
            value={`${otTotalHours.toLocaleString()} ชม.`}
            color="teal"
          />
        </div>
        <div className="rounded-xl border border-slate-300">
          <SelfServiceSummaryCard
            icon={Clock}
            label="ลงเวลาล่าสุด"
            value={
              latestAtt
                ? `${formatTime(latestAtt.check_in_time || latestAtt.check_in)} - ${latestAtt.check_out_time || latestAtt.check_out ? formatTime(latestAtt.check_out_time || latestAtt.check_out) : "??"}`
                : "N/A"
            }
            color="blue"
            isMono
          />
        </div>
      </div>

      {/* ✅ SECTION เอกสาร: แก้โครงสร้างใหม่ให้มือถือกดง่ายและเรียงสวยงาม */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ">
        
        {/* สลิปเงินเดือน */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 bg-gradient-to-br from-white to-blue-50/50">
          {/* Header Card: ไอคอน + ข้อความ ให้อยู่บรรทัดเดียวกันเสมอ */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-widest mb-0.5">
                สลิปเงินเดือน (Payslip)
              </h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400">
                ดาวน์โหลดสลิปเงินเดือนประจำเดือน
              </p>
            </div>
          </div>

          {/* Action Area: Input และ ปุ่ม (บนมือถือเรียงลงล่าง, จอใหญ่เรียงซ้ายขวา) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-1/2 p-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white transition-all shadow-sm"
            />
            <button
              onClick={() => handleExport("payslip")}
              disabled={isExporting !== null}
              className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] md:text-xs uppercase tracking-widest px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-blue-200"
            >
              {isExporting === "payslip" ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              ดาวน์โหลดสลิป
            </button>
          </div>
        </Card>

        {/* ทวิ 50 */}
        <Card className="rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 bg-gradient-to-br from-white to-indigo-50/50">
          {/* Header Card: ไอคอน + ข้อความ ให้อยู่บรรทัดเดียวกันเสมอ */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-slate-800 uppercase tracking-widest mb-0.5">
                หนังสือรับรอง ทวิ 50
              </h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400">
                ดาวน์โหลดเอกสารหักภาษี ณ ที่จ่ายประจำปี
              </p>
            </div>
          </div>

          {/* Action Area: Select และ ปุ่ม (บนมือถือเรียงลงล่าง, จอใหญ่เรียงซ้ายขวา) */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full sm:w-1/2 p-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 bg-white transition-all shadow-sm"
            >
              <option value="2026">ประจำปี 2026</option>
              <option value="2025">ประจำปี 2025</option>
              <option value="2024">ประจำปี 2024</option>
            </select>
            <button
              onClick={() => handleExport("twi50")}
              disabled={isExporting !== null}
              className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[11px] md:text-xs uppercase tracking-widest px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-indigo-200"
            >
              {isExporting === "twi50" ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              โหลด ทวิ 50
            </button>
          </div>
        </Card>

      </div>

      {/* Leaves & Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 rounded-xl ">
        <Card className="lg:col-span-1 rounded-xl  border border-slate-300 shadow-sm p-5 md:p-8 bg-white">
          <CardTitle className="text-sm font-black mb-6 md:mb-8 uppercase tracking-[0.2em] text-slate-400">
            โควต้าวันลา
          </CardTitle>
          <div className="space-y-3 md:space-y-4">
            {[
              { t: "ลาป่วย", u: 2, tot: 30 },
              { t: "ลากิจ", u: 1, tot: 6 },
              { t: "พักร้อน", u: 0, tot: 10 },
            ].map((q, i) => (
              <div
                key={q.t}
                className="bg-slate-50/80 p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center gap-4 md:gap-5 border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 relative">
                  <Doughnut
                    data={{
                      labels: ["ใช้แล้ว", "คงเหลือ"],
                      datasets: [
                        {
                          data: [q.u, Math.max(0, q.tot - q.u)],
                          backgroundColor: [
                            LEAVE_COLORS[i % LEAVE_COLORS.length],
                            "#e2e8f0",
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "75%",
                      plugins: {
                        legend: { display: false },
                        tooltip: { enabled: false },
                      },
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-700">
                    {Math.round((q.u / q.tot) * 100)}%
                  </div>
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-bold text-slate-600 text-xs md:text-sm">
                    {q.t}
                  </span>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-base md:text-lg leading-none">
                      {q.u}
                      <span className="text-slate-400 text-xs md:text-sm font-bold">
                        /{q.tot}
                      </span>
                    </p>
                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400 mt-0.5">
                      วัน
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ปฏิทินเข้างาน*/}
        <Card className="lg:col-span-2 rounded-xl border border-slate-300 shadow-sm p-5 md:p-8 bg-white overflow-hidden">
          <CardTitle className="text-sm font-black mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 uppercase tracking-[0.2em] text-slate-400">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-500" /> ปฏิทินเข้างาน
            </div>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-2 py-1 shadow-sm w-full sm:w-auto justify-between sm:justify-center">
              <button
                onClick={prevMonth}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="w-28 md:w-32 text-center text-xs font-black text-slate-700 tracking-wider">
                {monthNamesTh[calendarDate.getMonth()]}{" "}
                {calendarDate.getFullYear() + 543}
              </span>
              <button
                onClick={nextMonth}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </CardTitle>
          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
              <div
                key={d}
                className={`text-center text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 ${d === "ส" || d === "อา" ? "text-rose-400" : "text-slate-400"}`}
              >
                {d}
              </div>
            ))}
            {calendarData.map((cell, idx) => (
              <div
                key={idx}
                className={`h-12 md:h-16 rounded-xl md:rounded-2xl flex flex-col items-center justify-center border border-slate-50 transition-all ${cell.day === 0 ? "bg-transparent border-none" : "bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-blue-100"}`}
              >
                <span
                  className={`text-[10px] md:text-xs font-black flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg md:rounded-xl ${cell.isToday ? "text-white bg-blue-600 shadow-md shadow-blue-200" : "text-slate-500"}`}
                >
                  {cell.day || ""}
                </span>
                {cell.record && (
                  <div
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mt-1 md:mt-1.5 shadow-sm ${cell.record.STATUS?.toLowerCase() === "present" ? "bg-emerald-500" : "bg-amber-400"}`}
                    title={cell.record.STATUS}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ✅ คำขอ OT ล่าสุด */}
      <Card className="rounded-xl md:rounded-[2.5rem] border-none shadow-sm p-5 md:p-8 bg-white overflow-hidden">
        <CardTitle className="text-sm font-black mb-4 md:mb-6 uppercase tracking-[0.2em] text-slate-400">
          คำขอ OT ล่าสุด
        </CardTitle>
        <div className="space-y-3">
          {otRecords.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl hover:border-blue-200 transition-colors"
            >
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  {new Date(r.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ระยะเวลา: {r.hours} ชั่วโมง
                </span>
              </div>
              <Badge
                className={`border-none px-4 py-1.5 rounded-xl uppercase text-[10px] font-black tracking-wider shadow-sm self-start sm:self-auto ${r.log_status === "approved" ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}
              >
                {r.log_status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
              </Badge>
            </div>
          ))}
          {otRecords.length === 0 && (
            <p className="text-center py-6 md:py-8 text-slate-400 font-bold italic bg-slate-50 rounded-2xl text-sm">
              ไม่พบประวัติการทำ OT
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}