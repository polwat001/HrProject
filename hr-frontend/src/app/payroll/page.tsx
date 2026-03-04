// "use client";
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Separator } from "@/components/ui/separator";
// import {
//   DollarSign, Users, TrendingUp, Calculator, FileText, Download,
//   CheckCircle, Clock, ArrowUpDown,
// } from "lucide-react";
// import { payrollRecords, payrollSummaries, PayrollRecord } from "@/data/payrollData";
// import { useCompany } from "@/contexts/CompanyContext";

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

// const Payroll = () => {
//   const { selectedCompany } = useCompany();
//   const [selectedMonth, setSelectedMonth] = useState("2-2026");
//   const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
//   const [sortField, setSortField] = useState<"employeeCode" | "netPay">("employeeCode");
//   const [sortAsc, setSortAsc] = useState(true);

//   const [month, year] = selectedMonth.split("-").map(Number);

//   const filtered = payrollRecords
//     .filter((r) => r.month === month && r.year === year)
//     .filter((r) => selectedCompany.id === "all" || r.company.toLowerCase().includes(
//       selectedCompany.id === "company-a" ? "abc" : selectedCompany.id === "company-b" ? "xyz" : "def"
//     ))
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
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-foreground">Payroll — เงินเดือน</h2>
//           <p className="text-muted-foreground text-sm">คำนวณเงินเดือน, รายได้, หัก, ภาษี และออกสลิป</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//             <SelectTrigger className="w-[200px]">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               {months.map((m) => (
//                 <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Button variant="outline" size="sm">
//             <Download className="h-4 w-4 mr-1" /> Export
//           </Button>
//         </div>
//       </div>

//       {/* Summary cards */}
//       {summary && (
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           <Card className="shadow-card">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                   <Users className="h-5 w-5 text-primary" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground">พนักงาน</p>
//                   <p className="text-xl font-bold text-foreground">{summary.totalEmployees} คน</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="shadow-card">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
//                   <TrendingUp className="h-5 w-5 text-accent" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground">รายได้รวม</p>
//                   <p className="text-xl font-bold text-foreground">฿{fmt(summary.totalIncome)}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="shadow-card">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
//                   <Calculator className="h-5 w-5 text-destructive" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground">หักรวม</p>
//                   <p className="text-xl font-bold text-foreground">฿{fmt(summary.totalDeduction)}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//           <Card className="shadow-card">
//             <CardContent className="p-4">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
//                   <DollarSign className="h-5 w-5 text-success" />
//                 </div>
//                 <div>
//                   <p className="text-xs text-muted-foreground">จ่ายสุทธิ</p>
//                   <p className="text-xl font-bold text-foreground">฿{fmt(summary.totalNetPay)}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       )}

//       {/* Payroll table */}
//       <Card className="shadow-card">
//         <CardHeader className="pb-3">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-base">รายละเอียดเงินเดือนรายบุคคล</CardTitle>
//             <Badge variant={statusConfig[summary?.status || "draft"].variant}>
//               {statusConfig[summary?.status || "draft"].label}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="cursor-pointer" onClick={() => toggleSort("employeeCode")}>
//                   <span className="flex items-center gap-1">รหัส <ArrowUpDown className="h-3 w-3" /></span>
//                 </TableHead>
//                 <TableHead>ชื่อ-นามสกุล</TableHead>
//                 <TableHead>แผนก</TableHead>
//                 <TableHead className="text-right">เงินเดือน</TableHead>
//                 <TableHead className="text-right">ค่าตำแหน่ง</TableHead>
//                 <TableHead className="text-right">OT</TableHead>
//                 <TableHead className="text-right">รายได้รวม</TableHead>
//                 <TableHead className="text-right">หักรวม</TableHead>
//                 <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("netPay")}>
//                   <span className="flex items-center justify-end gap-1">สุทธิ <ArrowUpDown className="h-3 w-3" /></span>
//                 </TableHead>
//                 <TableHead className="text-center">สลิป</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filtered.map((r) => (
//                 <TableRow key={r.id}>
//                   <TableCell className="font-mono text-xs">{r.employeeCode}</TableCell>
//                   <TableCell className="font-medium">{r.employeeName}</TableCell>
//                   <TableCell className="text-muted-foreground text-sm">{r.department}</TableCell>
//                   <TableCell className="text-right font-mono text-sm">{fmt(r.baseSalary)}</TableCell>
//                   <TableCell className="text-right font-mono text-sm">{fmt(r.positionAllowance)}</TableCell>
//                   <TableCell className="text-right font-mono text-sm">{fmt(r.otAmount)}</TableCell>
//                   <TableCell className="text-right font-mono text-sm font-medium">{fmt(r.totalIncome)}</TableCell>
//                   <TableCell className="text-right font-mono text-sm text-destructive">{fmt(r.totalDeduction)}</TableCell>
//                   <TableCell className="text-right font-mono text-sm font-bold">{fmt(r.netPay)}</TableCell>
//                   <TableCell className="text-center">
//                     <Button variant="ghost" size="sm" onClick={() => setSelectedPayslip(r)}>
//                       <FileText className="h-4 w-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Payslip Dialog */}
//       <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <FileText className="h-5 w-5" />
//               สลิปเงินเดือน
//             </DialogTitle>
//           </DialogHeader>
//           {selectedPayslip && <PayslipContent record={selectedPayslip} />}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// const PayslipContent = ({ record: r }: { record: PayrollRecord }) => (
//   <div className="space-y-4 text-sm">
//     {/* Employee info */}
//     <div className="bg-muted rounded-lg p-4 space-y-1">
//       <div className="flex justify-between">
//         <span className="text-muted-foreground">พนักงาน</span>
//         <span className="font-medium">{r.employeeName} ({r.employeeCode})</span>
//       </div>
//       <div className="flex justify-between">
//         <span className="text-muted-foreground">แผนก / บริษัท</span>
//         <span>{r.department} — {r.company}</span>
//       </div>
//       <div className="flex justify-between">
//         <span className="text-muted-foreground">งวด</span>
//         <span>{r.month}/{r.year}</span>
//       </div>
//     </div>

