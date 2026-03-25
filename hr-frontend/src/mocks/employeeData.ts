// ==========================================
// 📦 MOCK DATA: ศูนย์รวมข้อมูลเพื่อใช้ในหน้า Employees
// ข้อมูลทั้งหมดอิงจากหน้า Division, Section, Dept, Level, Position
// ==========================================

export const MOCK_COMPANIES = [
  { id: 1, name_th: "Thai Summit Automotive Co., Ltd. (Headquarter)" },
  { id: 2, name_th: "Thai Summit Harness Co., Ltd." },
];

export const MOCK_DIVISIONS = [
  { id: 1, name: "สายงานบริหาร (Administration)", company_id: 1 },
  { id: 4, name: "สายงานเทคโนโลยีสารสนเทศ (IT)", company_id: 1 },
  { id: 5, name: "สายงานทรัพยากรบุคคล (Human Resources)", company_id: 1 },
];

export const MOCK_SECTIONS = [
  { id: 1, name: "ส่วนงานบัญชี", division_id: 1 },
  { id: 9, name: "ส่วนงานพัฒนาซอฟต์แวร์", division_id: 4 },
  { id: 10, name: "ส่วนงานสรรหาว่าจ้าง", division_id: 5 },
];

export const MOCK_DEPARTMENTS = [
  { id: 1, NAME: "แผนกทรัพยากรบุคคล (HR)", section_id: 10, company_id: 1 },
  { id: 2, NAME: "แผนกเทคโนโลยีสารสนเทศ (IT)", section_id: 9, company_id: 1 },
  { id: 3, NAME: "แผนกบัญชีและการเงิน (Accounting)", section_id: 1, company_id: 1 },
];

export const MOCK_LEVELS = [
  { id: 1, level_code: "M1", level_title: "Manager 1" },
  { id: 2, level_code: "M2", level_title: "Manager 2" },
  { id: 3, level_code: "S1", level_title: "Senior Staff" },
  { id: 4, level_code: "S2", level_title: "Staff" },
];

export const MOCK_POSITIONS = [
  { id: 1, title_th: "ผู้จัดการแผนกไอที", level_id: 1, department_id: 2, company_id: 1 },
  { id: 2, title_th: "หัวหน้าฝ่ายบุคคล", level_id: 2, department_id: 1, company_id: 1 },
  { id: 3, title_th: "โปรแกรมเมอร์อาวุโส", level_id: 3, department_id: 2, company_id: 1 },
  { id: 4, title_th: "พนักงานบัญชี", level_id: 4, department_id: 3, company_id: 1 },
];

export const MOCK_EMPLOYEES = [
  {
    id: 1,
    employee_code: "EMP-IT-001",
    firstname_th: "สมชาย",
    lastname_th: "มั่นคง",
    nickname: "ชาย",
    id_card_number: "1111111111111",
    current_company_id: 1,
    department_id: 2, // แผนกไอที
    position_id: 1,   // ผู้จัดการแผนกไอที
    STATUS: "active",
  },
  {
    id: 2,
    employee_code: "EMP-IT-002",
    firstname_th: "วิชัย",
    lastname_th: "เก่งโค้ด",
    nickname: "วิ",
    id_card_number: "2222222222222",
    current_company_id: 1,
    department_id: 2, // แผนกไอที
    position_id: 3,   // โปรแกรมเมอร์อาวุโส
    STATUS: "active",
  },
  {
    id: 3,
    employee_code: "EMP-HR-001",
    firstname_th: "สมหญิง",
    lastname_th: "ใจดี",
    nickname: "หญิง",
    id_card_number: "3333333333333",
    current_company_id: 1,
    department_id: 1, // แผนกทรัพยากรบุคคล
    position_id: 2,   // หัวหน้าฝ่ายบุคคล
    STATUS: "active",
  },
  {
    id: 4,
    employee_code: "EMP-ACC-001",
    firstname_th: "นลิน",
    lastname_th: "รักเงิน",
    nickname: "ลิน",
    id_card_number: "4444444444444",
    current_company_id: 1,
    department_id: 3, // แผนกบัญชี
    position_id: 4,   // พนักงานบัญชี
    STATUS: "probation",
  }
];

// ==========================================
// 🧑‍💼 MOCK DATA: Employee (ข้อมูลพนักงาน)
// ==========================================

export type EmployeeMock = {
  id: number;
  code: string;
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: "active" | "inactive";
};

// ฟังก์ชันสร้างพนักงานจำลอง 50 คนแบบด่วนๆ
const generateEmployees = (): EmployeeMock[] => {
  const departments = ["แผนกพัฒนาซอฟต์แวร์", "แผนกสรรหาบุคลากร", "แผนกบัญชีทั่วไป", "แผนกการตลาด", "แผนกคลังสินค้า"];
  const positions = ["Manager", "Supervisor", "Senior Staff", "Staff", "Operator"];

  return Array.from({ length: 50 }).map((_, index) => {
    const id = index + 1;
    const isFemale = id % 2 === 0;
    
    return {
      id: id,
      code: `EMP-${String(id).padStart(3, '0')}`,
      prefix: isFemale ? "นางสาว" : "นาย",
      firstName: `พนักงาน${id}`,
      lastName: `ทดสอบระบบ`,
      email: `employee${id}@company.com`,
      phone: `080-${String(id).padStart(3, '0')}-${String(id + 1000).padStart(4, '0')}`,
      department: departments[id % departments.length], 
      position: positions[id % positions.length],       
      status: id % 10 === 0 ? "inactive" : "active"     
    };
  });
};

export const INITIAL_MOCK_EMPLOYEES = generateEmployees();