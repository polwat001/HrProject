"use client";

import { useEffect, useState } from "react";
import { payrollAPI } from "@/services/api";

import {
  DollarSign, Clock, CheckCircle, FileText, Download, 
  ArrowUpDown, Calendar, Search
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// --- Types ---
type PayrollRecord = {
  id: number;
  employee_id: number;
  employee_code: string;
  firstname_th: string;
  lastname_th: string;
  department_name: string;
  base_salary: number;
  position_allowance: number;
  ot_amount: number;
  other_income: number;
  total_income: number;
  sso_amount: number;
  tax_amount: number;
  other_deduction: number;
  total_deduction: number;
  net_pay: number;
  payroll_month: number;
  payroll_year: number;
  status: string;
};

const fmt = (n: number | string) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{value: string, label: string}[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(""); // เก็บค่า เช่น "2-2026"
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  
  const [sortField, setSortField] = useState<"employee_code" | "net_pay">("employee_code");
  const [sortAsc, setSortAsc] = useState(true);

  // 1. โหลดรายการเดือน/ปี ที่มีข้อมูลอยู่จริง (Dynamic Filter)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await payrollAPI.getAvailableMonths();
        const options = res.data.map((item: any) => ({
          value: `${item.payroll_month}-${item.payroll_year}`,
          label: `เดือน ${item.payroll_month}/${item.payroll_year}`
        }));
        setAvailableMonths(options);
        
        // ตั้งค่าเริ่มต้นเป็นงวดล่าสุดที่มีข้อมูล
        if (options.length > 0 && !selectedMonth) {
          setSelectedMonth(options[0].value);
        }
      } catch (err) {
        console.error("Load filters error", err);
      }
    };
    loadFilters();
  }, []);

  // 2. โหลดข้อมูล Payroll เมื่อมีการเปลี่ยนเดือนที่เลือก
  useEffect(() => {
    if (!selectedMonth) return;

    const loadPayroll = async () => {
      try {
        const [month, year] = selectedMonth.split("-").map(Number);
        const res = await payrollAPI.getPayrolls({ month, year });
        setPayrollRecords(res.data);
      } catch (err) {
        console.error("Load payroll error", err);
      }
    };

    loadPayroll();
  }, [selectedMonth]);

  const toggleSort = (field: "employee_code" | "net_pay") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const sortedRecords = [...payrollRecords].sort((a, b) => {
    const v = sortAsc ? 1 : -1;
    if (sortField === "net_pay") return (a.net_pay - b.net_pay) * v;
    return a.employee_code.localeCompare(b.employee_code) * v;
  });

  return (
    <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            <DollarSign className="inline-block mr-2 text-green-600" size={40} />
            Payroll System
          </h2>
          <p className="text-slate-500 font-bold ml-1">จัดการและตรวจสอบรายการเงินเดือนพนักงาน</p>
        </div>

        <div className="flex gap-3">
          {/* Select เดือนแบบ Dynamic */}
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[220px] bg-white border-none shadow-sm rounded-2xl font-black italic">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="เลือกงวดเงินเดือน" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-xl">
              {availableMonths.map((m) => (
                <SelectItem key={m.value} value={m.value} className="font-bold">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="bg-white border-none shadow-sm rounded-2xl font-black px-6 hover:bg-slate-100 transition-all">
            <Download className="h-4 w-4 mr-2" /> EXPORT
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Card className="rounded-xl border border-2 border-gray-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-300 px-8 py-6 bg-slate-50/30">
          <div className="flex justify-between items-center">
            <CardTitle className=" text-gray-200 uppercase tracking-widest ">
              Payroll Records: {availableMonths.find(m => m.value === selectedMonth)?.label || "..."}
            </CardTitle>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg font-black px-3 py-1 text-[10px] uppercase tracking-tighter">
              Active Session
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="py-5 px-8 cursor-pointer text-slate-400 font-black uppercase text-sm tracking-widest" onClick={() => toggleSort("employee_code")}>
                  Code <ArrowUpDown size={12} className="inline ml-1" />
                </TableHead>
                <TableHead className="text-slate-500 font-black uppercase text-sm tracking-widest">พนักงาน</TableHead>
                <TableHead className="text-slate-500 font-black uppercase text-sm tracking-widest">แผนก</TableHead>
                <TableHead className="text-right text-slate-500 font-black uppercase text-sm tracking-widest">รายได้รวม</TableHead>
                <TableHead className="text-right text-slate-500 font-black uppercase text-sm tracking-widest">หักรวม</TableHead>
                <TableHead className="text-right cursor-pointer text-slate-900 font-black uppercase text-sm tracking-widest" onClick={() => toggleSort("net_pay")}>
                  สุทธิ <ArrowUpDown size={12} className="inline ml-1" />
                </TableHead>
                <TableHead className="text-center text-slate-500 font-black uppercase text-sm tracking-widest">สลิป</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((r) => (
                <TableRow key={r.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                  <TableCell className="py-5 px-8 font-bold text-slate-400">{r.employee_code}</TableCell>
                  <TableCell>
                    <p className="font-black text-slate-900 leading-tight">{r.firstname_th} {r.lastname_th}</p>
                  </TableCell>
                  <TableCell className="font-bold text-slate-600">{r.department_name}</TableCell>
                  <TableCell className="text-right font-bold text-slate-700">{fmt(r.total_income)}</TableCell>
                  <TableCell className="text-right font-bold text-red-500">{fmt(r.total_deduction)}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-black text-green-600 italic">฿{fmt(r.net_pay)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-purple-100 hover:shadow-sm border border-gray text-slate-500 hover:text-purple-600 transition-all" onClick={() => setSelectedPayslip(r)}>
                      <FileText size={20} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAYSLIP DIALOG */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95">
          <DialogHeader className="p-8 bg-slate-900 text-white">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl  uppercase tracking-tighter">E-Payslip</DialogTitle>
              <Badge className="bg-green-500 text-white border-none rounded-lg text-[10px] font-black italic">PAID</Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
              งวดเดือน {selectedPayslip?.payroll_month}/{selectedPayslip?.payroll_year}
            </p>
          </DialogHeader>
          <div className="p-8 bg-white">
            {selectedPayslip && <PayslipContent record={selectedPayslip} />}
            <Button className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase text-xs tracking-widest">
              <Download className="mr-2 h-4 w-4" /> Download PDF Receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const PayslipContent = ({ record: r }: { record: PayrollRecord }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-4 border p-2 rounded-lg">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex border items-center justify-center font-black text-slate-900">
        {r.firstname_th.charAt(0)}
      </div>
      <div>
        <p className="font-black text-lg text-slate-900 leading-none">{r.firstname_th} {r.lastname_th}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{r.employee_code} • {r.department_name}</p>
      </div>
    </div>

    <Separator className="bg-slate-50" />

    <div className="space-y-3 border-b pb-6">
      <p className="text-sm font-black uppercase text-slate-400 tracking-widest">Earnings / รายได้</p>
      <div className="grid grid-cols-2 gap-y-2 text-sm font-bold">
        <span className="text-slate-500">เงินเดือนพื้นฐาน</span><span className="text-right text-slate-900">{fmt(r.base_salary)}</span>
        <span className="text-slate-500">ค่าตำแหน่ง</span><span className="text-right text-slate-900">{fmt(r.position_allowance)}</span>
        <span className="text-slate-500">โอที (OT)</span><span className="text-right text-slate-900">{fmt(r.ot_amount)}</span>
        <span className="text-slate-500">รายได้อื่นๆ</span><span className="text-right text-slate-900">{fmt(r.other_income || 0)}</span>
        <div className="col-span-2 mt-1 py-2 px-4 bg-green-50 rounded-xl flex justify-between border border-green-500">
          <span className="text-green-700 font-black text-xs uppercase">รวมรายได้ทั้งหมด</span>
          <span className="text-green-700 font-black">{fmt(r.total_income)}</span>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <p className="text-sm font-black uppercase text-slate-400 tracking-widest">Deductions / รายการหัก</p>
      <div className="grid grid-cols-2 gap-y-2 text-sm font-bold">
        <span className="text-slate-500">ประกันสังคม (SSO)</span><span className="text-right text-slate-900">{fmt(r.sso_amount || 0)}</span>
        <span className="text-slate-500">ภาษีหัก ณ ที่จ่าย</span><span className="text-right text-slate-900">{fmt(r.tax_amount || 0)}</span>
        <span className="text-slate-500">หักอื่นๆ (มาสาย/ขาดงาน)</span><span className="text-right text-slate-900">{fmt(r.other_deduction || 0)}</span>
        <div className="col-span-2 mt-1 py-2 px-4 bg-red-50 rounded-lg flex justify-between border border-red-500">
          <span className="text-red-700 font-black text-xs uppercase">รวมรายการหักทั้งหมด</span>
          <span className="text-red-700 font-black">-{fmt(r.total_deduction)}</span>
        </div>
      </div>
    </div>

    <div className="pt-4">
      <div className="bg-white p-6 rounded-lg flex justify-between items-center shadow-xl shadow-slate-200 border-3 border-blue">
        <span className="font-black text-blue text-xs uppercase tracking-widest italic">Net Salary</span>
        <span className="text-3xl font-black text-blue italic">฿{fmt(r.net_pay)}</span>
      </div>
    </div>
  </div>
);
