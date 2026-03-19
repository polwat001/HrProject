// เพิ่มข้อมูลแผนก (จำลอง)
export const MOCK_DEPARTMENTS_OT = [
  { id: 1, name: "แผนกทรัพยากรบุคคล (HR)" },
  { id: 2, name: "แผนกเทคโนโลยีสารสนเทศ (IT)" },
  { id: 3, name: "แผนกบัญชีและการเงิน (Accounting)" },
];

export const MOCK_OT_REQUESTS = [
  { id: 1, user_id: 4, employee_name: "สมชาย มั่นคง", employee_code: "EMP001", department_id: 2, department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", date: "2026-03-20", hours: 3, reason: "เคลียร์งานระบบเซิร์ฟเวอร์", status: "pending", company_id: 1 },
  { id: 2, user_id: 102, employee_name: "สมหญิง ใจดี", employee_code: "EMP002", department_id: 1, department_name: "แผนกทรัพยากรบุคคล (HR)", date: "2026-03-18", hours: 2, reason: "ทำสรุปยอดบัญชีสิ้นเดือน", status: "approved", company_id: 1 },
  { id: 3, user_id: 4, employee_name: "สมชาย มั่นคง", employee_code: "EMP001", department_id: 2, department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", date: "2026-03-15", hours: 4, reason: "อัปเดตระบบฉุกเฉิน", status: "approved", company_id: 1 },
  { id: 4, user_id: 103, employee_name: "วิชัย รักงาน", employee_code: "EMP003", department_id: 3, department_name: "แผนกบัญชีและการเงิน (Accounting)", date: "2026-03-19", hours: 1.5, reason: "ซ่อมบำรุงเครื่องจักร", status: "rejected", company_id: 1 },
];