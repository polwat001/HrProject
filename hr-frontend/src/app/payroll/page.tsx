"use client";

import { useEffect, useState } from "react";
import { payrollAPI } from "@/services/api";

import {
  DollarSign,
  Users,
  TrendingUp,
  Calculator,
  FileText,
  Download,
  ArrowUpDown,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";

type PayrollRecord = {
  id: number;
  employee_id: number;

  employee_code: string;
  employee_name: string;
  NAME: string;

  base_salary: number;
  position_allowance: number;
  ot_amount: number;

  total_income: number;
  total_deduction: number;
  net_pay: number;

  payroll_month: number;
  payroll_year: number;

  status: string;
};

const fmt = (n: number | string) => Number(n).toLocaleString("th-TH");

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  draft: { label: "ฉบับร่าง", variant: "outline" },
  calculated: { label: "คำนวณแล้ว", variant: "secondary" },
  approved: { label: "อนุมัติแล้ว", variant: "default" },
  paid: { label: "จ่ายแล้ว", variant: "default" },
};

const months = [
  { value: "2-2026", label: "กุมภาพันธ์ 2026" },
  { value: "1-2026", label: "มกราคม 2026" },
];

export default function PayrollPage() {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("2-2026");
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(
    null,
  );

  const [sortField, setSortField] = useState<"employee_code" | "net_pay">(
    "employee_code",
  );
  const [sortAsc, setSortAsc] = useState(true);

  const [month, year] = selectedMonth.split("-").map(Number);

  // โหลด payroll
  useEffect(() => {
    const loadPayroll = async () => {
      try {
        const res = await payrollAPI.getPayrolls({
          month,
          year,
        });

        setPayrollRecords(res.data);
      } catch (err) {
        console.error("load payroll error", err);
      }
    };

    loadPayroll();
  }, [month, year]);

  const filtered = payrollRecords.sort((a, b) => {
    const v = sortAsc ? 1 : -1;

    if (sortField === "net_pay") {
      return (a.net_pay - b.net_pay) * v;
    }

    return a.employee_code.localeCompare(b.employee_code) * v;
  });

  const toggleSort = (field: "employee_code" | "net_pay") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">💰 Payroll Management</h2>
          <p className="text-muted-foreground text-sm">
            จัดการเงินเดือนพนักงาน
          </p>
        </div>

        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <CardHeader>
        <CardTitle>
          Payroll เดือน {months.find((m) => m.value === selectedMonth)?.label}
        </CardTitle>
      </CardHeader>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => toggleSort("employee_code")}
                >
                  รหัส <ArrowUpDown size={12} />
                </TableHead>

                <TableHead>ชื่อ</TableHead>
                <TableHead>แผนก</TableHead>

                <TableHead className="text-right">เงินเดือน</TableHead>
                <TableHead className="text-right">ค่าตำแหน่ง</TableHead>
                <TableHead className="text-right">OT</TableHead>

                <TableHead className="text-right">รายได้รวม</TableHead>
                <TableHead className="text-right">หักรวม</TableHead>

                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => toggleSort("net_pay")}
                >
                  สุทธิ <ArrowUpDown size={12} />
                </TableHead>

                <TableHead className="text-center">สลิป</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.employee_code}</TableCell>
                  <TableCell>
                    {r.firstname_th} {r.lastname_th}
                  </TableCell>
                  <TableCell>{r.NAME}</TableCell>

                  <TableCell className="text-right">
                    {fmt(r.base_salary)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(r.position_allowance)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(r.ot_amount)}
                  </TableCell>

                  <TableCell className="text-right">
                    {fmt(r.total_income)}
                  </TableCell>

                  <TableCell className="text-right text-red-500">
                    {fmt(r.total_deduction)}
                  </TableCell>

                  <TableCell className="text-right font-bold">
                    {fmt(r.net_pay)}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPayslip(r)}
                    >
                      <FileText size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PAYSLIP */}

      <Dialog
        open={!!selectedPayslip}
        onOpenChange={() => setSelectedPayslip(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payslip</DialogTitle>
          </DialogHeader>

          {selectedPayslip && <PayslipContent record={selectedPayslip} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const PayslipContent = ({ record: r }: { record: PayrollRecord }) => (
  <div className="space-y-4 bg-white">
    <div className="border p-4 rounded-lg">
      <p className="font-bold">{r.employee_name}</p>
      <p className="text-sm text-muted-foreground">{r.employee_code}</p>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p>เงินเดือน</p>
        <p>ค่าตำแหน่ง</p>
        <p>OT</p>
        <Separator />
        <p>รายได้รวม</p>
      </div>

      <div className="text-right">
        <p>{fmt(r.base_salary)}</p>
        <p>{fmt(r.position_allowance)}</p>
        <p>{fmt(r.ot_amount)}</p>
        <Separator />
        <p>{fmt(r.total_income)}</p>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p>หักรวม</p>
      </div>

      <div className="text-right text-red-500">
        <p>{fmt(r.total_deduction)}</p>
      </div>
    </div>

    <div className="border border-black/80 p-4 rounded-lg flex justify-between">
      <span>Net Pay</span>
      <span className="font-bold">฿{fmt(r.net_pay)}</span>
    </div>
  </div>
);
