"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { employeeAPI, attendanceAPI, leaveAPI, otAPI } from "@/services/api";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Briefcase,
  Loader,
  Clock,
  CalendarDays,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip as ChartJSTooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  ChartJSTooltip,
  Legend
);

// ==========================================
// 📦 MOCK DATA (จำลองข้อมูลหลักแสนคน)
// ==========================================
const todayStr = new Date().toISOString().split("T")[0];

const generateMockEmployees = () => {
  const depts = [
    { name: "IT", count: 8500 },
    { name: "Marketing", count: 12000 },
    { name: "Human Resources", count: 3500 },
    { name: "Finance", count: 6000 },
    { name: "Operations", count: 120000 },
  ];
  let id = 1;
  let emps: any[] = [];
  depts.forEach((d) => {
    for (let i = 0; i < d.count; i++) {
      emps.push({
        id: id,
        user_id: id === 1 ? 4 : 100 + id,
        company_id: 1,
        firstname_th: id === 1 ? "สมชาย" : `พนักงานที่${id}`,
        lastname_th: id === 1 ? "มั่นคง" : `นามสกุล${id}`,
        department_name: d.name,
        position_name: id === 1 ? "Senior Developer" : "Staff",
        employee_code: `${d.name.substring(0, 2).toUpperCase()}-${String(i + 1).padStart(6, "0")}`,
        hire_date: "2020-05-15",
        STATUS: "active",
      });
      id++;
    }
  });
  return emps;
};
const MOCK_EMPLOYEES = generateMockEmployees();

