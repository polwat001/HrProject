export const MOCK_AVAILABLE_MONTHS = [
  { payroll_month: 3, payroll_year: 2026 },
  { payroll_month: 2, payroll_year: 2026 },
  { payroll_month: 1, payroll_year: 2026 },
];

export const MOCK_PAYROLL_RECORDS = [
  // ==========================================
  // 🟢 เดือน 3 ปี 2026
  // ==========================================
  {
    id: 1, employee_id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส (Senior Programmer)",
    base_salary: 45000, position_allowance: 5000, ot_amount: 3500, other_income: 1000, total_income: 54500,
    sso_amount: 750, tax_amount: 1500, other_deduction: 0, total_deduction: 2250, net_pay: 52250,
    payroll_month: 3, payroll_year: 2026, status: "paid"
  },
  {
    id: 2, employee_id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล (HR Manager)",
    base_salary: 30000, position_allowance: 2000, ot_amount: 1200, other_income: 0, total_income: 33200,
    sso_amount: 750, tax_amount: 500, other_deduction: 500, total_deduction: 1750, net_pay: 31450,
    payroll_month: 3, payroll_year: 2026, status: "paid"
  },
  {
    id: 3, employee_id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชีอาวุโส (Senior Accountant)",
    base_salary: 35000, position_allowance: 0, ot_amount: 0, other_income: 1500, total_income: 36500,
    sso_amount: 750, tax_amount: 800, other_deduction: 0, total_deduction: 1550, net_pay: 34950,
    payroll_month: 3, payroll_year: 2026, status: "paid"
  },
  {
    id: 4, employee_id: 4, employee_code: "EMP-004", firstname_th: "มานี", lastname_th: "ทำดี", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "ผู้ดูแลระบบ (System Admin)",
    base_salary: 28000, position_allowance: 0, ot_amount: 2000, other_income: 0, total_income: 30000,
    sso_amount: 750, tax_amount: 300, other_deduction: 0, total_deduction: 1050, net_pay: 28950,
    payroll_month: 3, payroll_year: 2026, status: "paid"
  },
  {
    id: 5, employee_id: 5, employee_code: "EMP-005", firstname_th: "ปิติ", lastname_th: "รักเรียน", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "ผู้จัดการฝ่ายการเงิน (Finance Manager)",
    base_salary: 40000, position_allowance: 3000, ot_amount: 1000, other_income: 0, total_income: 44000,
    sso_amount: 750, tax_amount: 1200, other_deduction: 0, total_deduction: 1950, net_pay: 42050,
    payroll_month: 3, payroll_year: 2026, status: "paid"
  },
  {
    id: 6, employee_id: 6, employee_code: "EMP-006", firstname_th: "ชูใจ", lastname_th: "ไพเราะ", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "เจ้าหน้าที่สรรหา (Recruiter)",
    base_salary: 25000, position_allowance: 0, ot_amount: 500, other_income: 0, total_income: 25500,
    sso_amount: 750, tax_amount: 150, other_deduction: 0, total_deduction: 900, net_pay: 24600,
    payroll_month: 3, payroll_year: 2026, status: "paid"
  },

  // ==========================================
  // 🟡 เดือน 2 ปี 2026
  // ==========================================
  {
    id: 7, employee_id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส (Senior Programmer)",
    base_salary: 45000, position_allowance: 5000, ot_amount: 2000, other_income: 0, total_income: 52000,
    sso_amount: 750, tax_amount: 1500, other_deduction: 0, total_deduction: 2250, net_pay: 49750,
    payroll_month: 2, payroll_year: 2026, status: "paid"
  },
  {
    id: 8, employee_id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล (HR Manager)",
    base_salary: 30000, position_allowance: 2000, ot_amount: 500, other_income: 0, total_income: 32500,
    sso_amount: 750, tax_amount: 500, other_deduction: 0, total_deduction: 1250, net_pay: 31250,
    payroll_month: 2, payroll_year: 2026, status: "paid"
  },
  {
    id: 9, employee_id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชีอาวุโส (Senior Accountant)",
    base_salary: 35000, position_allowance: 0, ot_amount: 1000, other_income: 0, total_income: 36000,
    sso_amount: 750, tax_amount: 800, other_deduction: 0, total_deduction: 1550, net_pay: 34450,
    payroll_month: 2, payroll_year: 2026, status: "paid"
  },
  {
    id: 10, employee_id: 4, employee_code: "EMP-004", firstname_th: "มานี", lastname_th: "ทำดี", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "ผู้ดูแลระบบ (System Admin)",
    base_salary: 28000, position_allowance: 0, ot_amount: 2500, other_income: 0, total_income: 30500,
    sso_amount: 750, tax_amount: 300, other_deduction: 0, total_deduction: 1050, net_pay: 29450,
    payroll_month: 2, payroll_year: 2026, status: "paid"
  },
  {
    id: 11, employee_id: 5, employee_code: "EMP-005", firstname_th: "ปิติ", lastname_th: "รักเรียน", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "ผู้จัดการฝ่ายการเงิน (Finance Manager)",
    base_salary: 40000, position_allowance: 3000, ot_amount: 500, other_income: 0, total_income: 43500,
    sso_amount: 750, tax_amount: 1200, other_deduction: 0, total_deduction: 1950, net_pay: 41550,
    payroll_month: 2, payroll_year: 2026, status: "paid"
  },
  {
    id: 12, employee_id: 6, employee_code: "EMP-006", firstname_th: "ชูใจ", lastname_th: "ไพเราะ", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "เจ้าหน้าที่สรรหา (Recruiter)",
    base_salary: 25000, position_allowance: 0, ot_amount: 0, other_income: 0, total_income: 25000,
    sso_amount: 750, tax_amount: 150, other_deduction: 0, total_deduction: 900, net_pay: 24100,
    payroll_month: 2, payroll_year: 2026, status: "paid"
  },

  // ==========================================
  // 🔵 เดือน 1 ปี 2026
  // ==========================================
  {
    id: 13, employee_id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส (Senior Programmer)",
    base_salary: 45000, position_allowance: 5000, ot_amount: 4000, other_income: 500, total_income: 54500,
    sso_amount: 750, tax_amount: 1500, other_deduction: 0, total_deduction: 2250, net_pay: 52250,
    payroll_month: 1, payroll_year: 2026, status: "paid"
  },
  {
    id: 14, employee_id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล (HR Manager)",
    base_salary: 30000, position_allowance: 2000, ot_amount: 1500, other_income: 0, total_income: 33500,
    sso_amount: 750, tax_amount: 500, other_deduction: 0, total_deduction: 1250, net_pay: 32250,
    payroll_month: 1, payroll_year: 2026, status: "paid"
  },
  {
    id: 15, employee_id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชีอาวุโส (Senior Accountant)",
    base_salary: 35000, position_allowance: 0, ot_amount: 500, other_income: 0, total_income: 35500,
    sso_amount: 750, tax_amount: 800, other_deduction: 0, total_deduction: 1550, net_pay: 33950,
    payroll_month: 1, payroll_year: 2026, status: "paid"
  },
  {
    id: 16, employee_id: 4, employee_code: "EMP-004", firstname_th: "มานี", lastname_th: "ทำดี", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "ผู้ดูแลระบบ (System Admin)",
    base_salary: 28000, position_allowance: 0, ot_amount: 3000, other_income: 0, total_income: 31000,
    sso_amount: 750, tax_amount: 300, other_deduction: 0, total_deduction: 1050, net_pay: 29950,
    payroll_month: 1, payroll_year: 2026, status: "paid"
  },
  {
    id: 17, employee_id: 5, employee_code: "EMP-005", firstname_th: "ปิติ", lastname_th: "รักเรียน", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "ผู้จัดการฝ่ายการเงิน (Finance Manager)",
    base_salary: 40000, position_allowance: 3000, ot_amount: 0, other_income: 0, total_income: 43000,
    sso_amount: 750, tax_amount: 1200, other_deduction: 0, total_deduction: 1950, net_pay: 41050,
    payroll_month: 1, payroll_year: 2026, status: "paid"
  },
  {
    id: 18, employee_id: 6, employee_code: "EMP-006", firstname_th: "ชูใจ", lastname_th: "ไพเราะ", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "เจ้าหน้าที่สรรหา (Recruiter)",
    base_salary: 25000, position_allowance: 0, ot_amount: 800, other_income: 0, total_income: 25800,
    sso_amount: 750, tax_amount: 150, other_deduction: 0, total_deduction: 900, net_pay: 24900,
    payroll_month: 1, payroll_year: 2026, status: "paid"
  },

  // ==========================================
  // 🟣 เดือน 12 ปี 2025
  // ==========================================
  {
    id: 19, employee_id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส (Senior Programmer)",
    base_salary: 45000, position_allowance: 5000, ot_amount: 5000, other_income: 2000, total_income: 57000,
    sso_amount: 750, tax_amount: 1500, other_deduction: 0, total_deduction: 2250, net_pay: 54750,
    payroll_month: 12, payroll_year: 2025, status: "paid"
  },
  {
    id: 20, employee_id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล (HR Manager)",
    base_salary: 30000, position_allowance: 2000, ot_amount: 1800, other_income: 0, total_income: 33800,
    sso_amount: 750, tax_amount: 500, other_deduction: 0, total_deduction: 1250, net_pay: 32550,
    payroll_month: 12, payroll_year: 2025, status: "paid"
  },
  {
    id: 21, employee_id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชีอาวุโส (Senior Accountant)",
    base_salary: 35000, position_allowance: 0, ot_amount: 1200, other_income: 3000, total_income: 39200,
    sso_amount: 750, tax_amount: 800, other_deduction: 0, total_deduction: 1550, net_pay: 37650,
    payroll_month: 12, payroll_year: 2025, status: "paid"
  },
  {
    id: 22, employee_id: 4, employee_code: "EMP-004", firstname_th: "มานี", lastname_th: "ทำดี", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "ผู้ดูแลระบบ (System Admin)",
    base_salary: 28000, position_allowance: 0, ot_amount: 4000, other_income: 0, total_income: 32000,
    sso_amount: 750, tax_amount: 300, other_deduction: 0, total_deduction: 1050, net_pay: 30950,
    payroll_month: 12, payroll_year: 2025, status: "paid"
  },
  {
    id: 23, employee_id: 5, employee_code: "EMP-005", firstname_th: "ปิติ", lastname_th: "รักเรียน", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "ผู้จัดการฝ่ายการเงิน (Finance Manager)",
    base_salary: 40000, position_allowance: 3000, ot_amount: 1000, other_income: 5000, total_income: 49000,
    sso_amount: 750, tax_amount: 1200, other_deduction: 0, total_deduction: 1950, net_pay: 47050,
    payroll_month: 12, payroll_year: 2025, status: "paid"
  },
  {
    id: 24, employee_id: 6, employee_code: "EMP-006", firstname_th: "ชูใจ", lastname_th: "ไพเราะ", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "เจ้าหน้าที่สรรหา (Recruiter)",
    base_salary: 25000, position_allowance: 0, ot_amount: 1500, other_income: 0, total_income: 26500,
    sso_amount: 750, tax_amount: 150, other_deduction: 0, total_deduction: 900, net_pay: 25600,
    payroll_month: 12, payroll_year: 2025, status: "paid"
  },

  // ==========================================
  // 🟠 เดือน 11 ปี 2025
  // ==========================================
  {
    id: 25, employee_id: 1, employee_code: "EMP-001", firstname_th: "สมชาย", lastname_th: "มั่นคง", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "โปรแกรมเมอร์อาวุโส (Senior Programmer)",
    base_salary: 45000, position_allowance: 5000, ot_amount: 1500, other_income: 0, total_income: 51500,
    sso_amount: 750, tax_amount: 1500, other_deduction: 0, total_deduction: 2250, net_pay: 49250,
    payroll_month: 11, payroll_year: 2025, status: "paid"
  },
  {
    id: 26, employee_id: 2, employee_code: "EMP-002", firstname_th: "วิชัย", lastname_th: "เก่งโค้ด", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "หัวหน้าฝ่ายบุคคล (HR Manager)",
    base_salary: 30000, position_allowance: 2000, ot_amount: 0, other_income: 0, total_income: 32000,
    sso_amount: 750, tax_amount: 500, other_deduction: 0, total_deduction: 1250, net_pay: 30750,
    payroll_month: 11, payroll_year: 2025, status: "paid"
  },
  {
    id: 27, employee_id: 3, employee_code: "EMP-003", firstname_th: "สมหญิง", lastname_th: "ใจดี", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "พนักงานบัญชีอาวุโส (Senior Accountant)",
    base_salary: 35000, position_allowance: 0, ot_amount: 800, other_income: 0, total_income: 35800,
    sso_amount: 750, tax_amount: 800, other_deduction: 0, total_deduction: 1550, net_pay: 34250,
    payroll_month: 11, payroll_year: 2025, status: "paid"
  },
  {
    id: 28, employee_id: 4, employee_code: "EMP-004", firstname_th: "มานี", lastname_th: "ทำดี", department_name: "แผนกเทคโนโลยีสารสนเทศ (IT)", position_name: "ผู้ดูแลระบบ (System Admin)",
    base_salary: 28000, position_allowance: 0, ot_amount: 1200, other_income: 0, total_income: 29200,
    sso_amount: 750, tax_amount: 300, other_deduction: 0, total_deduction: 1050, net_pay: 28150,
    payroll_month: 11, payroll_year: 2025, status: "paid"
  },
  {
    id: 29, employee_id: 5, employee_code: "EMP-005", firstname_th: "ปิติ", lastname_th: "รักเรียน", department_name: "แผนกบัญชีและการเงิน (Accounting)", position_name: "ผู้จัดการฝ่ายการเงิน (Finance Manager)",
    base_salary: 40000, position_allowance: 3000, ot_amount: 0, other_income: 0, total_income: 43000,
    sso_amount: 750, tax_amount: 1200, other_deduction: 0, total_deduction: 1950, net_pay: 41050,
    payroll_month: 11, payroll_year: 2025, status: "paid"
  },
  {
    id: 30, employee_id: 6, employee_code: "EMP-006", firstname_th: "ชูใจ", lastname_th: "ไพเราะ", department_name: "แผนกทรัพยากรบุคคล (HR)", position_name: "เจ้าหน้าที่สรรหา (Recruiter)",
    base_salary: 25000, position_allowance: 0, ot_amount: 200, other_income: 0, total_income: 25200,
    sso_amount: 750, tax_amount: 150, other_deduction: 0, total_deduction: 900, net_pay: 24300,
    payroll_month: 11, payroll_year: 2025, status: "paid"
  }
];

export type PayrollRecord = typeof MOCK_PAYROLL_RECORDS[0];