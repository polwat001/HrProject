// "use client";
// import { useState } from "react";

// import {
//   DollarSign, Users, TrendingUp, Calculator, FileText, Download,
//   CheckCircle, Clock, ArrowUpDown,
// } from "lucide-react";

// // นำเข้า Mock Data
// import { payrollRecords, payrollSummaries, PayrollRecord, companies } from "@/data/mockData";
// // นำเข้า Company Context (ตรวจสอบ Path ให้ตรงกับโปรเจกต์คุณ)


// const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0 });

// const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
//   draft: { label: "ฉบับร่าง", variant: "outline" },
//   calculated: { label: "คำนวณแล้ว", variant: "secondary" },
//   approved: { label: "อนุมัติแล้ว", variant: "default" },
//   paid: { label: "จ่ายแล้ว", variant: "default" },
// };

// const months = [
//   { value: "2-2026", label: "กุมภาพันธ์ 2026" },
//   { value: "1-2026", label: "มกราคม 2026" },
//   { value: "12-2025", label: "ธันวาคม 2025" },
// ];

// const PayrollPage = () => {
//   const { selectedCompany } = companies();
//   const [selectedMonth, setSelectedMonth] = useState("2-2026");
//   const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
//   const [sortField, setSortField] = useState<"employeeCode" | "netPay">("employeeCode");
//   const [sortAsc, setSortAsc] = useState(true);

//   const [month, year] = selectedMonth.split("-").map(Number);

//   // Filter ข้อมูลตามเดือน/ปี และ บริษัทที่เลือก
//   const filtered = payrollRecords
//     .filter((r) => r.month === month && r.year === year)
//     .filter((r) => {
//       if (!selectedCompany || selectedCompany.id === "all") return true;
//       // Map ID บริษัทกับชื่อใน Data
//       const companyMap: Record<string, string> = {
//         "company-a": "abc",
//         "company-b": "xyz",
//         "company-c": "def",
//       };
//       return r.company.toLowerCase().includes(companyMap[selectedCompany.id]);
//     })
//     .sort((a, b) => {
//       const v = sortAsc ? 1 : -1;
//       if (sortField === "netPay") return (a.netPay - b.netPay) * v;
//       return a.employeeCode.localeCompare(b.employeeCode) * v;
//     });

//   const summary = payrollSummaries.find((s) => s.month === month && s.year === year);

//   const toggleSort = (field: "employeeCode" | "netPay") => {
//     if (sortField === field) setSortAsc(!sortAsc);
//     else { setSortField(field); setSortAsc(true); }
//   };

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-3xl font-bold text-foreground tracking-tight">💰 Payroll Management</h2>
//           <p className="text-muted-foreground text-sm">จัดการคำนวณเงินเดือนและออกสลิปพนักงาน</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//             <SelectTrigger className="w-[200px] bg-white">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {months.map((m) => (
//                 <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Button variant="outline" className="shadow-sm">
//             <Download className="h-4 w-4 mr-2" /> Export PDF
//           </Button>
//         </div>
//       </div>

//       {/* สรุปยอดรวม (Summary Cards) */}
//       {summary && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <StatCard icon={<Users className="text-blue-600" />} label="พนักงานทั้งหมด" value={`${summary.totalEmployees} คน`} />
//           <StatCard icon={<TrendingUp className="text-emerald-600" />} label="รายได้รวม (Gross)" value={`฿${fmt(summary.totalIncome)}`} />
//           <StatCard icon={<Calculator className="text-rose-600" />} label="รายการหักรวม" value={`฿${fmt(summary.totalDeduction)}`} />
//           <StatCard icon={<DollarSign className="text-amber-600" />} label="ยอดจ่ายสุทธิ" value={`฿${fmt(summary.totalNetPay)}`} color="bg-amber-50" />
//         </div>
//       )}

