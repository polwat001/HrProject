"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, Briefcase, Building, CalendarDays, Clock, 
  TrendingUp, AlertTriangle, CheckCircle, FileText, XCircle, ClockPlus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, 
  CategoryScale, LinearScale, BarElement
} from "chart.js";


import { 
  MOCK_EMPLOYEES, MOCK_ATTENDANCE, MOCK_LEAVES, MOCK_OTS 
} from "@/mocks/dashboardData";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const empId = Number(params?.id) || 1; 

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "attendance" | "ot" | "leave">("overview");

  
  const [employee, setEmployee] = useState<any>(null);
  const [attData, setAttData] = useState<any[]>([]);
  const [otData, setOtData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      
      const foundEmp = MOCK_EMPLOYEES.find(e => e.id === empId) || MOCK_EMPLOYEES[0];
      setEmployee(foundEmp);

      
      setAttData(MOCK_ATTENDANCE.filter(a => a.employee_id === foundEmp.id));
      setOtData(MOCK_OTS.filter(o => o.employee_id === foundEmp.id));
      setLeaveData(MOCK_LEAVES.filter(l => l.employee_id === foundEmp.id));

      setLoading(false);
    }, 500);
  }, [empId]);

  
  const stats = useMemo(() => {
    const lateCount = attData.filter(a => a.STATUS === "late").length;
    const absentCount = attData.filter(a => a.STATUS === "absent").length;
    const totalOT = otData.filter(o => o.log_status === "approved").reduce((sum, o) => sum + (o.hours || 0), 0);
    const leaveUsed = leaveData.filter(l => l.status === "approved").reduce((sum, l) => sum + (l.leave_days || 0), 0);

    return { lateCount, absentCount, totalOT, leaveUsed };
  }, [attData, otData, leaveData]);

  const tenure = useMemo(() => {
    if (!employee?.hire_date) return "-";
    const hire = new Date(employee.hire_date);
    const totalMonths = (new Date().getFullYear() - hire.getFullYear()) * 12 + (new Date().getMonth() - hire.getMonth());
    return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
  }, [employee]);

  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": case "present": case "on_time": return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase">ปกติ / อนุมัติ</span>;
      case "pending": return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">รออนุมัติ</span>;
      case "rejected": case "absent": return <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase">ปฏิเสธ / ขาด</span>;
      case "late": return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase">สาย</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">{status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;
  if (!employee) return <div className="text-center py-20 text-red-500 font-bold">ไม่พบข้อมูลพนักงาน</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 min-h-screen animate-in fade-in">
      
      
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4 md:pb-6">
        <button onClick={() => router.back()} className="p-2 md:p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">Employee Profile</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm mt-1">ข้อมูลบุคลากรและประสิทธิภาพการทำงาน</p>
        </div>
      </div>

      
      <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl md:text-5xl font-black text-white shadow-xl shadow-blue-200 border-4 border-white">
            {employee.firstname_th?.charAt(0) || "E"}
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900">{employee.firstname_th} {employee.lastname_th}</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{employee.employee_code}</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"><Briefcase size={14} className="text-blue-500" /> {employee.position_name}</span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"><Building size={14} className="text-blue-500" /> {employee.department_name}</span>
              <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"><CalendarDays size={14} className="text-blue-500" /> อายุงาน: {tenure}</span>
            </div>
          </div>
          <div className="flex gap-4 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex-1 md:flex-none text-center bg-orange-50 rounded-xl p-4 border border-orange-100">
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">มาสาย (เดือนนี้)</p>
              <p className="text-2xl font-black text-orange-700">{stats.lateCount} <span className="text-sm">ครั้ง</span></p>
            </div>
            <div className="flex-1 md:flex-none text-center bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">OT (เดือนนี้)</p>
              <p className="text-2xl font-black text-blue-700">{stats.totalOT} <span className="text-sm">ชม.</span></p>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar border-b border-slate-200">
        {[
          { id: "overview", label: "ภาพรวม (Overview)", icon: TrendingUp },
          { id: "attendance", label: "เวลาเข้างาน", icon: Clock },
          { id: "ot", label: "ล่วงเวลา (OT)", icon: ClockPlus },
          { id: "leave", label: "การลางาน", icon: CalendarDays },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-white text-slate-500 hover:bg-slate-100 border border-b-0 border-slate-200"
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      
      <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
        
        
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs mb-6 text-center">สถิติการเข้างาน (ปีนี้)</h3>
                <div className="h-64 relative">
                  <Doughnut 
                    data={{
                      labels: ["มาปกติ", "มาสาย", "ขาดงาน"],
                      datasets: [{ data: [120, stats.lateCount, stats.absentCount], backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"], borderWidth: 0 }]
                    }} 
                    options={{ maintainAspectRatio: false, cutout: "75%", plugins: { legend: { position: "bottom" } } }}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-sm border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-black uppercase tracking-widest text-slate-400 text-xs mb-6 text-center">ชั่วโมง OT ย้อนหลัง 6 เดือน</h3>
                <div className="h-64 relative">
                  <Bar 
                    data={{
                      labels: ["ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค."],
                      datasets: [{ label: "ชั่วโมง OT", data: [12, 8, 15, 5, 20, stats.totalOT], backgroundColor: "#3b82f6", borderRadius: 4 }]
                    }}
                    options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        
        {activeTab === "attendance" && (
          <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <tr>
                    <th className="p-4 md:p-5 pl-6">วันที่</th>
                    <th className="p-4 md:p-5 text-center">เวลาเข้า</th>
                    <th className="p-4 md:p-5 text-center">เวลาออก</th>
                    <th className="p-4 md:p-5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {attData.length > 0 ? attData.map((att, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-4 pl-6 font-bold text-slate-700">{att.DATE || att.date}</td>
                      <td className="p-4 text-center font-mono font-bold text-slate-600">{att.check_in_time || "-"}</td>
                      <td className="p-4 text-center font-mono font-bold text-slate-600">{att.check_out_time || "-"}</td>
                      <td className="p-4 text-center">{getStatusBadge(att.STATUS)}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="p-8 text-center text-slate-400">ไม่พบประวัติการเข้างาน</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        
        {activeTab === "ot" && (
          <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <tr>
                    <th className="p-4 md:p-5 pl-6">วันที่ขอ OT</th>
                    <th className="p-4 md:p-5 text-center">จำนวน (ชม.)</th>
                    <th className="p-4 md:p-5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {otData.length > 0 ? otData.map((ot, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-4 pl-6 font-bold text-slate-700">{new Date(ot.date).toLocaleDateString("th-TH")}</td>
                      <td className="p-4 text-center font-black text-blue-600">{ot.hours} ชม.</td>
                      <td className="p-4 text-center">{getStatusBadge(ot.log_status || ot.status)}</td>
                    </tr>
                  )) : <tr><td colSpan={3} className="p-8 text-center text-slate-400">ไม่พบประวัติการขอ OT</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        
        {activeTab === "leave" && (
          <Card className="rounded-2xl shadow-sm border-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest font-black text-slate-400">
                  <tr>
                    <th className="p-4 md:p-5 pl-6">ประเภทการลา</th>
                    <th className="p-4 md:p-5 text-center">ช่วงวันที่</th>
                    <th className="p-4 md:p-5 text-center">จำนวนวัน</th>
                    <th className="p-4 md:p-5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {leaveData.length > 0 ? leaveData.map((leave, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="p-4 pl-6 font-bold text-slate-700 capitalize">{leave.leave_type}</td>
                      <td className="p-4 text-center text-slate-500 text-xs">{leave.start_date} - {leave.end_date}</td>
                      <td className="p-4 text-center font-black text-purple-600">{leave.leave_days} วัน</td>
                      <td className="p-4 text-center">{getStatusBadge(leave.status)}</td>
                    </tr>
                  )) : <tr><td colSpan={4} className="p-8 text-center text-slate-400">ไม่พบประวัติการลางาน</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}