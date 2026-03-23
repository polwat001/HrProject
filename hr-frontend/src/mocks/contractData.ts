export const CONTRACT_TYPES = [
  { value: "employment", label: "พนักงานประจำ (Employment)", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "probation", label: "ทดลองงาน (Probation)", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "fixed_term", label: "สัญญาชั่วคราว (Fixed Term)", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { value: "internship", label: "นักศึกษาฝึกงาน (Internship)", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "outsource", label: "รับเหมา (Outsource)", color: "bg-slate-200 text-slate-700 border-slate-300" },
  { value: "consultant", label: "ที่ปรึกษา (Consultant)", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

export const MOCK_COMPANIES = [
  { id: 1, name_th: "Thai Summit Automotive Co., Ltd. (Headquarter)" },
  { id: 2, name_th: "Thai Summit Harness Co., Ltd." },
];

export const MOCK_EMPLOYEES = [
  { id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส" },
  { id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล" },
  { id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชี" },
];

export const MOCK_CONTRACTS = [
  { id: 1, employee_id: 1, company_id: 1, contract_number: "CT-2026-001", contract_type: "employment", start_date: "2025-01-01", end_date: "2026-12-31", status: "active" },
  { id: 2, employee_id: 2, company_id: 1, contract_number: "CT-2026-002", contract_type: "fixed_term", start_date: "2024-05-15", end_date: "2025-05-14", status: "renewed" },
  { id: 3, employee_id: 3, company_id: 2, contract_number: "CT-2026-003", contract_type: "probation", start_date: "2025-08-01", end_date: "2026-03-25", status: "expiring" },
  { id: 4, employee_id: 2, company_id: 1, contract_number: "CT-2023-099", contract_type: "internship", start_date: "2023-01-01", end_date: "2023-12-31", status: "expired" },
];