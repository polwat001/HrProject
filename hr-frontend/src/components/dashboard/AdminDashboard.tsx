"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; //  Import useRouter เพิ่มเข้ามา
import { useAppStore } from "@/store/useAppStore";
import {
  Users, UserPlus, FileWarning, Wallet, Clock, TrendingUp, AlertTriangle,
  ClockPlus, CalendarDays, FileSignature, DollarSign, ChevronLeft, ChevronRight,
  FileText, Edit2, Trash2, Plus, X, Loader, Baby, HeartHandshake,
  ClockFading,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip as ChartJSTooltip, Legend,
} from "chart.js";

import {
  MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_LEAVES, MOCK_OTS, MATERNITY_STATS, todayStr,
} from "@/mocks/dashboardData";
import { AdminStatCard } from "@/components/dashboard/DashboardCards";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, ChartJSTooltip, Legend);

export default function AdminDashboard({ user }: { user: any }) {
  const router = useRouter(); //  ประกาศใช้งาน router
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalHeadcount: 0, newJoiners: 0, expiringContracts: 0 });
  const [deptHeadcount, setDeptHeadcount] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [pendingApprovals, setPendingApprovals] = useState({ ot: 0, leave: 0, contracts: 0 });
  
  //  อัปเดต State Financial ให้มี cost ของ 2 เดือน
  const [financialStats, setFinancialStats] = useState({ totalPayroll: 0, totalOtCost: 0, costTrend: 0, otExceed: false, currentMonthCost: 0, prevMonthCost: 0 });
  
  const [otCostHistory, setOtCostHistory] = useState<any[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<any[]>([]);
  const [topCostCenters, setTopCostCenters] = useState<any[]>([]);
  
  //  State ใหม่สำหรับ Contract Stats แบบแยกตามแผนก
  const [contractStats, setContractStats] = useState<any[]>([]);

  const [attendanceTimeframe, setAttendanceTimeframe] = useState("daily");
  const [leaveTimeframe, setLeaveTimeframe] = useState("monthly");
  const [leaveDepartment, setLeaveDepartment] = useState("all");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // ── Maternity chart tab ──
  const [maternityChartTab, setMaternityChartTab] = useState<"dept" | "trend">("dept");

  const [holidays, setHolidays] = useState([
    { id: 1, startDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-13`, endDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-15`, title: "เทศกาลสงกรานต์" },
    { id: 2, startDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-06`, endDate: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-06`, title: "วันจักรี" },
  ]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ startDate: "", endDate: "", title: "" });
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);

  const deptColorMap: Record<string, string> = {
    IT: "#2563eb", Marketing: "#9333ea", "Human Resources": "#16a34a", Finance: "#d97706", Operations: "#e11d48", "No Department": "#64748b",
  };
  const monthNamesTh = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  useEffect(() => {
    const timer = setTimeout(() => {
      const emps = MOCK_EMPLOYEES;
      const atts = MOCK_ATTENDANCE.filter((a) => a.DATE === todayStr);
      const leaves = MOCK_LEAVES;
      const ots = MOCK_OTS;

      setStats({ totalHeadcount: emps.length, newJoiners: 145, expiringContracts: 28 });
      
      //  เพิ่มข้อมูลจำลองสำหรับ currentMonthCost และ prevMonthCost
      setFinancialStats({ 
        totalPayroll: 24500000, 
        totalOtCost: 850000, 
        costTrend: 5.4, 
        otExceed: true,
        currentMonthCost: 25350000,
        prevMonthCost: 24050000
      });

      setPendingApprovals({
        ot: ots.filter((o: any) => o.log_status === "pending").length,
        leave: leaves.filter((l: any) => l.status === "pending").length,
        contracts: 15,
      });

      const present = atts.filter((a: any) => a.STATUS === "present" || a.STATUS === "on_time").length;
      const late = atts.filter((a: any) => a.STATUS === "late").length;
      const absent = atts.filter((a: any) => a.STATUS === "absent").length;
      const onLeave = leaves.filter((l: any) => l.status === "approved").length;
      setAttendanceStats({ present, absent, late, onLeave });

      const deptMap: Record<string, number> = {};
      emps.forEach((e: any) => {
        const deptName = e.department_name || e.department?.name || "No Department";
        deptMap[deptName] = (deptMap[deptName] || 0) + 1;
      });
      setDeptHeadcount(Object.entries(deptMap).map(([name, count]) => ({ name, count })));

      const months12 = ["เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค."];
      setOtCostHistory(months12.map((m) => ({ month: m, cost: 450000 + Math.random() * 400000 })));
      setExpenseHistory(months12.map((m) => ({ month: m, cost: 20000000 + Math.random() * 5000000 })));

      setTopCostCenters([
        { rank: 1, dept: "ส่วนงานผลิต (Operations)", headName: "สมชาย ชาตรี", cost: 12500000, trend: "+2.1%" },
        { rank: 2, dept: "ฝ่ายเทคโนโลยีสารสนเทศ (IT)", headName: "ณรงค์ โค้ดไว", cost: 4200000, trend: "+5.4%" },
        { rank: 3, dept: "ฝ่ายการตลาดและการขาย", headName: "มาลี สีสด", cost: 3800000, trend: "-1.2%" },
        { rank: 4, dept: "ส่วนงานทรัพยากรบุคคล (HR)", headName: "สมหญิง ใจดี", cost: 1200000, trend: "+0.5%" },
        { rank: 5, dept: "ส่วนงานบัญชีและการเงิน", headName: "ปิติ รักเรียน", cost: 950000, trend: "0.0%" },
      ]);

      //  จำลองข้อมูล สถิติประเภทสัญญาแยกตามแผนก
      setContractStats([
        { dept: "IT", fulltime: 85, contract: 15, probation: 12 },
        { dept: "Marketing", fulltime: 60, contract: 25, probation: 5 },
        { dept: "HR", fulltime: 40, contract: 5, probation: 3 },
        { dept: "Finance", fulltime: 55, contract: 2, probation: 4 },
        { dept: "Operations", fulltime: 320, contract: 80, probation: 45 },
      ]);

      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentCompanyId]);

  const displayAttendanceData = useMemo(() => {
    const base = attendanceStats;
    let m = 1;
    if (attendanceTimeframe === "weekly") m = 5;
    if (attendanceTimeframe === "monthly") m = 22;
    if (attendanceTimeframe === "quarterly") m = 65;
    if (attendanceTimeframe === "yearly") m = 250;
    return [
      { name: "มาทำงาน", value: base.present * m, color: "#22c55e" },
      { name: "สาย", value: base.late * m, color: "#f59e0b" },
      { name: "ขาด", value: base.absent * m, color: "#ef4444" },
      { name: "ลา", value: base.onLeave * m, color: "#3b82f6" },
    ];
  }, [attendanceStats, attendanceTimeframe]);

  const displayLeaveBreakdown = useMemo(() => {
    const baseLeave = attendanceStats.onLeave || 45;
    let timeM = 1;
    if (leaveTimeframe === "weekly") timeM = 5;
    if (leaveTimeframe === "monthly") timeM = 22;
    if (leaveTimeframe === "quarterly") timeM = 65;
    if (leaveTimeframe === "yearly") timeM = 250;
    let deptM = 1;
    if (leaveDepartment === "IT") deptM = 0.056;
    else if (leaveDepartment === "Marketing") deptM = 0.08;
    else if (leaveDepartment === "Human Resources") deptM = 0.023;
    else if (leaveDepartment === "Finance") deptM = 0.04;
    else if (leaveDepartment === "Operations") deptM = 0.80;
    const actualTotal = Math.max(1, Math.round(baseLeave * timeM * deptM));
    return [
      { name: "ลาป่วย", value: Math.round(actualTotal * 0.42), color: "#ef4444" },
      { name: "ลากิจ", value: Math.round(actualTotal * 0.20), color: "#f59e0b" },
      { name: "ลาพักร้อน ", value: Math.round(actualTotal * 0.18), color: "#10b981" },
      { name: "ลาคลอด", value: Math.round(actualTotal * 0.14), color: "#ec4899" },
    ];
  }, [attendanceStats.onLeave, leaveTimeframe, leaveDepartment]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">แดชบร์ด</h1>
      </div>

      {/* ── Stat Cards ── */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatCard title="จำนวนพนักงานทั้งหมด" value={stats.totalHeadcount.toLocaleString()} icon={Users} color="blue" />
          <AdminStatCard title="พนักงานใหม่ (เริ่มงานเดือนนี้)" value={stats.newJoiners.toLocaleString()} icon={UserPlus} color="green" />
          <AdminStatCard title="สัญญาจ้างหมดอายุ (ใน 30 วัน)" value={stats.expiringContracts.toLocaleString()} icon={FileWarning} color="amber" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatCard title="Total Payroll (ยอดรวมเงินเดือน)" value={`฿${(financialStats.totalPayroll / 1000000).toFixed(2)}M`} icon={Wallet} color="purple" />
          <AdminStatCard title="Total OT Cost (ค่าล่วงเวลารวม)" value={`฿${financialStats.totalOtCost.toLocaleString()}`} icon={ClockPlus} color={financialStats.otExceed ? "red" : "green"} highlightValue={financialStats.otExceed} />
          
          {/*  ปรับแก้การ์ด Cost Trend ให้แสดงค่าใช้จ่ายทั้ง 2 เดือนแบบละเอียด */}
          <div className="flex items-center gap-4 p-6 bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
              <TrendingUp size={28} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">Cost Trend (เทียบเดือนก่อน)</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-slate-800 leading-none">+{financialStats.costTrend}%</p>
              </div>
              <p className="text-sm font-bold text-slate-500 mt-1.5 truncate">
                เดือนนี้: <span className="text-amber-600 font-black">฿{(financialStats.currentMonthCost / 1000000).toFixed(2)}M</span> | 
                เดือนก่อน: ฿{(financialStats.prevMonthCost / 1000000).toFixed(2)}M
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Pending Actions ── */}
      {/*  เพิ่ม onClick ผูกกับ router.push และปรับ hover ให้เหมือนปุ่มกดมากขึ้น */}
      <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2 pl-6 pt-6">
            <ClockFading className="text-amber-500" size={20} /> Pending Actions (รายการที่รอการจัดการ)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div onClick={() => router.push('/overtime')} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-400 hover:shadow-lg active:scale-95 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><ClockPlus size={24} /></div>
              <div><span className="font-black text-slate-800 block text-sm group-hover:text-blue-700 transition-colors">OT Requests</span><span className="text-xs font-bold text-slate-400">คำขอทำล่วงเวลา</span></div>
            </div>
            <Badge className="bg-blue-50 text-blue-700 font-black text-base px-3 py-1 border-none group-hover:bg-blue-100">{pendingApprovals.ot}</Badge>
          </div>
          <div onClick={() => router.push('/leaves')} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-purple-400 hover:shadow-lg active:scale-95 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"><CalendarDays size={24} /></div>
              <div><span className="font-black text-slate-800 block text-sm group-hover:text-purple-700 transition-colors">Leave Requests</span><span className="text-xs font-bold text-slate-400">คำขอลางาน</span></div>
            </div>
            <Badge className="bg-purple-50 text-purple-700 font-black text-base px-3 py-1 border-none group-hover:bg-purple-100">{pendingApprovals.leave}</Badge>
          </div>
          <div onClick={() => router.push('/contracts')} className="flex justify-between items-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-amber-400 hover:shadow-lg active:scale-95 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors"><FileSignature size={24} /></div>
              <div><span className="font-black text-slate-800 block text-sm group-hover:text-amber-700 transition-colors">Pending Contracts</span><span className="text-xs font-bold text-slate-400">รอเซ็น/อัปโหลดเอกสาร</span></div>
            </div>
            <Badge className="bg-amber-50 text-amber-700 font-black text-base px-3 py-1 border-none group-hover:bg-amber-100">{pendingApprovals.contracts}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════════
          CHART SECTION — 2-column equal grid
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Headcount by Division */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Headcount by Division</CardTitle></CardHeader>
          <CardContent className="h-80 px-6 pb-6 flex items-center justify-center relative">
            <Pie
              data={{
                labels: ["สายงานปฏิบัติการ", "สายงานการตลาด", "สายงานเทคโนโลยี", "สายงานบริหาร", "สายงานบุคคล"],
                datasets: [{ data: [60, 15, 10, 10, 5], backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"], borderWidth: 2, borderColor: "#ffffff" }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { font: { weight: "bold", size: 11 } } }, tooltip: { callbacks: { label: (c) => ` ${c.raw}%` } } } }}
            />
          </CardContent>
        </Card>

        {/* Cost by Division*/}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader><CardTitle className="text-lg p-6 font-black uppercase flex items-center gap-2"> Cost by Division</CardTitle></CardHeader>
          <CardContent className="h-80 px-6 pb-6 flex items-center justify-center relative">
            <Doughnut
              data={{ labels: ["สายงานปฏิบัติการ", "สายงานเทคโนโลยี", "สายงานการตลาด", "สายงานบริหาร", "สายงานบุคคล"], datasets: [{ data: [50, 20, 15, 10, 5], backgroundColor: ["#0ea5e9", "#6366f1", "#ec4899", "#f59e0b", "#14b8a6"], borderWidth: 0, cutout: "65%" }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right", labels: { font: { weight: "bold", size: 11 } } }, tooltip: { callbacks: { label: (c) => ` ${c.raw}% ของค่าใช้จ่าย` } } } }}
            />
          </CardContent>
        </Card>

        {/* Headcount by Department */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Headcount - By Department</CardTitle></CardHeader>
          <CardContent className="h-80 px-6 pb-6">
            <Bar
              data={{
                labels: deptHeadcount.map(d => d.name),
                datasets: [{ label: "จำนวนพนักงาน", data: deptHeadcount.map(d => d.count), backgroundColor: deptHeadcount.map(d => deptColorMap[d.name] || deptColorMap["No Department"]), borderRadius: { topLeft: 6, topRight: 6 }, barThickness: 40 }]
              }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { font: { size: 10, weight: "bold" } } }, y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 10, weight: "bold" } } } } }}
            />
          </CardContent>
        </Card>

        {/* Monthly OT Cost Trend */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Monthly OT Cost Trend</CardTitle></CardHeader>
          <CardContent className="h-80 overflow-x-auto pb-4 custom-scrollbar">
            <div className="h-full min-w-[400px] px-6 pb-2">
              <Line
                data={{ labels: otCostHistory.map(d => d.month), datasets: [{ label: "OT Cost", data: otCostHistory.map(d => d.cost), borderColor: "#ef4444", borderWidth: 3, tension: 0.4, pointBackgroundColor: "#ef4444", pointBorderColor: "#ffffff", pointBorderWidth: 2, pointRadius: 4 }] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ฿${c.raw.toLocaleString()}` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: "bold" } } }, y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 10, weight: "bold" }, callback: (v) => `฿${v.toLocaleString()}` } } } }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Overview */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <CardTitle className="text-lg font-black uppercase">Attendance Overview</CardTitle>
            <select value={attendanceTimeframe} onChange={(e) => setAttendanceTimeframe(e.target.value)} className="text-base font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-blue-500">
              <option value="daily">รายวัน (Daily)</option>
              <option value="weekly">สัปดาห์นี้ (Weekly)</option>
              <option value="monthly">เดือนนี้ (Monthly)</option>
              <option value="quarterly">ไตรมาสนี้ (Quarterly)</option>
              <option value="yearly">ปีนี้ (Yearly)</option>
            </select>
          </CardHeader>
          <CardContent className="h-96 flex flex-col grid grid-cols-3 items-center pb-2">
            <div className="relative w-full h-[85%] col-span-2 flex items-center justify-center p-4">
              <Doughnut
                data={{ labels: displayAttendanceData.map(d => d.name), datasets: [{ data: displayAttendanceData.map(d => d.value), backgroundColor: displayAttendanceData.map((d, index) => activePieIndex === null || activePieIndex === index ? d.color : d.color + "33"), borderWidth: 0, cutout: "90%", borderRadius: 10, spacing: 3 }] }}
                options={{ responsive: true, maintainAspectRatio: false, onClick: (event, elements) => { if (elements.length > 0) { const index = elements[0].index; setActivePieIndex(activePieIndex === index ? null : index); } else { setActivePieIndex(null); } }, plugins: { legend: { display: false }, tooltip: { padding: 12, cornerRadius: 8, callbacks: { label: (context) => ` ${context.raw.toLocaleString()} คน` } } } }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-lg font-black text-slate-500 transition-colors duration-300">{activePieIndex !== null ? displayAttendanceData[activePieIndex].name : "รวมทั้งหมด"}</span>
                <span className="text-3xl font-black mt-1 transition-colors duration-300" style={{ color: activePieIndex !== null ? displayAttendanceData[activePieIndex].color : "#0f172a" }}>{activePieIndex !== null ? displayAttendanceData[activePieIndex].value.toLocaleString() : displayAttendanceData.reduce((a, b) => a + b.value, 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-2">
              {displayAttendanceData.map((item, index) => (
                <button key={item.name} onClick={() => setActivePieIndex(activePieIndex === index ? null : index)} className={`flex items-center gap-1.5 text-base font-black uppercase transition-all duration-300 hover:scale-105 ${activePieIndex === null || activePieIndex === index ? "text-slate-700" : "text-slate-300"}`}>
                  <div className="w-5 h-3 rounded-sm shadow-sm transition-all duration-300" style={{ backgroundColor: item.color, opacity: activePieIndex === null || activePieIndex === index ? 1 : 0.3 }} />
                  {item.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/*  Monthly Expense Trend */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Monthly Expense Trend (6-12 Months)</CardTitle></CardHeader>
          <CardContent className="h-96 overflow-x-auto pb-4 custom-scrollbar">
            <div className="h-full min-w-[400px] px-6 pb-2">
              <Line
                data={{ labels: expenseHistory.map(d => d.month), datasets: [{ label: "Total Expense", data: expenseHistory.map(d => d.cost), borderColor: "#8b5cf6", borderWidth: 3, tension: 0.4, pointBackgroundColor: "#8b5cf6", pointBorderColor: "#ffffff", pointBorderWidth: 2, pointRadius: 4 }] }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ฿${(Number(c.raw) / 1000000).toFixed(2)}M` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: "bold" } } }, y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 10, weight: "bold" }, callback: (v) => `฿${(Number(v) / 1000000).toFixed(1)}M` } } } }}
              />
            </div>
          </CardContent>
        </Card>

        {/*Leave Breakdown*/}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-4 border-b border-slate-50">
            <CardTitle className="text-lg font-black uppercase">Leave</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none ">
                <select value={leaveDepartment} onChange={(e) => setLeaveDepartment(e.target.value)} className="w-full text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 outline-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="all">ทุกแผนก (All)</option>
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select value={leaveTimeframe} onChange={(e) => setLeaveTimeframe(e.target.value)} className="w-full text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 outline-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 appearance-none">
                  <option value="daily">รายวัน (Daily)</option>
                  <option value="weekly">สัปดาห์นี้ (Weekly)</option>
                  <option value="monthly">เดือนนี้ (Monthly)</option>
                  <option value="quarterly">ไตรมาสนี้ (Quarterly)</option>
                  <option value="yearly">ปีนี้ (Yearly)</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-6 pb-6">
            <div className="h-[280px] w-full">
              <Bar
                data={{ labels: displayLeaveBreakdown.map(l => l.name), datasets: [{ data: displayLeaveBreakdown.map(l => l.value), backgroundColor: displayLeaveBreakdown.map(l => l.color), borderRadius: 6, barThickness: 22 }] }}
                options={{ indexAxis: "y", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${context.raw.toLocaleString()} วัน` } } }, scales: { x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: "bold" } } }, y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: "bold" }, color: "#475569" } } } }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Cost Centers */}
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden pb-3">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg p-6 font-black uppercase">Top 5 Cost Centers (แผนกที่มีค่าใช้จ่ายสูงสุด)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="pb-4 px-6 text-center">Rank</th>
                  <th className="pb-4 px-6">Department</th>
                  <th className="pb-4 px-6 text-right">Total Cost (THB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {topCostCenters.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-50 transition-colors ">
                    <td className="pb-9 px-6 text-center font-black text-slate-400">#{item.rank}</td>
                    <td className="pb-4 px-6">
                      <p className="font-bold text-slate-800">{item.dept}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">Head: {item.headName}</p>
                    </td>
                    <td className="pb-6 px-6 text-right font-mono font-bold text-slate-700">{item.cost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* สถิติสัญญาแยกตามแผนก  */}
        <Card className="rounded-xl border-2 border-slate-300 shadow-sm overflow-hidden lg:col-span-2">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-lg p-6 font-black uppercase flex items-center gap-2">
              สัดส่วนประเภทสัญญาจ้าง
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96 px-6 pt-6 pb-8 overflow-x-auto custom-scrollbar">
            <div className="min-w-[600px] h-full">
              <Bar
                data={{
                  labels: contractStats.map(c => c.dept),
                  datasets: [
                    { label: "พนักงานประจำ", data: contractStats.map(c => c.fulltime), backgroundColor: "#3b82f6", borderRadius: 4 },
                    { label: "สัญญาจ้าง ", data: contractStats.map(c => c.contract), backgroundColor: "#f59e0b", borderRadius: 4 },
                    { label: "ทดลองงาน ", data: contractStats.map(c => c.probation), backgroundColor: "#10b981", borderRadius: 4 },
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top", labels: { font: { weight: "bold", size: 12, padding: 20 } } },
                    tooltip: { mode: 'index', intersect: false, callbacks: { label: (c) => ` ${c.dataset.label}: ${c.raw} คน` } }
                  },
                  scales: {
                    x: { 
                      stacked: true, 
                      grid: { display: false }, 
                      ticks: { font: { size: 11, weight: "bold" }, color: "#475569" } 
                    },
                    y: { 
                      stacked: true, 
                      grid: { color: "#f1f5f9" }, 
                      border: { display: false }, 
                      ticks: { font: { size: 11, weight: "bold" }, color: "#475569" } 
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}