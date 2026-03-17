"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { 
  employeeAPI, attendanceAPI, leaveAPI, otAPI 
} from "@/services/api";
import {
  Users, TrendingUp, AlertTriangle, Briefcase, Loader,
  ArrowUpRight, ArrowDownRight, Clock, CalendarDays, User, Building, Timer
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line 
} from "recharts";

// ==========================================
// 🚀 MAIN WRAPPER (ตัวแยกสิทธิ์หน้าจอ)
// ==========================================
export default function DashboardPage() {
  const { user } = useAppStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // 💡 Role ID 4 = Employee
  const roleId = user.role_id || user.is_super_admin;
  const isEmployee = Number(roleId) === 4;

  return isEmployee ? <EmployeeSelfService user={user} /> : <AdminDashboard user={user} />;
}

// ==========================================
// 🛡️ ADMIN / HR DASHBOARD
// ==========================================
function AdminDashboard({ user }: { user: any }) {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ totalHeadcount: 0, activeEmployees: 0 });
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [deptHeadcount, setDeptHeadcount] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState({ ot: 0, leave: 0 });
  const [otCostHistory, setOtCostHistory] = useState<any[]>([]);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const [empRes, attRes, leaveRes, otRes] = await Promise.all([
          employeeAPI.getEmployees(),
          attendanceAPI.getAttendanceLogs({ startDate: todayStr, endDate: todayStr }),
          leaveAPI.getLeaveRequests({ companyId: currentCompanyId || undefined }),
          otAPI.getOTRecords(),
          
        ]);

        const emps = empRes.data || [];
        const atts = attRes.data || [];
        const leaves = leaveRes.data || [];
        const ots = otRes.data || [];

        const filteredEmps = currentCompanyId ? emps.filter((e: any) => e.company_id === currentCompanyId) : emps;

        setStats({
          totalHeadcount: filteredEmps.length,
          activeEmployees: filteredEmps.filter((e: any) => e.STATUS === "active").length,
        });

        const present = atts.filter((a: any) => (a.STATUS === "present" || a.STATUS === "on_time")).length;
        const late = atts.filter((a: any) => a.STATUS === "late").length;
        const absent = atts.filter((a: any) => a.STATUS === "absent").length;
        const onLeave = leaves.filter((l: any) => l.status === "approved" && new Date(todayStr) >= new Date(l.start_date) && new Date(todayStr) <= new Date(l.end_date)).length;

        setAttendanceStats({ present, absent, late, onLeave });
        setAttendanceData([
          { name: "มาทำงาน", value: present, color: "#22c55e" },
          { name: "สาย", value: late, color: "#f59e0b" },
          { name: "ขาด", value: absent, color: "#ef4444" },
          { name: "ลา", value: onLeave, color: "#3b82f6" },
        ]);

       const deptMap: Record<string, number> = {};

filteredEmps.forEach((e: any) => {
  const deptName =
    e.department_name ||
    e.department?.name ||
    "No Department";

  deptMap[deptName] = (deptMap[deptName] || 0) + 1;
});

const deptData = Object.entries(deptMap).map(([name, count]) => ({
  name,
  count,
}));

