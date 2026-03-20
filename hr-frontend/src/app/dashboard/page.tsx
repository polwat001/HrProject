"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Users,
  Building2,
  Clock,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  ClockPlus,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Loader,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  FileSignature,
  DollarSign,
  FileWarning,
  Wallet,
  Building,
  User,
  Plus,
  Trash2,
  X,
  Edit2
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
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

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
  
  const roleId = activeUser ? Number(activeUser.role_id || activeUser.is_super_admin) : 4;
  const isEmployee = roleId === 4;

  return isEmployee ? <EmployeeSelfService user={activeUser} /> : <AdminDashboard user={activeUser} />;
}

// ==========================================
// 🛡️ ADMIN / HR DASHBOARD
// ==========================================
function AdminDashboard({ user }: { user: any }) {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);

  // States: HR Stats & Data
  const [stats, setStats] = useState({ totalHeadcount: 0, newJoiners: 0, expiringContracts: 0 });
  const [deptHeadcount, setDeptHeadcount] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [pendingApprovals, setPendingApprovals] = useState({ ot: 0, leave: 0, contracts: 0 });
  
  // States: Financial Stats & Data
  const [financialStats, setFinancialStats] = useState({ totalPayroll: 0, totalOtCost: 0, costTrend: 0, otExceed: false });
  const [otCostHistory, setOtCostHistory] = useState<any[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<any[]>([]);
  const [topCostCenters, setTopCostCenters] = useState<any[]>([]);
  
  // States: Filters
  const [attendanceTimeframe, setAttendanceTimeframe] = useState("daily");
  const [leaveTimeframe, setLeaveTimeframe] = useState("monthly");
  const [leaveDepartment, setLeaveDepartment] = useState("all");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // ==========================================
  // 🏖️ HOLIDAY STATE & LOGIC
  // ==========================================
  const [holidays, setHolidays] = useState([
    { id: 1, date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-13`, title: "วันสงกรานต์" },
    { id: 2, date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-14`, title: "วันครอบครัว" },
  ]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: "", title: "" });
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);

  const handleOpenAddHoliday = () => {
    setEditingHolidayId(null);
    setHolidayForm({ date: "", title: "" });
    setShowHolidayModal(true);
  };

  const handleEditHoliday = (holiday: any) => {
    setEditingHolidayId(holiday.id);
    setHolidayForm({ date: holiday.date, title: holiday.title });
    setShowHolidayModal(true);
  };

  const handleSaveHoliday = () => {
    if (!holidayForm.date || !holidayForm.title) return;
    
    if (editingHolidayId) {
      setHolidays((prev) => 
        prev.map((h) => (h.id === editingHolidayId ? { ...h, ...holidayForm } : h))
      );
    } else {
      setHolidays((prev) => [...prev, { id: Date.now(), ...holidayForm }]);
    }
    
    setShowHolidayModal(false);
    setHolidayForm({ date: "", title: "" });
    setEditingHolidayId(null);
  };

  const handleDeleteHoliday = (id: number) => {
    if (!confirm("ยืนยันการลบวันหยุดนี้?")) return;
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  const currentMonthHolidays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = String(calendarDate.getMonth() + 1).padStart(2, "0");
    const prefix = `${year}-${month}`;
    return holidays
      .filter((h) => h.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [calendarDate, holidays]);
  // ==========================================


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
        newJoiners: 145, 
        expiringContracts: 28, 
      });

      setFinancialStats({
        totalPayroll: 24500000, 
        totalOtCost: 850000,    
        costTrend: 5.4,         
        otExceed: true,         
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

  // ✅ สร้างข้อมูลปฏิทินแบบให้ "วันจันทร์" นำหน้า (จ, อ, พ, พฤ, ศ, ส, อา)
  const adminCalendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    let firstDay = new Date(year, month, 1).getDay();
    // แปลง index: ถ้าเป็นวันอาทิตย์ (0) ให้กลายเป็น 6 นอกนั้นลบ 1
    firstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: { day: number; isToday?: boolean; holiday?: any }[] = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      const holiday = holidays.find((h) => h.date === dateStr);
      cells.push({ day: d, isToday, holiday });
    }
    return cells;
  }, [calendarDate, holidays]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Dashboard Overview</h1>
        <p className="text-slate-500 font-normal mt-1">ยินดีต้อนรับ, ข้อมูลสรุปภาพรวมองค์กรและการเงิน</p>
      </div>

      {/* ==========================================
          1. TOP SUMMARY CARDS
          ========================================== */}
      <div className="space-y-4">
        {/* Row 1: HR Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatCard title="จำนวนพนักงานทั้งหมด" value={stats.totalHeadcount.toLocaleString()} icon={Users} color="blue" />
          <AdminStatCard title="พนักงานใหม่ (เริ่มงานเดือนนี้)" value={stats.newJoiners.toLocaleString()} icon={UserPlus} color="green" />
          <AdminStatCard title="สัญญาจ้างหมดอายุ (ใน 30 วัน)" value={stats.expiringContracts.toLocaleString()} icon={FileWarning} color="amber" />
        </div>
        
        {/* Row 2: Financial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdminStatCard title="Total Payroll (ยอดรวมเงินเดือน)" value={`฿${(financialStats.totalPayroll / 1000000).toFixed(2)}M`} icon={Wallet} color="purple" />
          <AdminStatCard 
            title="Total OT Cost (ค่าล่วงเวลารวม)" 
            value={`฿${financialStats.totalOtCost.toLocaleString()}`} 
            icon={Clock} 
            color={financialStats.otExceed ? "red" : "green"} 
            highlightValue={financialStats.otExceed}
          />
          <AdminStatCard title="Cost Trend (เทียบเดือนก่อน)" value={`+${financialStats.costTrend}%`} icon={TrendingUp} color="amber" />
        </div>
      </div>

      {/* ==========================================
          2. PENDING ACTIONS
          ========================================== */}
      <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="p-5 bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} /> Pending Actions (รายการที่รอการจัดการ)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          <div className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"><ClockPlus size={24} /></div>
              <div>
                <span className="font-black text-slate-800 block text-sm">OT Requests</span>
                <span className="text-xs font-bold text-slate-400">คำขอทำล่วงเวลา</span>
              </div>
            </div>
            <Badge className="bg-slate-100 text-slate-700 font-black text-base px-3 py-1 border-none">{pendingApprovals.ot}</Badge>
          </div>
          
          <div className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-purple-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors"><CalendarDays size={24} /></div>
              <div>
                <span className="font-black text-slate-800 block text-sm">Leave Requests</span>
                <span className="text-xs font-bold text-slate-400">คำขอลางาน</span>
              </div>
            </div>
            <Badge className="bg-slate-100 text-slate-700 font-black text-base px-3 py-1 border-none">{pendingApprovals.leave}</Badge>
          </div>

          <div className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-200 shadow-sm group hover:border-amber-300 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors"><FileSignature size={24} /></div>
              <div>
                <span className="font-black text-slate-800 block text-sm">Pending Contracts</span>
                <span className="text-xs font-bold text-slate-400">รอเซ็น/อัปโหลดเอกสาร</span>
              </div>
            </div>
            <Badge className="bg-slate-100 text-slate-700 font-black text-base px-3 py-1 border-none">{pendingApprovals.contracts}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================
          3. CHARTS & CALENDAR
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* =========== คอลัมน์ซ้าย (HR Metrics) =========== */}
        <div className="space-y-6">
          
          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Headcount by Division</CardTitle></CardHeader>
            <CardContent className="h-80 px-6 pb-6 flex items-center justify-center relative">
              <Pie 
                data={{
                  labels: ["สายงานปฏิบัติการ", "สายงานการตลาด", "สายงานเทคโนโลยี", "สายงานบริหาร", "สายงานบุคคล"],
                  datasets: [{
                    data: [60, 15, 10, 10, 5],
                    backgroundColor: ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e"],
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    borderRadius: 10,
                  }]
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { 
                    legend: { position: 'right', labels: { font: { weight: 'bold', size: 11 } } },
                    tooltip: { callbacks: { label: (c) => ` ${c.raw}%` } },
                
                  }
                }}
              />
            </CardContent>
          </Card>

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
                    responsive: true, maintainAspectRatio: false,
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
                      className="w-5 h-3 rounded-sm shadow-sm transition-all duration-300" 
                      style={{ 
                        backgroundColor: item.color,
                        opacity: activePieIndex === null || activePieIndex === index ? 1 : 0.3 
                      }} 
                    />
                    {item.name}
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
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => ` ${context.raw.toLocaleString()} วัน` } } },
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

        {/* =========== คอลัมน์ขวา (Financial & Operations) =========== */}
        <div className="space-y-6">

          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader><CardTitle className="text-lg p-6 font-black uppercase flex items-center gap-2"><DollarSign size={20} className="text-emerald-500"/> Cost by Division</CardTitle></CardHeader>
            <CardContent className="h-80 px-6 pb-6 flex items-center justify-center relative">
              <Doughnut 
                data={{
                  labels: ["สายงานปฏิบัติการ", "สายงานเทคโนโลยี", "สายงานการตลาด", "สายงานบริหาร", "สายงานบุคคล"],
                  datasets: [{
                    data: [50, 20, 15, 10, 5],
                    backgroundColor: ["#0ea5e9", "#6366f1", "#ec4899", "#f59e0b", "#14b8a6"],
                    borderWidth: 0,
                    
                    cutout: '65%'
                  }]
                }}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { 
                    legend: { position: 'right', labels: { font: { weight: 'bold', size: 11 } } },
                    tooltip: { callbacks: { label: (c) => ` ${c.raw}% ของค่าใช้จ่าย` } }
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Monthly OT Cost Trend</CardTitle></CardHeader>
            <CardContent className="h-[250px] overflow-x-auto pb-4 custom-scrollbar">
              <div className="h-full min-w-[600px] pr-6 pb-2">
                <Line 
                  data={{
                    labels: otCostHistory.map(d => d.month),
                    datasets: [{
                      label: "OT Cost",
                      data: otCostHistory.map(d => d.cost),
                      borderColor: "#ef4444",
                      borderWidth: 3,
                      tension: 0.4,
                      pointBackgroundColor: "#ef4444",
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

          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader><CardTitle className="text-lg p-6 font-black uppercase">Monthly Expense Trend (6-12 Months)</CardTitle></CardHeader>
            <CardContent className="h-[250px] overflow-x-auto pb-4 custom-scrollbar">
              <div className="h-full min-w-[600px] pr-6 pb-2">
                <Line 
                  data={{
                    labels: expenseHistory.map(d => d.month),
                    datasets: [{
                      label: "Total Expense",
                      data: expenseHistory.map(d => d.cost),
                      borderColor: "#8b5cf6", 
                      borderWidth: 3,
                      tension: 0.4,
                      pointBackgroundColor: "#8b5cf6",
                      pointBorderColor: "#ffffff",
                      pointBorderWidth: 2,
                      pointRadius: 4,
                    }]
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ฿${(Number(c.raw)/1000000).toFixed(2)}M` } } },
                    scales: {
                      x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } },
                      y: { grid: { color: "#f1f5f9" }, border: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, callback: (v) => `฿${(Number(v)/1000000).toFixed(1)}M` } }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg p-6 font-black uppercase">Top 5 Cost Centers (แผนกที่มีค่าใช้จ่ายสูงสุด)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="py-4 px-6 text-center">Rank</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6 text-right">Total Cost (THB)</th>
                    <th className="py-4 px-6 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topCostCenters.map((item) => (
                    <tr key={item.rank} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-center font-black text-slate-400">#{item.rank}</td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{item.dept}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">Head: {item.headName}</p>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-slate-700">
                        {item.cost.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black ${item.trend.startsWith('+') ? 'text-red-600 bg-red-50' : item.trend.startsWith('-') ? 'text-green-600 bg-green-50' : 'text-slate-500 bg-slate-100'}`}>
                          {item.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          

        </div>
      </div>
{/* ✅ Company Calendar & Holidays (Layout ใหม่ - ซ้ายวันหยุด ขวาปฏิทิน + เริ่มต้นวันจันทร์) */}
          <Card className="rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-[600px]">
            <CardTitle className="text-xl font-black mb-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 uppercase tracking-tight">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-blue-500" /> Company Calendar
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleOpenAddHoliday}
                  className="flex items-center gap-1 text-base font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors px-3 py-1.5 rounded-xl border border-red-100"
                >
                  <Plus size={14} /> Add Holiday
                </button>
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1">
                  <button onClick={prevMonth} className="p-1  text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><ChevronLeft size={16} /></button>
                  <span className="w-36 text-center text-base font-bold text-slate-700">{monthNamesTh[calendarDate.getMonth()]} {calendarDate.getFullYear() + 543}</span>
                  <button onClick={nextMonth} className="p-1  text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"><ChevronRight size={16} /></button>
                </div>
              </div>
            </CardTitle>

            <div className="flex flex-col lg:flex-row gap-6 h-full">
              {/* ซ้าย: รายการวันหยุด */}
              <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 pt-10 lg:pb-0 lg:pr-6">
                <h5 className=" font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={14} /> วันหยุดประจำเดือนนี้
                </h5>
                <div className="space-y-3 h-auto overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {currentMonthHolidays.length === 0 ? (
                    <p className="text-center text-xs font-bold text-slate-400 py-4 bg-slate-50 rounded-xl border border-slate-100">ไม่มีวันหยุดในเดือนนี้</p>
                  ) : (
                    currentMonthHolidays.map((h) => (
                      <div key={h.id} className="flex  gap-2 bg-slate-50 px-3 py-2.5 justify-between rounded-xl border border-slate-100 group hover:border-red-200  transition-all">
                        <div className="flex items-center gap-3">
                          <span className="w-8 shrink-0 text-center text-base font-black text-red-500 bg-red-100 rounded-md py-0.5">
                            {parseInt(h.date.split("-")[2])}
                          </span>
                          <span className="text-base font-bold text-slate-700 leading-tight">{h.title}</span>
                        </div>
                        <div className="flex self-end gap-1 opacity-50 group-hover:opacity-100 transition-all">
                          <button onClick={() => handleEditHoliday(h)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteHoliday(h.id)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* ขวา: ตารางปฏิทิน */}
              <div className="w-full lg:w-2/3">
                <div className="grid grid-cols-7 gap-2">
                  {/* เปลี่ยนให้ "วันจันทร์" (จ) นำหน้า แล้วย้าย ส, อา ไปไว้หลังสุด */}
                  {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
                    <div key={d} className={`text-center text-base font-black uppercase tracking-widest mb-2 ${d === 'ส' || d === 'อา' ? 'text-red-400' : 'text-slate-400'}`}>
                      {d}
                    </div>
                  ))}
                  {adminCalendarData.map((cell, idx) => (
                    <div 
                      key={idx} 
                      title={cell.holiday?.title}
                      className={`h-14 rounded-xl flex flex-col items-center justify-center border border-slate-200 relative ${
                        cell.day === 0 ? "bg-transparent border-none" : "bg-white shadow-sm hover:border-blue-200 transition-colors cursor-pointer"
                      } ${cell.holiday ? "bg-red-50 border-red-100" : ""}`}
                    >
                      <span className={`text-xs font-black z-10 ${
                        cell.isToday 
                          ? "text-white bg-blue-600 w-6 h-6 rounded-full flex items-center justify-center shadow-md" 
                          : cell.holiday ? "text-red-600" : "text-slate-600"
                      }`}>
                        {cell.day || ""}
                      </span>
                      {cell.holiday && <div className="w-1.5 h-1.5 rounded-full mt-1 bg-red-500 absolute bottom-2" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
      {/* Modal Add/Edit Holiday */}
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHolidayModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {editingHolidayId ? "แก้ไขวันหยุด (Edit Holiday)" : "ตั้งค่าวันหยุด (Add Holiday)"}
              </h3>
              <button onClick={() => setShowHolidayModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">วันที่ (Date)</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">ชื่อวันหยุด (Title)</label>
                <input
                  type="text"
                  value={holidayForm.title}
                  onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })}
                  placeholder="เช่น วันปิยมหาราช"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowHolidayModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={handleSaveHoliday}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editingHolidayId ? "บันทึกการแก้ไข" : "บันทึกวันหยุด"}
              </button>
            </div>
          </div>
        </div>
      )}
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

  // const tenure = useMemo(() => {
  //   if (!employeeProfile?.hire_date) return "-";
  //   const hire = new Date(employeeProfile.hire_date);
  //   const today = new Date();
  //   const totalMonths = (today.getFullYear() - hire.getFullYear()) * 12 + (today.getMonth() - hire.getMonth());
  //   return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
  // }, [employeeProfile?.hire_date]);

  // ✅ เปลี่ยน Employee Calendar ให้เริ่มต้นด้วยวันจันทร์เช่นกัน
  const calendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Shift ให้วันจันทร์ = 0
    
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
            {/* วันจันทร์ นำหน้าตามที่ขอมาครับ */}
            {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
              <div key={d} className={`text-center text-[10px] font-black uppercase tracking-widest mb-2 ${d === 'ส' || d === 'อา' ? 'text-red-400' : 'text-slate-400'}`}>{d}</div>
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

function AdminStatCard({ title, value, icon: Icon, color, highlightValue = false }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
      <div>
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-3xl font-black ${highlightValue ? "text-red-600" : "text-slate-900"}`}>{value}</h3>
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