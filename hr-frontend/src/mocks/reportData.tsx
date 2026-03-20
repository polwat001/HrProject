import { Users, Clock, TrendingUp, BarChart3, FileText, AlertCircle } from 'lucide-react';

// จำลองข้อมูลแผนกสำหรับใช้ในตัวกรอง
export const MOCK_DEPARTMENTS_REPORT = [
  { id: 1, name: "แผนกเทคโนโลยีสารสนเทศ (IT)" },
  { id: 2, name: "แผนกทรัพยากรบุคคล (HR)" },
  { id: 3, name: "แผนกบัญชีและการเงิน (Accounting)" },
  { id: 4, name: "ฝ่ายผลิต (Production)" },
];

export type FilterConfig = "date-range" | "month-year" | "status-only";

export interface ReportConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  formats: ('excel' | 'pdf')[];
  category: 'payroll' | 'attendance' | 'organization';
  filterType: FilterConfig; // 👈 กำหนดว่ารายงานนี้ต้องกรอกอะไรบ้าง
}

export const REPORT_LIST: ReportConfig[] = [
  {
    id: 'employee-master',
    title: '👥 Employee Master List',
    description: 'รายชื่อพนักงานทั้งหมด ข้อมูลส่วนตัว และข้อมูลการจ้างงาน',
    icon: <Users className="text-blue-600" size={32} />,
    formats: ['excel', 'pdf'],
    category: 'organization',
    filterType: 'status-only', // เลือกแค่สถานะและแผนก
  },
  {
    id: 'attendance-summary',
    title: '⏱️ Attendance Summary',
    description: 'สรุปเวลาเข้า-ออกงาน การมาสาย และการขาดงาน',
    icon: <Clock className="text-green-600" size={32} />,
    formats: ['excel', 'pdf'],
    category: 'attendance',
    filterType: 'date-range', // เลือกเป็นช่วงวันที่ (รายวัน/ช่วงวัน)
  },
  {
    id: 'leave-summary',
    title: '🏖️ Leave Summary',
    description: 'สรุปการลางานและโควต้าวันหยุดคงเหลือของพนักงาน',
    icon: <FileText className="text-pink-600" size={32} />,
    formats: ['excel'],
    category: 'attendance',
    filterType: 'month-year', // เลือกเป็นรายเดือน
  },
  {
    id: 'payroll-summary',
    title: '💰 Payroll & OT Report',
    description: 'รายงานสรุปเงินเดือน รายการหัก และค่าล่วงเวลา (OT)',
    icon: <TrendingUp className="text-purple-600" size={32} />,
    formats: ['excel', 'pdf'],
    category: 'payroll',
    filterType: 'month-year', // เลือกเป็นรายเดือน
  },
  {
    id: 'headcount-analysis',
    title: '📊 Headcount Analysis',
    description: 'รายงานวิเคราะห์โครงสร้างองค์กรและอัตรากำลังคน',
    icon: <BarChart3 className="text-orange-600" size={32} />,
    formats: ['excel', 'pdf'],
    category: 'organization',
    filterType: 'status-only',
  },
  {
    id: 'contract-status',
    title: '📋 Contract Status',
    description: 'รายงานสถานะสัญญาจ้างและกำหนดการต่อสัญญา',
    icon: <AlertCircle className="text-red-600" size={32} />,
    formats: ['excel', 'pdf'],
    category: 'organization',
    filterType: 'month-year',
  },
];