setDeptHeadcount(deptData);

        setPendingApprovals({
          ot: ots.filter((o: any) => o.log_status === "pending").length,
          leave: leaves.filter((l: any) => l.status === "pending").length,
        });

        const months = ["ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ."];
        setOtCostHistory(months.map(m => ({ month: m, cost: 150000 + (Math.random() * 80000) })));

      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    loadAdminData();
  }, [currentCompanyId]);

  if (loading) return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="จำนวนพนักงานทั้งหมด" value={stats.totalHeadcount} icon={Users} color="blue" trend="0.0%" />
        <StatCard title="พนักงานที่ทำงานอยู่" value={stats.activeEmployees} icon={Briefcase} color="green" trend="25.0%" />
        <StatCard title="มาทำงาน (วันนี้)" value={attendanceStats.present} icon={Users} color="purple" trend="-100.0%" />
        <StatCard title="อยู่ระหว่างการลางาน" value={attendanceStats.onLeave} icon={AlertTriangle} color="amber" trend="0.0%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[2rem] border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg font-black italic uppercase">Headcount</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptHeadcount}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg font-black italic uppercase">Daily Attendance</CardTitle></CardHeader>
          <CardContent className="h-[300px] flex flex-col items-center">
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={attendanceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {attendanceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mb-2">
              {attendanceData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                  <div className="w-3 h-3 rounded-sm" style={{backgroundColor: item.color}} /> {item.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg font-black italic uppercase flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20} /> Pending Approvals</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-blue-50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600"><Clock size={20} /></div>
                    <span className="font-bold text-slate-700 uppercase text-sm">OT Requests</span>
                </div>
                <Badge className="bg-slate-200 text-slate-700 font-black group-hover:bg-blue-600 group-hover:text-white transition-colors border-none">{pendingApprovals.ot} pending</Badge>
             </div>
             <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-purple-50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600"><CalendarDays size={20} /></div>
                    <span className="font-bold text-slate-700 uppercase text-sm">Leave Requests</span>
                </div>
                <Badge className="bg-slate-200 text-slate-700 font-black group-hover:bg-purple-600 group-hover:text-white transition-colors border-none">{pendingApprovals.leave} pending</Badge>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-none shadow-sm">
          <CardHeader><CardTitle className="text-lg font-black italic uppercase">OT Cost (6 Months)</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={otCostHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="cost" stroke="#0ea5e9" strokeWidth={4} dot={{r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// 👤 EMPLOYEE SELF-SERVICE
// ==========================================
function EmployeeSelfService({ user }: { user: any }) {
  const { leaveQuotas } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [employeeProfile, setEmployeeProfile] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [otRecords, setOtRecords] = useState<any[]>([]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthNamesTh = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  useEffect(() => {
    const fetchSelfServiceData = async () => {
      setLoading(true);
      try {
        const empRes = await employeeAPI.getEmployees();
        const currentEmp = empRes.data.find((e: any) => Number(e.user_id) === Number(user.id));
        setEmployeeProfile(currentEmp);

        const actualEmpId = currentEmp?.id || user.id;
        const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

        const [attRes, otRes] = await Promise.all([
          attendanceAPI.getAttendanceLogs({ employeeId: actualEmpId, startDate, endDate }),
          otAPI.getOTRecords({ employeeId: actualEmpId })
        ]);
        setAttendanceRecords(attRes.data || []);
        setOtRecords(otRes.data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchSelfServiceData();
  }, [user, currentYear, currentMonth]);

  const tenure = useMemo(() => {
    if (!employeeProfile?.hire_date) return "-";
    const hire = new Date(employeeProfile.hire_date);
    const totalMonths = (now.getFullYear() - hire.getFullYear()) * 12 + (now.getMonth() - hire.getMonth());
    return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
  }, [employeeProfile?.hire_date]);

  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const attendanceMap = new Map();
    attendanceRecords.forEach((r: any) => {
      const dateStr = (r.DATE || r.date)?.split("T")[0];
      if (dateStr) attendanceMap.set(dateStr, r);
    });

    const cells: { day: number; record?: any }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, record: attendanceMap.get(dateStr) });
    }
    return cells;
  }, [attendanceRecords, currentYear, currentMonth]);

  const otTotalHours = otRecords.filter(r => r.log_status === 'approved').reduce((sum, r) => sum + Number(r.hours || 0), 0);
  const sortedAtt = [...attendanceRecords].sort((a, b) => new Date(b.DATE).getTime() - new Date(a.DATE).getTime());
  const latestAtt = sortedAtt.find(r => r.check_in_time);
  const formatTime = (t: string) => t ? t.split(':').slice(0,2).join(':') : '--:--';

  if (loading) return <div className="flex justify-center items-center h-96"><Loader className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-6 p-8 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Self-Service</h2>

      {/* Profile Card */}
      <Card className="rounded-[2.5rem] border-none shadow-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-200">
            {employeeProfile?.firstname_th?.charAt(0) || user?.username?.charAt(0)}
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900">{employeeProfile?.firstname_th} {employeeProfile?.lastname_th}</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-blue-500"/> {employeeProfile?.position_name}</span>
              <span className="flex items-center gap-1.5"><Building size={16} className="text-blue-500"/> {employeeProfile?.department_name}</span>
              <span className="flex items-center gap-1.5"><User size={16} className="text-blue-500"/> รหัส: {employeeProfile?.employee_code}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-blue-500"/> อายุงาน: {tenure}</span>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 px-4 py-1.5 font-black uppercase rounded-xl border-none">{employeeProfile?.STATUS}</Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard icon={CalendarDays} label="วันลาคงเหลือ" value="38 วัน" color="emerald" />
        <SummaryCard icon={TrendingUp} label="OT เดือนนี้" value={`${otTotalHours} ชม.`} color="teal" />
        <SummaryCard icon={Clock} label="ลงเวลาล่าสุด" value={latestAtt ? `${formatTime(latestAtt.check_in_time)} - ${latestAtt.check_out_time ? formatTime(latestAtt.check_out_time) : '??'}` : 'N/A'} color="blue" isMono />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 rounded-[2rem] border-none shadow-sm p-6">
          <CardTitle className="text-lg font-black mb-6">โควต้าวันลา</CardTitle>
          <div className="space-y-4">
             {[{t: "ลาป่วย", u: 2, tot: 30}, {t: "ลากิจ", u: 1, tot: 6}].map(q => (
               <div key={q.t} className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                 <span className="font-bold text-slate-600">{q.t}</span>
                 <span className="font-black text-slate-900">{q.u}/{q.tot} วัน</span>
               </div>
             ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-sm p-6">
          <CardTitle className="text-lg font-black mb-6 flex items-center gap-2"><Clock className="text-blue-500" /> ปฏิทินเข้างาน - {monthNamesTh[currentMonth]}</CardTitle>
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((cell, idx) => (
              <div key={idx} className={`h-16 rounded-2xl flex flex-col items-center justify-center border border-slate-50 ${cell.day === 0 ? 'bg-transparent' : 'bg-white shadow-sm'}`}>
                <span className="text-xs font-bold text-slate-400">{cell.day || ''}</span>
                {cell.record && <div className={`w-2 h-2 rounded-full mt-1 ${cell.record.STATUS === 'present' ? 'bg-green-500' : 'bg-orange-500'}`} />}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm p-8">
        <CardTitle className="text-lg font-black mb-6">คำขอ OT ล่าสุด</CardTitle>
        <div className="space-y-4">
           {otRecords.slice(0, 3).map(r => (
             <div key={r.id} className="flex justify-between items-center border-b border-slate-50 pb-4">
               <span className="font-bold text-slate-600">{new Date(r.date).toLocaleDateString('th-TH')} ({r.hours} ชม.)</span>
               <Badge className="bg-blue-600 text-white border-none px-4 py-1 rounded-full uppercase text-[10px] font-black">อนุมัติ</Badge>
             </div>
           ))}
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 🛠️ HELPER COMPONENTS
// ==========================================
function StatCard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap: any = { 
    blue: "bg-blue-50 text-blue-600", 
    green: "bg-green-50 text-green-600", 
    purple: "bg-purple-50 text-purple-600", 
    amber: "bg-amber-50 text-amber-600" 
  };
  const isDown = trend.includes('-');
  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-900 mb-2">{value}</h3>
        <div className={`flex items-center gap-1 text-[10px] font-black ${isDown ? 'text-red-500' : 'text-green-500'}`}>
          {isDown ? <ArrowDownRight size={12}/> : <ArrowUpRight size={12}/>} {trend}
        </div>
      </div>
      <div className={`p-4 rounded-3xl ${colorMap[color]} group-hover:scale-110 transition-transform`}><Icon size={32} /></div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, isMono }: any) {
  const colors: any = { emerald: "bg-emerald-50 text-emerald-600", teal: "bg-teal-50 text-teal-600", blue: "bg-blue-50 text-blue-600" };
  return (
    <Card className="rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${colors[color]}`}><Icon size={28}/></div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black text-slate-900 mt-1 ${isMono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </Card>
  );
}
