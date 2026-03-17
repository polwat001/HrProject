"use client";

import { useMemo, useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { attendanceAPI, otAPI } from "@/services/api"; // ✅ นำเข้า API จริง
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, CalendarDays, Briefcase, User, Building, Timer, Loader } from "lucide-react";

// ✅ สีและข้อความสถานะ
const statusColors: Record<string, string> = {
  present: "bg-emerald-500",
  late: "bg-amber-400",
  absent: "bg-red-500",
  leave: "bg-blue-400",
};

const statusLabels: Record<string, string> = {
  present: "มาทำงาน",
  late: "สาย",
  absent: "ขาด",
  leave: "ลา",
};

const LEAVE_COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--info))"];

export default function SelfService() {
  // ✅ ดึงข้อมูล User จาก Store (คนที่ล็อกอินอยู่)
  const { user, currentCompanyId, leaveQuotas } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [otRecords, setOtRecords] = useState<any[]>([]);

  // วันที่ปัจจุบันสำหรับสร้างปฏิทิน
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // ✅ โหลดข้อมูลจริงเมื่อเข้าหน้าเว็บ
  useEffect(() => {
    const fetchSelfServiceData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // หาช่วงวันที่ของเดือนปัจจุบัน (วันที่ 1 ถึง สิ้นเดือน)
        const startDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
        const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

        // ดึงประวัติเข้างาน และ OT ของตัวเอง
        // หมายเหตุ: ปรับ employeeId ให้ตรงกับฟิลด์จริงของคุณ เช่น user.employee_id หรือ user.id
        const empId = user.id; 

        const [attRes, otRes] = await Promise.all([
          attendanceAPI.getAttendanceLogs({ employeeId: empId, startDate, endDate }),
          otAPI.getOTRecords({ employeeId: empId })
        ]);

        setAttendanceRecords(attRes.data || []);
        setOtRecords(otRes.data || []);
      } catch (error) {
        console.error("Failed to load self-service data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelfServiceData();
  }, [user, currentCompanyId, currentYear, currentMonth]);

  // ✅ คำนวณอายุงาน (ถ้าไม่มีข้อมูลให้เป็น -)
  const tenure = useMemo(() => {
    if (!user?.hireDate) return "-";
    const hire = new Date(user.hireDate);
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    const totalMonths = years * 12 + months;
    return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
  }, [user?.hireDate]);

  // ✅ สร้างข้อมูลปฏิทินสำหรับเดือนปัจจุบัน
  const calendarData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 = อา, 1 = จ
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // แปลงข้อมูลเข้างานให้อยู่ในรูปแบบ Map { "YYYY-MM-DD" => record }
    const attendanceMap = new Map();
    attendanceRecords.forEach((record: any) => {
      // ดึงเฉพาะส่วนวันที่ YYYY-MM-DD
      const dateStr = (record.DATE || record.date)?.split("T")[0];
      if (dateStr) attendanceMap.set(dateStr, record);
    });

    const cells: { day: number; record?: any }[] = [];
    
    // เติมช่องว่างของวันแรกในเดือน
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
    
    // เติมวันที่
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, record: attendanceMap.get(dateStr) });
    }
    
    return cells;
  }, [attendanceRecords, currentYear, currentMonth]);

  // ✅ คำนวณ OT
  const otTotalHours = otRecords.filter(r => r.log_status === 'approved').reduce((sum, r) => sum + Number(r.hours || 0), 0);
  
  // สมมติฐาน: ถ้าใน Backend ไม่มีเรท OT ให้ตั้งค่าพื้นฐาน (เช่น ชม.ละ 150 บาท) เพื่อแสดงผลไปก่อน
  const otRatePerHour = 150; 
  const otAmount = otTotalHours * otRatePerHour;

  const monthNamesTh = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-bold">กำลังโหลดข้อมูลส่วนตัว...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Self-Service</h2>

      {/* ✅ Profile Card */}
      <Card className="rounded-[2rem] border-none shadow-sm">
        <CardContent className="flex flex-col md:flex-row items-center gap-6 p-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-200">
            {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><Briefcase size={16} className="text-blue-500"/> {user?.position || "พนักงาน"}</span>
              <span className="flex items-center gap-1.5"><Building size={16} className="text-blue-500"/> {user?.department || "ไม่ระบุแผนก"}</span>
              <span className="flex items-center gap-1.5"><User size={16} className="text-blue-500"/> รหัส: {user?.employeeCode || "-"}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={16} className="text-blue-500"/> อายุงาน: {tenure}</span>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-700 border-none px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-xl">
            {user?.status || "Active"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ✅ Leave Quota (อิงจากข้อมูลใน Store ถ้ามี หรือใช้ Mock ชั่วคราวถ้าว่าง) */}
        <Card className="lg:col-span-1 rounded-3xl border-none shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-50 mb-4">
            <CardTitle className="text-lg font-black text-slate-800 tracking-tight">โควต้าวันลา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {(leaveQuotas && leaveQuotas.length > 0 ? leaveQuotas : [
              { type: "ลาป่วย", used: 2, total: 30 },
              { type: "ลากิจ", used: 1, total: 6 },
              { type: "พักร้อน", used: 0, total: 10 }
            ]).map((lq: any, i) => {
              const pieData = [
                { name: "ใช้แล้ว", value: lq.used },
                { name: "คงเหลือ", value: Math.max(0, lq.total - lq.used) },
              ];
              return (
                <div key={lq.type} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>
                          <Cell fill={LEAVE_COLORS[i % LEAVE_COLORS.length]} />
                          <Cell fill="hsl(var(--muted))" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-800">{lq.type}</div>
                    <div className="text-xs font-bold text-slate-400 mt-1">
                      ใช้ {lq.used} / {lq.total} วัน <br /> 
                      <span className="text-blue-600">เหลือ {Math.max(0, lq.total - lq.used)} วัน</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* ✅ Attendance Calendar */}
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-50 mb-4">
            <CardTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="text-blue-500" size={20} /> 
              ปฏิทินเข้างาน — {monthNamesTh[currentMonth]} {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
              {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarData.map((cell, idx) =>
                cell.day === 0 ? (
                  <div key={idx} className="bg-slate-50/50 rounded-xl" />
                ) : (
                  <div
                    key={idx}
                    className={`rounded-xl border border-slate-100 p-2 text-center min-h-[70px] flex flex-col items-center justify-start transition-all hover:border-blue-300 hover:shadow-sm bg-white ${cell.record?.STATUS ? 'ring-1 ring-inset ring-slate-100' : ''}`}
                    title={
                      cell.record
                        ? `${statusLabels[cell.record.STATUS?.toLowerCase()] || cell.record.STATUS} ${cell.record.check_in_time || ''}`
                        : "ไม่มีข้อมูล"
                    }
                  >
                    <span className={`text-xs font-black mb-1 ${new Date().getDate() === cell.day ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md' : 'text-slate-600'}`}>{cell.day}</span>
                    
                    {cell.record && (
                      <div className="flex flex-col items-center mt-1">
                        <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${statusColors[cell.record.STATUS?.toLowerCase()] || "bg-slate-300"}`} />
                        {cell.record.check_in_time && (
                          <span className="text-[9px] font-bold text-slate-500 leading-tight mt-1 bg-slate-50 px-1.5 py-0.5 rounded">
                            {cell.record.check_in_time.split('.')[0].slice(0, 5)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-slate-50 text-xs font-bold text-slate-500 justify-center">
              {Object.entries(statusLabels).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 shadow-sm rounded-full ${statusColors[k]}`} /> {v}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ✅ OT Summary */}
      <Card className="rounded-3xl border-none shadow-sm">
        <CardHeader className="pb-4 border-b border-slate-50 mb-4">
          <CardTitle className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Timer className="text-orange-500" size={20} /> ประวัติการทำ OT
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-100 rounded-2xl px-6 py-4 text-center min-w-[140px]">
              <div className="text-3xl font-black text-orange-600">{otTotalHours}</div>
              <div className="text-xs font-bold text-orange-400 mt-1 uppercase tracking-widest">ชั่วโมงทั้งหมด</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100 rounded-2xl px-6 py-4 text-center min-w-[140px]">
              <div className="text-3xl font-black text-green-600">฿{otAmount.toLocaleString()}</div>
              <div className="text-xs font-bold text-green-400 mt-1 uppercase tracking-widest">คาดการณ์ค่า OT</div>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">วันที่</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">ชั่วโมง</TableHead>
                  <TableHead className="font-black text-slate-400 uppercase tracking-widest text-[10px]">สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otRecords.length > 0 ? otRecords.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-slate-50 border-slate-100">
                    <TableCell className="font-bold text-slate-700">{new Date(r.date).toLocaleDateString('th-TH')}</TableCell>
                    <TableCell className="font-bold text-slate-900 italic">{r.hours} ชม.</TableCell>
                    <TableCell>
                      <Badge className={`border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest ${r.log_status === "approved" ? "bg-green-100 text-green-700" : r.log_status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {r.log_status === "approved" ? "อนุมัติ" : r.log_status === "pending" ? "รออนุมัติ" : "ไม่อนุมัติ"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-slate-400 font-medium">ไม่พบประวัติการทำ OT ในระบบ</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}