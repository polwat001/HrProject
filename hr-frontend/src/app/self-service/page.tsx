// "use client";
// import { useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// import { Clock, CalendarDays, Briefcase, User, Building, Timer } from "lucide-react";
// import {
//   employees,
//   companies,
//   selfServiceAttendance,
//   selfServiceLeaveQuotas,
//   selfServiceOTRecords,
// } from "@/data/mockData";

// const CURRENT_USER_ID = "emp-001";

// const statusColors: Record<string, string> = {
//   present: "bg-emerald-500",
//   late: "bg-amber-400",
//   absent: "bg-destructive",
//   leave: "bg-blue-400",
// };

// const statusLabels: Record<string, string> = {
//   present: "มาทำงาน",
//   late: "สาย",
//   absent: "ขาด",
//   leave: "ลา",
// };

// const LEAVE_COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--info))"];

// const SelfService = () => {
//   const user = employees.find((e) => e.id === CURRENT_USER_ID)!;
//   const company = companies.find((c) => c.id === user.companyId)!;

//   const tenure = useMemo(() => {
//     const hire = new Date(user.hireDate);
//     const now = new Date(2026, 1, 27);
//     const years = now.getFullYear() - hire.getFullYear();
//     const months = now.getMonth() - hire.getMonth();
//     const totalMonths = years * 12 + months;
//     return `${Math.floor(totalMonths / 12)} ปี ${totalMonths % 12} เดือน`;
//   }, [user.hireDate]);

//   // Calendar
//   const calendarData = useMemo(() => {
//     const now = new Date(2026, 1, 1); // Feb 2026
//     const year = now.getFullYear();
//     const month = now.getMonth();
//     const firstDay = new Date(year, month, 1).getDay();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     const attendanceMap = new Map(selfServiceAttendance.map((a) => [a.date, a]));
//     const cells: { day: number; record?: typeof selfServiceAttendance[0] }[] = [];
//     for (let i = 0; i < firstDay; i++) cells.push({ day: 0 });
//     for (let d = 1; d <= daysInMonth; d++) {
//       const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
//       cells.push({ day: d, record: attendanceMap.get(dateStr) });
//     }
//     return cells;
//   }, []);

//   const otTotal = selfServiceOTRecords.reduce((s, r) => s + r.hours, 0);
//   const otAmount = selfServiceOTRecords.reduce((s, r) => s + r.amount, 0);

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-foreground">Self-Service</h2>

//       {/* Profile Card */}
//       <Card>
//         <CardContent className="flex items-center gap-6 p-6">
//           <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
//             {user.avatar}
//           </div>
//           <div className="flex-1 space-y-1">
//             <h3 className="text-xl font-semibold text-foreground">
//               {user.firstName} {user.lastName}
//             </h3>
//             <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
//               <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{user.position}</span>
//               <span className="flex items-center gap-1"><Building className="h-4 w-4" />{user.department} — {company.shortName}</span>
//               <span className="flex items-center gap-1"><User className="h-4 w-4" />{user.employeeCode}</span>
//               <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />อายุงาน {tenure}</span>
//             </div>
//           </div>
//           <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
//         </CardContent>
//       </Card>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Leave Quota */}
//         <Card className="lg:col-span-1">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-base">โควต้าวันลา</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {selfServiceLeaveQuotas.map((lq, i) => {
//               const pieData = [
//                 { name: "ใช้แล้ว", value: lq.used },
//                 { name: "คงเหลือ", value: lq.total - lq.used },
//               ];
//               return (
//                 <div key={lq.type} className="flex items-center gap-4">
//                   <div className="w-16 h-16">
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={pieData} cx="50%" cy="50%" innerRadius={18} outerRadius={28} dataKey="value" strokeWidth={0}>
//                           <Cell fill={LEAVE_COLORS[i]} />
//                           <Cell fill="hsl(var(--muted))" />
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm font-medium text-foreground">{lq.type}</div>
//                     <div className="text-xs text-muted-foreground">
//                       ใช้ {lq.used} / {lq.total} วัน — เหลือ {lq.total - lq.used} วัน
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </CardContent>
//         </Card>

//         {/* Attendance Calendar */}
//         <Card className="lg:col-span-2">
//           <CardHeader className="pb-2">
//             <CardTitle className="text-base flex items-center gap-2">
//               <Clock className="h-4 w-4" /> ปฏิทินเข้างาน — กุมภาพันธ์ 2026
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-7 gap-1 text-center text-xs mb-1">
//               {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
//                 <div key={d} className="font-medium text-muted-foreground py-1">{d}</div>
//               ))}
//             </div>
//             <div className="grid grid-cols-7 gap-1">
//               {calendarData.map((cell, idx) =>
//                 cell.day === 0 ? (
//                   <div key={idx} />
//                 ) : (
//                   <div
//                     key={idx}
//                     className="rounded-md border border-border p-1 text-center min-h-[56px] flex flex-col items-center justify-center"
//                     title={
//                       cell.record
//                         ? `${statusLabels[cell.record.status]} ${cell.record.timeIn} - ${cell.record.timeOut}`
//                         : undefined
//                     }
//                   >
//                     <span className="text-xs text-muted-foreground">{cell.day}</span>
//                     {cell.record && (
//                       <>
//                         <span className={`inline-block mt-0.5 h-2.5 w-2.5 rounded-full ${statusColors[cell.record.status]}`} />
//                         {cell.record.timeIn !== "-" && (
//                           <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
//                             {cell.record.timeIn}
//                           </span>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 )
//               )}
//             </div>
//             <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
//               {Object.entries(statusLabels).map(([k, v]) => (
//                 <span key={k} className="flex items-center gap-1">
//                   <span className={`h-2.5 w-2.5 rounded-full ${statusColors[k]}`} /> {v}
//                 </span>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* OT Summary */}
//       <Card>
//         <CardHeader className="pb-2">
//           <CardTitle className="text-base flex items-center gap-2">
//             <Timer className="h-4 w-4" /> สรุป OT เดือนนี้
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex gap-6 mb-4">
//             <div className="bg-primary/10 rounded-lg px-4 py-3 text-center">
//               <div className="text-2xl font-bold text-primary">{otTotal}</div>
//               <div className="text-xs text-muted-foreground">ชั่วโมง</div>
//             </div>
//             <div className="bg-primary/10 rounded-lg px-4 py-3 text-center">
//               <div className="text-2xl font-bold text-primary">฿{otAmount.toLocaleString()}</div>
//               <div className="text-xs text-muted-foreground">ค่า OT</div>
//             </div>
//           </div>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>วันที่</TableHead>
//                 <TableHead>ชั่วโมง</TableHead>
//                 <TableHead>จำนวนเงิน</TableHead>
//                 <TableHead>สถานะ</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {selfServiceOTRecords.map((r) => (
//                 <TableRow key={r.id}>
//                   <TableCell>{r.date}</TableCell>
//                   <TableCell>{r.hours} ชม.</TableCell>
//                   <TableCell>฿{r.amount.toLocaleString()}</TableCell>
//                   <TableCell>
//                     <Badge variant={r.status === "approved" ? "default" : "secondary"}>
//                       {r.status === "approved" ? "อนุมัติ" : r.status === "pending" ? "รออนุมัติ" : "ปฏิเสธ"}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default SelfService;
