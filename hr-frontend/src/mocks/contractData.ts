export const MOCK_COMPANIES = [
  { id: 1, name_th: "Thai Summit Automotive Co., Ltd. (Headquarter)" },
  { id: 2, name_th: "Thai Summit Harness Co., Ltd." },
];

export const MOCK_EMPLOYEES = [
  // ✅ เพิ่ม department_name และ position_name เข้ามา
  { id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส" },
  { id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล" },
  { id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชี" },
];

export const MOCK_CONTRACTS = [
  { id: 1, employee_id: 1, company_id: 1, contract_number: "CT-2026-001", start_date: "2025-01-01", end_date: "2026-12-31", status: "active" },
  { id: 2, employee_id: 2, company_id: 1, contract_number: "CT-2026-002", start_date: "2024-05-15", end_date: "2025-05-14", status: "renewed" },
  { id: 3, employee_id: 3, company_id: 2, contract_number: "CT-2026-003", start_date: "2025-08-01", end_date: "2026-03-25", status: "expiring" },
  { id: 4, employee_id: 2, company_id: 1, contract_number: "CT-2023-099", start_date: "2023-01-01", end_date: "2023-12-31", status: "expired" },
];