//     {/* Income */}
//     <div>
//       <p className="font-semibold text-foreground mb-2 flex items-center gap-1">
//         <TrendingUp className="h-4 w-4 text-accent" /> รายได้
//       </p>
//       <div className="space-y-1">
//         {[
//           ["เงินเดือน", r.baseSalary],
//           ["ค่าตำแหน่ง", r.positionAllowance],
//           ["ค่าที่พัก", r.housingAllowance],
//           ["ค่าเดินทาง", r.transportAllowance],
//           ["ค่าอาหาร", r.mealAllowance],
//           ["ค่าล่วงเวลา (OT " + r.otHours + " ชม.)", r.otAmount],
//           ...(r.bonus > 0 ? [["โบนัส", r.bonus]] : []),
//         ].map(([label, val]) => (
//           <div key={label as string} className="flex justify-between">
//             <span className="text-muted-foreground">{label as string}</span>
//             <span className="font-mono">{fmt(val as number)}</span>
//           </div>
//         ))}
//         <Separator />
//         <div className="flex justify-between font-semibold">
//           <span>รายได้รวม</span>
//           <span className="font-mono">{fmt(r.totalIncome)}</span>
//         </div>
//       </div>
//     </div>

//     {/* Deduction */}
//     <div>
//       <p className="font-semibold text-foreground mb-2 flex items-center gap-1">
//         <Calculator className="h-4 w-4 text-destructive" /> รายการหัก
//       </p>
//       <div className="space-y-1">
//         {[
//           ["ประกันสังคม", r.socialSecurity],
//           ["กองทุนสำรองเลี้ยงชีพ (3%)", r.providentFund],
//           ["ภาษีหัก ณ ที่จ่าย", r.tax],
//           ...(r.late > 0 ? [["หักสาย", r.late]] : []),
//           ...(r.absent > 0 ? [["หักขาด", r.absent]] : []),
//         ].map(([label, val]) => (
//           <div key={label as string} className="flex justify-between">
//             <span className="text-muted-foreground">{label as string}</span>
//             <span className="font-mono text-destructive">{fmt(val as number)}</span>
//           </div>
//         ))}
//         <Separator />
//         <div className="flex justify-between font-semibold">
//           <span>หักรวม</span>
//           <span className="font-mono text-destructive">{fmt(r.totalDeduction)}</span>
//         </div>
//       </div>
//     </div>

//     {/* Net */}
//     <div className="bg-primary/5 rounded-lg p-4 flex justify-between items-center">
//       <span className="font-bold text-base text-foreground flex items-center gap-2">
//         <CheckCircle className="h-5 w-5 text-success" /> เงินเดือนสุทธิ
//       </span>
//       <span className="text-xl font-bold text-foreground">฿{fmt(r.netPay)}</span>
//     </div>

//     {r.paidDate && (
//       <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
//         <Clock className="h-3 w-3" /> จ่ายเมื่อ {r.paidDate}
//       </div>
//     )}
//   </div>
// );

// export default Payroll;