const generateMockAttendance = () => {
  const atts: any[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  for (let i = 1; i <= today; i++) {
    const d = new Date(year, month, i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      const dateStr = d.toISOString().split("T")[0];
      const isLate = Math.random() > 0.8;
      atts.push({
        id: 100 + i,
        employee_id: 1,
        company_id: 1,
        DATE: dateStr,
        check_in_time: isLate ? "09:15:00" : "08:14:00",
        check_out_time: i === today ? "" : "17:30:00",
        STATUS: isLate ? "late" : "present",
      });
    }
  }

  MOCK_EMPLOYEES.forEach((emp) => {
    if (emp.id === 1) return;
    const rand = Math.random();
    let status = "present";
    let checkIn = "08:15:00";
    if (rand > 0.97) { status = "absent"; checkIn = ""; }
    else if (rand > 0.85) { status = "late"; checkIn = "09:20:00"; }
    atts.push({ id: 200 + emp.id, employee_id: emp.id, company_id: 1, DATE: todayStr, check_in_time: checkIn, check_out_time: status === "absent" ? "" : "17:30:00", STATUS: status });
  });

  return atts;
};
const MOCK_ATTENDANCE = generateMockAttendance();

const MOCK_LEAVES = Array.from({ length: 3500 }).map((_, i) => ({
  id: i + 1, employee_id: Math.floor(Math.random() * 150000) + 1, company_id: 1, start_date: todayStr, end_date: todayStr, status: i < 3000 ? "approved" : "pending",
}));

const MOCK_OTS = Array.from({ length: 4200 }).map((_, i) => ({
  id: i + 1, employee_id: Math.floor(Math.random() * 150000) + 1, company_id: 1, date: todayStr, hours: Math.floor(Math.random() * 4) + 1, log_status: i < 3500 ? "approved" : "pending",
}));
MOCK_OTS.push(
  { id: 99998, employee_id: 1, company_id: 1, date: new Date(Date.now() - 86400000).toISOString(), hours: 2, log_status: "approved" },
  { id: 99999, employee_id: 1, company_id: 1, date: new Date(Date.now() - 172800000).toISOString(), hours: 3, log_status: "approved" },
);

// ==========================================
// 🚀 MAIN WRAPPER
// ==========================================
export default function DashboardPage() {
  const { user } = useAppStore();
  const activeUser = user || { id: 4, role_id: 4, username: "somchai", firstName: "สมชาย" };
  const roleId = activeUser.role_id || activeUser.is_super_admin;
  const isEmployee = Number(roleId) === 4;

  return isEmployee ? <EmployeeSelfService user={activeUser} /> : <AdminDashboard user={activeUser} />;
}

// ==========================================
// 🛡️ ADMIN / HR DASHBOARD
// ==========================================
function AdminDashboard({ user }: { user: any }) {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalHeadcount: 0, activeEmployees: 0 });
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [deptHeadcount, setDeptHeadcount] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState({ ot: 0, leave: 0 });
  const [otCostHistory, setOtCostHistory] = useState<any[]>([]);
  
  const [attendanceTimeframe, setAttendanceTimeframe] = useState("daily");
  const [leaveTimeframe, setLeaveTimeframe] = useState("monthly");
  const [leaveDepartment, setLeaveDepartment] = useState("all");
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

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

      setStats({
        totalHeadcount: emps.length,
        activeEmployees: emps.filter((e: any) => e.STATUS === "active").length,
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

      setPendingApprovals({
        ot: ots.filter((o: any) => o.log_status === "pending").length,
        leave: leaves.filter((l: any) => l.status === "pending").length,
      });

      const months12 = ["เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค."];
      setOtCostHistory(months12.map((m) => ({ month: m, cost: 450000 + Math.random() * 150000 })));

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
      { name: "ลาป่วย (Sick)", value: Math.round(actualTotal * 0.55), color: "#ef4444" },
      { name: "ลากิจ (Personal)", value: Math.round(actualTotal * 0.25), color: "#f59e0b" },
      { name: "ลาพักร้อน (Annual)", value: Math.round(actualTotal * 0.20), color: "#10b981" },
    ];
  }, [attendanceStats.onLeave, leaveTimeframe, leaveDepartment]);

  const activePieData = useMemo(() => {
    if (activePieIndex !== null && displayAttendanceData[activePieIndex]) {
      return displayAttendanceData[activePieIndex];
    }
    const total = displayAttendanceData.reduce((sum, item) => sum + item.value, 0);
    return { name: "รวมทั้งหมด", value: total, color: "#000000" }; 
  }, [activePieIndex, displayAttendanceData]);

  const adminCalendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number; hasEvent?: boolean; isToday?: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      cells.push({ day: d, hasEvent: Math.random() > 0.7, isToday });
    }
    return cells;
  }, [calendarDate]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Dashboard Overview</h1>
        <p className="text-slate-500 font-normal">ยินดีต้อนรับกลับ, {user?.firstName || user?.username}</p>
      </div>

      {/* ✅ ลบ Trend Indicator ออกจากการ์ดสถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="จำนวนพนักงานทั้งหมด" value={stats.totalHeadcount.toLocaleString()} icon={Users} color="blue" />
        <AdminStatCard title="พนักงานที่ทำงานอยู่" value={stats.activeEmployees.toLocaleString()} icon={Briefcase} color="green" />
        <AdminStatCard title="มาทำงาน (วันนี้)" value={attendanceStats.present.toLocaleString()} icon={Users} color="purple" />
        <AdminStatCard title="อยู่ระหว่างการลางาน" value={attendanceStats.onLeave.toLocaleString()} icon={AlertTriangle} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= ซ้าย ================= */}
        <div className="space-y-6">
          
          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Headcount - By Department</CardTitle></CardHeader>
            <CardContent className="h-80 px-6 pb-6">
              <Bar 
                data={{
                  labels: deptHeadcount.map(d => d.name),
                  datasets: [{
                    label: 'จำนวนพนักงาน',
                    data: deptHeadcount.map(d => d.count),
                    backgroundColor: deptHeadcount.map(d => deptColorMap[d.name] || deptColorMap["No Department"]),
                    borderRadius: { topLeft: 6, topRight: 6 },
                    barThickness: 40,
                  }]
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
                    y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
              <CardTitle className="text-lg font-black uppercase">Attendance Overview</CardTitle>
              <select
                value={attendanceTimeframe}
                onChange={(e) => setAttendanceTimeframe(e.target.value)}
                className="text-base font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-100 focus:ring-2 focus:ring-blue-500"
              >
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
                  data={{
                    labels: displayAttendanceData.map(d => d.name),
                    datasets: [{
                      data: displayAttendanceData.map(d => d.value),
                      backgroundColor: displayAttendanceData.map((d, index) => 
                        activePieIndex === null || activePieIndex === index ? d.color : d.color + "33"
                      ),
                      borderWidth: 0,
                      cutout: '90%',
                      borderRadius: 10,
                      spacing: 3
                    }]
                  }}
                  options={{
                    responsive: true, 
                    maintainAspectRatio: false,
                    onClick: (event, elements) => {
                      if (elements.length > 0) {
                        const index = elements[0].index;
                        setActivePieIndex(activePieIndex === index ? null : index);
                      } else {
                        setActivePieIndex(null);
                      }
                    },
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        padding: 12, cornerRadius: 8,
                        callbacks: { label: (context) => ` ${context.raw.toLocaleString()} คน` }
                      }
                    }
                  }}
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <span className="text-lg font-black text-slate-500 transition-colors duration-300">
                    {activePieIndex !== null ? displayAttendanceData[activePieIndex].name : "รวมทั้งหมด"}
                  </span>
                  <span 
                    className="text-3xl font-black mt-1 transition-colors duration-300" 
                    style={{ color: activePieIndex !== null ? displayAttendanceData[activePieIndex].color : "#0f172a" }}
                  >
                    {activePieIndex !== null 
                      ? displayAttendanceData[activePieIndex].value.toLocaleString()
                      : displayAttendanceData.reduce((a,b)=>a+b.value, 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                {displayAttendanceData.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => setActivePieIndex(activePieIndex === index ? null : index)}
                    className={`flex items-center gap-1.5 text-base font-black uppercase transition-all duration-300 hover:scale-105 ${
                      activePieIndex === null || activePieIndex === index ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    <div 
                      className="w-5 h-3  rounded-sm shadow-sm transition-all duration-300" 
                      style={{ 
                        backgroundColor: item.color,
                        opacity: activePieIndex === null || activePieIndex === index ? 1 : 0.3 
                      }} 
                    />
                    {item.name} <span className="opacity-70"></span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-4 border-b border-slate-50">
              <CardTitle className="text-lg font-black uppercase">Leave Breakdown</CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
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
              <div className="h-[200px] w-full">
                <Bar 
                  data={{
                    labels: displayLeaveBreakdown.map(l => l.name),
                    datasets: [{
                      data: displayLeaveBreakdown.map(l => l.value),
                      backgroundColor: displayLeaveBreakdown.map(l => l.color),
                      borderRadius: 6,
                      barThickness: 24,
                    }]
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { callbacks: { label: (context) => ` ${context.raw.toLocaleString()} วัน` } }
                    },
                    scales: {
                      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
                      y: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 11, weight: 'bold' }, color: '#475569' } }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ================= ขวา ================= */}
        <div className="space-y-6">
          <Card className="rounded-xl border border-gray-200 shadow-sm p-6">
            <CardTitle className="text-lg font-black mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 uppercase tracking-tight">
              <div className="flex items-center gap-2"><CalendarDays className="text-blue-500" /> Company Calendar</div>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-2 py-1">
                <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><ChevronLeft size={18} /></button>
                <span className="w-32 text-center text-sm font-bold text-slate-700">{monthNamesTh[calendarDate.getMonth()]} {calendarDate.getFullYear() + 543}</span>
                <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><ChevronRight size={18} /></button>
              </div>
            </CardTitle>
            <div className="grid grid-cols-7 gap-2">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{d}</div>
              ))}
              {adminCalendarData.map((cell, idx) => (
                <div key={idx} className={`h-16 rounded-2xl flex flex-col items-center justify-center border border-slate-50 ${cell.day === 0 ? "bg-transparent border-none" : "bg-white shadow-sm hover:border-blue-200 transition-colors cursor-pointer"}`}>
                  <span className={`text-xs font-black ${cell.isToday ? "text-white bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center shadow-md" : "text-slate-600"}`}>
                    {cell.day || ""}
                  </span>
                  {cell.day !== 0 && cell.hasEvent && <div className="w-1.5 h-1.5 rounded-full mt-1 bg-amber-400" />}
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-xl h-70 border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg p-6 font-black uppercase flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} /> Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-blue-50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><Clock size={20} /></div>
                  <span className="font-bold text-slate-700 uppercase text-sm">OT Requests</span>
                </div>
                <Badge className="bg-slate-200 text-slate-700 font-black group-hover:bg-blue-600 group-hover:text-white transition-colors border-none">
                  {pendingApprovals.ot.toLocaleString()} pending
                </Badge>
              </div>
              <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-purple-50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600"><CalendarDays size={20} /></div>
                  <span className="font-bold text-slate-700 uppercase text-sm">Leave Requests</span>
                </div>
                <Badge className="bg-slate-200 text-slate-700 font-black group-hover:bg-purple-600 group-hover:text-white transition-colors border-none">
                  {pendingApprovals.leave.toLocaleString()} pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">OT Cost (12 Months)</CardTitle></CardHeader>
            <CardContent className="h-[250px] overflow-x-auto pb-4 custom-scrollbar">
              <div className="h-full min-w-[800px] pr-6 pb-2">
                <Line 
                  data={{
                    labels: otCostHistory.map(d => d.month),
                    datasets: [{
                      data: otCostHistory.map(d => d.cost),
                      borderColor: "#0ea5e9",
                      borderWidth: 3,
                      tension: 0.4,
                      pointBackgroundColor: "#0ea5e9",
                      pointBorderColor: "#ffffff",
                      pointBorderWidth: 2,
                      pointRadius: 4,
                    }]
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ฿${c.raw.toLocaleString()}` } } },
                    scales: {
                      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
                      y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, callback: (v) => `฿${v.toLocaleString()}` } }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 👤 EMPLOYEE SELF-SERVICE
