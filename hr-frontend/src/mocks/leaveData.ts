export const MOCK_LEAVE_REQUESTS = [
  { 
    id: 1, employee_id: 1, user_id: 4, employeeCode: "EMP-IT-001", 
    employeeName: "สมชาย มั่นคง", departmentName: "ฝ่ายปฏิบัติการ (IT)", positionName: "Senior Developer",
    leaveType: "ลาป่วย (Sick Leave)", startDate: "2026-03-25", endDate: "2026-03-26", days: 2, 
    reason: "ไข้หวัดใหญ่ มีใบรับรองแพทย์", status: "pending", rejectReason: "", attachment_file: "med_cert.pdf", company_id: 1 
  },
  { 
    id: 2, employee_id: 2, user_id: 102, employeeCode: "EMP-IT-002", 
    employeeName: "วิชัย เก่งโค้ด", departmentName: "ฝ่ายปฏิบัติการ (IT)", positionName: "Software Engineer",
    leaveType: "ลากิจ (Business Leave)", startDate: "2026-04-10", endDate: "2026-04-10", days: 1, 
    reason: "ติดต่อราชการ (ทำพาสปอร์ต)", status: "approved", rejectReason: "", attachment_file: "", company_id: 1 
  },
  { 
    id: 3, employee_id: 1, user_id: 4, employeeCode: "EMP-IT-001", 
    employeeName: "สมชาย มั่นคง", departmentName: "ฝ่ายปฏิบัติการ (IT)", positionName: "Senior Developer",
    leaveType: "ลาพักร้อน (Annual Leave)", startDate: "2026-02-14", endDate: "2026-02-15", days: 2, 
    reason: "พักผ่อนต่างจังหวัด", status: "approved", rejectReason: "", attachment_file: "", company_id: 1 
  },
  { 
    id: 4, employee_id: 3, user_id: 103, employeeCode: "EMP-HR-001", 
    employeeName: "สมหญิง ใจดี", departmentName: "ฝ่ายบริหาร (HR)", positionName: "HR Manager",
    leaveType: "ลาป่วย (Sick Leave)", startDate: "2026-03-10", endDate: "2026-03-10", days: 1, 
    reason: "ปวดหัว", status: "rejected", rejectReason: "ไม่มีใบรับรองแพทย์", attachment_file: "", company_id: 1 
  },
  
  { 
    id: 5, employee_id: 4, user_id: 104, employeeCode: "EMP-MK-001", 
    employeeName: "มานี มีแชร์", departmentName: "ฝ่ายการตลาด (Marketing)", positionName: "Marketing Executive",
    leaveType: "ลากิจ (Business Leave)", startDate: "2026-03-28", endDate: "2026-03-28", days: 0.5, 
    halfDayPeriod: "morning", 
    reason: "ไปทำธุระที่ธนาคาร (ช่วงเช้า)", status: "pending", rejectReason: "", attachment_file: "", company_id: 1 
  },
  
  { 
    id: 6, employee_id: 5, user_id: 105, employeeCode: "EMP-FN-001", 
    employeeName: "ชูใจ ใฝ่เรียน", departmentName: "ฝ่ายบัญชี (Finance)", positionName: "Accountant",
    leaveType: "ลาป่วย (Sick Leave)", startDate: "2026-04-02", endDate: "2026-04-02", days: 0.5, 
    halfDayPeriod: "afternoon", 
    reason: "พบแพทย์ตามนัด (ช่วงบ่าย)", status: "approved", rejectReason: "", attachment_file: "appointment.pdf", company_id: 1 
  }
];