//       {/* ตารางรายละเอียด */}
//       <Card className="border-slate-200 shadow-sm">
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
//           <CardTitle className="text-lg font-bold">รายละเอียดงวดเดือน {months.find(m => m.value === selectedMonth)?.label}</CardTitle>
//           <Badge variant={statusConfig[summary?.status || "draft"].variant} className="px-3 py-1">
//             {statusConfig[summary?.status || "draft"].label}
//           </Badge>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader className="bg-slate-50/50">
//               <TableRow>
//                 <TableHead className="w-[100px] cursor-pointer" onClick={() => toggleSort("employeeCode")}>
//                   <div className="flex items-center gap-1">รหัส <ArrowUpDown size={12} /></div>
//                 </TableHead>
//                 <TableHead>พนักงาน</TableHead>
//                 <TableHead>แผนก</TableHead>
//                 <TableHead className="text-right">เงินเดือน</TableHead>
//                 <TableHead className="text-right">OT</TableHead>
//                 <TableHead className="text-right">หักรวม</TableHead>
//                 <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("netPay")}>
//                   <div className="flex items-center justify-end gap-1">ยอดสุทธิ <ArrowUpDown size={12} /></div>
//                 </TableHead>
//                 <TableHead className="text-center w-[80px]">สลิป</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.length > 0 ? (
//                 filtered.map((r) => (
//                   <TableRow key={r.id} className="hover:bg-slate-50/80 transition-colors">
//                     <TableCell className="font-mono text-xs font-bold text-slate-500">{r.employeeCode}</TableCell>
//                     <TableCell className="font-semibold">{r.employeeName}</TableCell>
//                     <TableCell className="text-slate-500">{r.department}</TableCell>
//                     <TableCell className="text-right font-mono">{fmt(r.baseSalary)}</TableCell>
//                     <TableCell className="text-right font-mono text-emerald-600">+{fmt(r.otAmount)}</TableCell>
//                     <TableCell className="text-right font-mono text-rose-500">-{fmt(r.totalDeduction)}</TableCell>
//                     <TableCell className="text-right font-mono font-bold text-slate-900">{fmt(r.netPay)}</TableCell>
//                     <TableCell className="text-center">
//                       <Button variant="ghost" size="icon" onClick={() => setSelectedPayslip(r)} className="hover:text-blue-600">
//                         <FileText size={18} />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
//                     ไม่พบข้อมูลสำหรับเงื่อนไขที่เลือก
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Dialog สลิปเงินเดือน */}
//       <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
//         <DialogContent className="max-w-md rounded-2xl">
//           <DialogHeader className="border-b pb-4">
//             <DialogTitle className="flex items-center gap-2 text-xl">
//               <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText size={20} /></div>
//               Salary Payslip
//             </DialogTitle>
//           </DialogHeader>
//           {selectedPayslip && <PayslipContent record={selectedPayslip} />}
//           <div className="flex gap-2 pt-4 border-t">
//             <Button className="flex-1" onClick={() => window.print()}>
//               <Download className="mr-2 h-4 w-4" /> Download PDF
//             </Button>
//             <Button variant="outline" onClick={() => setSelectedPayslip(null)}>ปิด</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// // Component ย่อยสำหรับ Card สรุป
// const StatCard = ({ icon, label, value, color = "bg-white" }: any) => (
//   <Card className={`${color} border-slate-200 shadow-sm`}>
//     <CardContent className="p-5">
//       <div className="flex items-center gap-4">
//         <div className="h-12 w-12 rounded-xl bg-white border shadow-sm flex items-center justify-center">
//           {icon}
//         </div>
//         <div>
//           <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
//           <p className="text-2xl font-black text-slate-900">{value}</p>
//         </div>
//       </div>
//     </CardContent>
//   </Card>
// );

// // (PayslipContent เหมือนเดิมที่คุณเขียนไว้ แต่แต่ง CSS เพิ่มเล็กน้อย)
// const PayslipContent = ({ record: r }: { record: PayrollRecord }) => (
//   <div className="space-y-4 py-2">
//     <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border">
//       <div>
//         <p className="font-black text-lg text-slate-900">{r.employeeName}</p>
//         <p className="text-sm text-slate-500 font-mono">{r.employeeCode}</p>
//       </div>
//       <div className="text-right text-xs text-slate-400">
//         <p>{r.company}</p>
//         <p>งวด: {r.month}/{r.year}</p>
//       </div>
//     </div>
    
//     {/* รายได้/รายหัก (ย่อส่วน) */}
//     <div className="grid grid-cols-2 gap-6">
//       <div className="space-y-2">
//         <p className="text-[10px] font-bold text-emerald-600 uppercase">Earnings (รายได้)</p>
//         <div className="text-xs space-y-1">
//           <div className="flex justify-between"><span>Base Salary</span><span>{fmt(r.baseSalary)}</span></div>
//           <div className="flex justify-between"><span>OT</span><span>{fmt(r.otAmount)}</span></div>
//           <Separator />
//           <div className="flex justify-between font-bold"><span>Total</span><span>{fmt(r.totalIncome)}</span></div>
//         </div>
//       </div>
//       <div className="space-y-2">
//         <p className="text-[10px] font-bold text-rose-600 uppercase">Deductions (รายหัก)</p>
//         <div className="text-xs space-y-1">
//           <div className="flex justify-between"><span>SSO (ประกันสังคม)</span><span>{fmt(r.socialSecurity)}</span></div>
//           <div className="flex justify-between"><span>Tax (ภาษี)</span><span>{fmt(r.tax)}</span></div>
//           <Separator />
//           <div className="flex justify-between font-bold text-rose-600"><span>Total</span><span>{fmt(r.totalDeduction)}</span></div>
//         </div>
//       </div>
//     </div>

//     <div className="bg-blue-600 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
//       <span className="font-bold">Net Salary (รับสุทธิ)</span>
//       <span className="text-2xl font-black">฿{fmt(r.netPay)}</span>
//     </div>
//   </div>
// );

// export default PayrollPage;