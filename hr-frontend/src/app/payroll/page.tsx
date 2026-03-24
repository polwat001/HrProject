"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/locales/translations";

import {
  DollarSign, Download, ArrowUpDown, Calendar, TrendingUp, TrendingDown, Wallet, FileText
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// ✅ Import ข้อมูลจำลอง (ใช้ข้อมูลที่มี position_name เดิมได้เลย)
import { MOCK_PAYROLL_RECORDS, PayrollRecord } from "@/mocks/payrollData";

const fmt = (n: number | string) => Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 });

const getMonthName = (monthNumber: number, lang: string) => {
  const th = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const en = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return lang === 'th' ? th[monthNumber - 1] : en[monthNumber - 1];
};

export default function PayrollPage() {
  const { language } = useAppStore();
  const t = translations[language as keyof typeof translations] || translations['en'];

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  
  const currentYear = new Date().getFullYear().toString(); 
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); 
  
  // ✅ เปลี่ยนการเรียงลำดับจากรหัสพนักงานเป็นชื่อพนักงานแทน
  const [sortField, setSortField] = useState<"firstname_th" | "net_pay">("firstname_th");
  const [sortAsc, setSortAsc] = useState(true);

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(MOCK_PAYROLL_RECORDS.map(r => r.payroll_year)));
    return years.sort((a, b) => b - a).map(String);
  }, []);

  // ================= LOAD PAYROLL DATA =================
  useEffect(() => {
    const timer = setTimeout(() => {
      const filteredRecords = MOCK_PAYROLL_RECORDS.filter(record => {
        const matchYear = record.payroll_year.toString() === selectedYear;
        const matchMonth = selectedMonth === "all" ? true : record.payroll_month.toString() === selectedMonth;
        return matchYear && matchMonth;
      });
      setPayrollRecords(filteredRecords);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedYear, selectedMonth]);

  // ================= CALCULATE SUMMARIES =================
  const totals = useMemo(() => {
    return payrollRecords.reduce(
      (acc, record) => {
        acc.income += record.total_income;
        acc.deduction += record.total_deduction;
        acc.net += record.net_pay;
        return acc;
      },
      { income: 0, deduction: 0, net: 0 }
    );
  }, [payrollRecords]);

  // ================= SORTING =================
  const toggleSort = (field: "firstname_th" | "net_pay") => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const sortedRecords = [...payrollRecords].sort((a, b) => {
    const v = sortAsc ? 1 : -1;
    if (sortField === "net_pay") return (a.net_pay - b.net_pay) * v;
    return a.firstname_th.localeCompare(b.firstname_th) * v;
  });

  return (
    <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter  uppercase">
            {t.titlePayroll || "Payroll Management"}
          </h2>
          <p className="text-slate-500 font-bold ml-1">{t.descPayroll || "Manage and view employee salaries"}</p>
        </div>

        {/* ตัวกรอง ปี และ เดือน */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px] bg-white border border-slate-200 shadow-sm rounded-xl font-black  hover:bg-slate-50 transition-all cursor-pointer">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-100 shadow-xl">
              {availableYears.map((yr) => (
                <SelectItem key={yr} value={yr} className="font-bold cursor-pointer">
                  {language === 'th' ? `ปี ${yr}` : `Year ${yr}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px] bg-white border border-slate-200 shadow-sm rounded-xl font-black  hover:bg-slate-50 transition-all cursor-pointer">
              <Calendar className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border border-slate-100 shadow-xl max-h-[300px]">
              <SelectItem value="all" className="font-bold cursor-pointer">{language === 'th' ? "ทุกเดือน (All Months)" : "All Months"}</SelectItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={m.toString()} className="font-bold cursor-pointer">
                  {getMonthName(m, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="bg-white border border-slate-200 shadow-sm rounded-xl font-black px-6 hover:bg-slate-100 transition-all text-slate-700">
            <Download className="h-4 w-4 mr-2" /> {t.btnExport || "Export"}
          </Button>
        </div>
      </div>

      {/* SUMMARY WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center transition-all hover:shadow-md">
          <div>
            <p className="text-lg font-black text-slate-400 uppercase tracking-widest">{t.lblTotalInc || "รวมรายได้ (Total Income)"}</p>
            <p className="text-3xl font-black mt-1 text-green-600 tracking-tighter">฿ {fmt(totals.income)}</p>
          </div>
          {/* <div className="p-4 rounded-xl bg-green-50 text-green-500 shadow-inner"><TrendingUp size={28} /></div> */}
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center transition-all hover:shadow-md">
          <div>
            <p className="text-lg font-black text-slate-400 uppercase tracking-widest">{t.lblTotalDed || "รวมรายการหัก (Total Deductions)"}</p>
            <p className="text-3xl font-black mt-1 text-red-500 tracking-tighter">฿ {fmt(totals.deduction)}</p>
          </div>
          {/* <div className="p-4 rounded-xl bg-red-50 text-red-500 shadow-inner"><TrendingDown size={28} /></div> */}
        </div>

        <div className="bg- p-6 rounded-xl border border-blue-500  flex justify-between items-center transition-all hover:shadow-xl hover:scale-[1.01]">
          <div>
            <p className="text-lg font-black text-blue-200 uppercase tracking-widest">{t.lblNetSalary || "ยอดเงินสุทธิ (Net Pay)"}</p>
            <p className="text-3xl font-black mt-1 text-white tracking-tighter ">฿ {fmt(totals.net)}</p>
          </div>
          <div className="p-4 rounded-xl bg-white/20 text-white backdrop-blur-md shadow-inner"><Wallet size={28} /></div>
        </div>
      </div>

      {/* TABLE */}
      <Card className="rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b-2 border-slate-200 px-8 py-5 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-400 uppercase tracking-widest text-sm flex items-center gap-2 font-black">
              <DollarSign size={16}/> {t.payrollRecords || "Payroll Records"}: 
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                {selectedMonth === "all" ? (language === 'th' ? "สรุปทั้งปี" : "Yearly Summary") : getMonthName(Number(selectedMonth), language)} {selectedYear}
              </span>
            </CardTitle>
            <Badge className="bg-green-100 text-green-700 border-none rounded-xl font-black px-3 py-1 text-[10px] uppercase tracking-widest shadow-sm">
              {payrollRecords.length} Records
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                {/* ✅ เรียงลำดับจากชื่อพนักงานแทน และเอา รหัส/งวด ออก */}
                <TableHead className="py-5 px-8 cursor-pointer text-slate-400 font-black uppercase text-xs tracking-widest transition-colors hover:text-blue-500" onClick={() => toggleSort("firstname_th")}>
                  {t.colEmployee || "Employee"} <ArrowUpDown size={12} className="inline ml-1" />
                </TableHead>
                {/* ✅ แยกแผนกและตำแหน่งคนละคอลัมน์ */}
                <TableHead className="text-slate-400 font-black uppercase text-xs tracking-widest">{t.lblDepartment || "Department"}</TableHead>
                <TableHead className="text-slate-400 font-black uppercase text-xs tracking-widest">{t.lblPosition || "Position"}</TableHead>
                
                <TableHead className="text-right text-slate-400 font-black uppercase text-xs tracking-widest">{t.colTotalInc || "Total Income"}</TableHead>
                <TableHead className="text-right text-slate-400 font-black uppercase text-xs tracking-widest">{t.colTotalDed || "Total Deduction"}</TableHead>
                <TableHead className="text-right cursor-pointer text-slate-800 font-black uppercase text-xs tracking-widest transition-colors hover:text-blue-500" onClick={() => toggleSort("net_pay")}>
                  {t.colNetPay || "Net Pay"} <ArrowUpDown size={12} className="inline ml-1" />
                </TableHead>
                <TableHead className="text-center text-slate-400 font-black uppercase text-xs tracking-widest">{t.colSlip || "Payslip"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.map((r) => (
                <TableRow key={r.id} className="group hover:bg-blue-50/30 transition-colors border-slate-50">
                  <TableCell className="py-5 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black text-xs shadow-sm">
                        {r.firstname_th.charAt(0)}
                      </div>
                      <p className="font-black text-slate-900 leading-tight">{r.firstname_th} {r.lastname_th}</p>
                    </div>
                  </TableCell>
                  
                  {/* ✅ แผนกและตำแหน่งถูกแยกชัดเจน */}
                  <TableCell className="font-bold text-slate-500 text-xs">
                    {r.department_name}
                  </TableCell>
                  <TableCell className="font-bold text-slate-500 text-xs">
                    {r.position_name}
                  </TableCell>
                  
                  <TableCell className="text-right font-black text-slate-700 tracking-tight">{fmt(r.total_income)}</TableCell>
                  <TableCell className="text-right font-black text-red-500 tracking-tight">-{fmt(r.total_deduction)}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-sm font-black text-blue-600  tracking-tighter">฿{fmt(r.net_pay)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-blue-100 hover:shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-95" onClick={() => setSelectedPayslip(r)}>
                      <FileText size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sortedRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20 text-slate-400 font-black uppercase tracking-widest text-xs">
                    No records found for this period
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAYSLIP DIALOG */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-md rounded-xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95">
          <DialogHeader className="p-8 bg-slate-900 text-white">
            <div className="flex justify-between items-start">
              <DialogTitle className="text-2xl uppercase tracking-tighter">{t.titlePayslip || "PAYSLIP"}</DialogTitle>
              <Badge className="bg-green-500 text-white border-none rounded-xl text-[10px] font-black  tracking-widest">{t.badgePaid || "PAID"}</Badge>
            </div>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">
              {t.lblPeriod || "Period:"} {selectedPayslip ? getMonthName(selectedPayslip.payroll_month, language) : ''} {selectedPayslip?.payroll_year}
            </p>
          </DialogHeader>
          <div className="p-8 bg-white">
            {selectedPayslip && <PayslipContent record={selectedPayslip} t={t} />}
            <Button className="w-full mt-8 bg-slate-900 hover:bg-slate-800 text-white font-black py-6 rounded-xl shadow-xl shadow-slate-200 transition-all active:scale-95 uppercase text-xs tracking-widest">
              <Download className="mr-2 h-4 w-4" /> {t.btnDownloadPDF || "Download PDF"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==========================================
// 📄 PAYSLIP COMPONENT
// ==========================================
const PayslipContent = ({ record: r, t }: { record: PayrollRecord, t: any }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-slate-900 text-xl border border-slate-100">
        {r.firstname_th.charAt(0)}
      </div>
      <div>
        <p className="font-black text-lg text-slate-900 leading-none">{r.firstname_th} {r.lastname_th}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {r.department_name}
        </p>
        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
          {r.position_name}
        </p>
      </div>
    </div>

    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.lblEarnings || "Earnings"}</p>
      <div className="grid grid-cols-2 gap-y-3 text-sm font-bold">
        <span className="text-slate-500">{t.lblBaseSalary || "Base Salary"}</span><span className="text-right text-slate-900">{fmt(r.base_salary)}</span>
        <span className="text-slate-500">{t.lblPosAllow || "Position Allowance"}</span><span className="text-right text-slate-900">{fmt(r.position_allowance)}</span>
        <span className="text-slate-500">{t.lblOT || "Overtime (OT)"}</span><span className="text-right text-slate-900">{fmt(r.ot_amount)}</span>
        <span className="text-slate-500">{t.lblOtherInc || "Other Income"}</span><span className="text-right text-slate-900">{fmt(r.other_income || 0)}</span>
        <div className="col-span-2 mt-2 py-3 px-4 bg-green-50/50 rounded-xl flex justify-between border border-green-200">
          <span className="text-green-700 font-black text-[10px] tracking-widest uppercase">{t.lblTotalInc || "Total Income"}</span>
          <span className="text-green-700 font-black">{fmt(r.total_income)}</span>
        </div>
      </div>
    </div>

    <Separator className="bg-slate-100 my-4" />

    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t.lblDeductions || "Deductions"}</p>
      <div className="grid grid-cols-2 gap-y-3 text-sm font-bold">
        <span className="text-slate-500">{t.lblSSO || "Social Security"}</span><span className="text-right text-slate-900">{fmt(r.sso_amount || 0)}</span>
        <span className="text-slate-500">{t.lblTax || "Tax"}</span><span className="text-right text-slate-900">{fmt(r.tax_amount || 0)}</span>
        <span className="text-slate-500">{t.lblOtherDed || "Other Deductions"}</span><span className="text-right text-slate-900">{fmt(r.other_deduction || 0)}</span>
        <div className="col-span-2 mt-2 py-3 px-4 bg-red-50/50 rounded-xl flex justify-between border border-red-200">
          <span className="text-red-700 font-black text-[10px] tracking-widest uppercase">{t.lblTotalDed || "Total Deductions"}</span>
          <span className="text-red-700 font-black">-{fmt(r.total_deduction)}</span>
        </div>
      </div>
    </div>

    <div className="pt-4">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl flex justify-between items-center shadow-xl shadow-blue-200">
        <span className="font-black text-blue-100 text-[10px] uppercase tracking-widest">{t.lblNetSalary || "Net Pay"}</span>
        <span className="text-3xl font-black text-white  tracking-tighter">฿{fmt(r.net_pay)}</span>
      </div>
    </div>
  </div>
);