// ==========================================
function EmployeeSelfService({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [otRecords, setOtRecords] = useState<any[]>([]);

  const [calendarDate, setCalendarDate] = useState(new Date());

  const monthNamesTh = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ];

  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentEmp = MOCK_EMPLOYEES.find((e: any) => Number(e.user_id) === Number(user.id)) || MOCK_EMPLOYEES[0];
      setEmployeeProfile(currentEmp);

      const actualEmpId = currentEmp.id;
      setAttendanceRecords(MOCK_ATTENDANCE.filter((a) => a.employee_id === actualEmpId));
      setOtRecords(MOCK_OTS.filter((o) => o.employee_id === actualEmpId));

      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  const tenure = useMemo(() => {
    if (!employeeProfile?.hire_date) return "-";
    const hire = new Date(employeeProfile.hire_date);
    const today = new Date();
    const totalMonths = (today.getFullYear() - hire.getFullYear()) * 12 + (today.getMonth() - hire.getMonth());
    return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
  }, [employeeProfile?.hire_date]);

  const calendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const attendanceMap = new Map();
    attendanceRecords.forEach((r: any) => {
      const dateStr = (r.DATE || r.date)?.split("T")[0];
      if (dateStr) attendanceMap.set(dateStr, r);
    });

    const cells: { day: number; record?: any; isToday?: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      cells.push({ day: d, record: attendanceMap.get(dateStr), isToday });
    }
    return cells;
  }, [attendanceRecords, calendarDate]);

  const otTotalHours = otRecords.filter((r) => r.log_status === "approved").reduce((sum, r) => sum + Number(r.hours || 0), 0);
  const sortedAtt = [...attendanceRecords].sort((a, b) => new Date(b.DATE).getTime() - new Date(a.DATE).getTime());
  const latestAtt = sortedAtt.find((r) => r.check_in_time);
  const formatTime = (t: string) => (t ? t.split(":").slice(0, 2).join(":") : "--:--");
  const LEAVE_COLORS = ["#3b82f6", "#f59e0b", "#10b981"];

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500 bg-slate-50/30 min-h-screen">
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter ">Self-Service</h2>

      <Card className="rounded-[2.5rem] border-none shadow-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-200">
            {employeeProfile?.firstname_th?.charAt(0) || user?.username?.charAt(0)}
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900">
              {employeeProfile?.firstname_th || user?.username} {employeeProfile?.lastname_th || ""}
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-blue-500" /> {employeeProfile?.position_name || "พนักงาน"}</span>
              <span className="flex items-center gap-1.5"><Building size={16} className="text-blue-500" /> {employeeProfile?.department_name || "ทั่วไป"}</span>
              <span className="flex items-center gap-1.5"><User size={16} className="text-blue-500" /> รหัส: {employeeProfile?.employee_code || "-"}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-blue-500" /> อายุงาน: {tenure}</span>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 px-4 py-1.5 font-black uppercase rounded-xl border-none">
            {employeeProfile?.STATUS || "Active"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SelfServiceSummaryCard icon={CalendarDays} label="วันลาคงเหลือ" value="38 วัน" color="emerald" />
        <SelfServiceSummaryCard icon={TrendingUp} label="OT เดือนนี้" value={`${otTotalHours.toLocaleString()} ชม.`} color="teal" />
        <SelfServiceSummaryCard
          icon={Clock}
          label="ลงเวลาล่าสุด"
          value={latestAtt ? `${formatTime(latestAtt.check_in_time)} - ${latestAtt.check_out_time ? formatTime(latestAtt.check_out_time) : "??"}` : "N/A"}
          color="blue"
          isMono
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-xl border-none shadow-sm p-6">
          <CardTitle className="text-lg font-black mb-6 uppercase tracking-tight">โควต้าวันลา</CardTitle>
          <div className="space-y-4">
            {[
              { t: "ลาป่วย", u: 2, tot: 30 },
              { t: "ลากิจ", u: 1, tot: 6 },
              { t: "พักร้อน", u: 0, tot: 10 },
            ].map((q, i) => (
              <div key={q.t} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="w-12 h-12 shrink-0">
                  <Doughnut
                    data={{
                      labels: ["ใช้แล้ว", "คงเหลือ"],
                      datasets: [{
                        data: [q.u, Math.max(0, q.tot - q.u)],
                        backgroundColor: [LEAVE_COLORS[i % LEAVE_COLORS.length], "#f1f5f9"],
                        borderWidth: 0,
                        cutout: '70%',
                      }]
                    }}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false }, tooltip: { enabled: false } },
                    }}
                  />
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <span className="font-bold text-slate-600">{q.t}</span>
                  <span className="font-black text-slate-900">{q.u}/{q.tot} วัน</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 rounded-xl border-none shadow-sm p-6">
          <CardTitle className="text-lg font-black mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 uppercase tracking-tight">
            <div className="flex items-center gap-2"><Clock className="text-blue-500" /> ปฏิทินเข้างาน</div>
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-2 py-1">
              <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><ChevronLeft size={18} /></button>
              <span className="w-32 text-center text-sm font-bold text-slate-700">{monthNamesTh[calendarDate.getMonth()]} {calendarDate.getFullYear() + 543}</span>
              <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all"><ChevronRight size={18} /></button>
            </div>
          </CardTitle>
          <div className="grid grid-cols-7 gap-2">
            {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
              <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{d}</div>
            ))}
            {calendarData.map((cell, idx) => (
              <div key={idx} className={`h-16 rounded-2xl flex flex-col items-center justify-center border border-slate-50 ${cell.day === 0 ? "bg-transparent border-none" : "bg-white shadow-sm"}`}>
                <span className={`text-xs font-black ${cell.isToday ? "text-white bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center shadow-md" : "text-slate-400"}`}>
                  {cell.day || ""}
                </span>
                {cell.record && <div className={`w-2 h-2 rounded-full mt-1 ${cell.record.STATUS?.toLowerCase() === "present" ? "bg-green-500" : "bg-orange-400"}`} />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm p-8 overflow-hidden">
        <CardTitle className="text-lg font-black mb-6 uppercase tracking-tight">คำขอ OT ล่าสุด</CardTitle>
        <div className="space-y-4">
          {otRecords.slice(0, 3).map((r) => (
            <div key={r.id} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
              <span className="font-bold text-slate-700 text-sm">
                {new Date(r.date).toLocaleDateString("th-TH")} ({r.hours} ชม.)
              </span>
              <Badge className="bg-blue-600 text-white border-none px-5 py-1 rounded-full uppercase text-[10px] font-black shadow-sm">
                {r.log_status === "approved" ? "อนุมัติแล้ว" : "รออนุมัติ"}
              </Badge>
            </div>
          ))}
          {otRecords.length === 0 && <p className="text-center py-4 text-slate-400 font-bold">ไม่พบประวัติการทำ OT</p>}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 🛠️ SHARED HELPER COMPONENTS
// ==========================================

function AdminStatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
      <div>
        <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-900">{value}</h3>
      </div>
      <div className={`p-4 rounded-3xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
    </div>
  );
}

function SelfServiceSummaryCard({ icon: Icon, label, value, color, isMono }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card className="rounded-xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-all">
      <div className={`p-4 rounded-2xl ${colors[color]}`}><Icon size={28} /></div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black text-slate-900 mt-1 ${isMono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </Card>
  );
}