


export const ORG_HIERARCHY = [
  {
    division: "Operations Division (สายงานปฏิบัติการ)",
    sections: [
      { section: "Production (ส่วนงานผลิต)", departments: ["Assembly (แผนกประกอบ)", "Packaging (แผนกบรรจุภัณฑ์)"] },
      { section: "Quality Control (ส่วนงานควบคุมคุณภาพ)", departments: ["QA/QC (แผนกตรวจสอบ)"] }
    ]
  },
  {
    division: "Admin & Support Division (สายงานสนับสนุน)",
    sections: [
      { section: "HR & Admin (ส่วนงานบุคคลและธุรการ)", departments: ["Human Resources (แผนกบุคคล)", "Security (แผนกรปภ.)"] },
      { section: "IT Services (ส่วนงานไอที)", departments: ["IT Support (แผนกไอที)"] }
    ]
  }
];

export const getAllDepartments = () => {
  return ORG_HIERARCHY.flatMap(div => div.sections.flatMap(sec => sec.departments));
};

export const getHierarchyByDept = (deptName: string) => {
  for (const div of ORG_HIERARCHY) {
    for (const sec of div.sections) {
      if (sec.departments.includes(deptName)) return { division: div.division, section: sec.section };
    }
  }
  return { division: "Unknown", section: "Unknown" };
};


const generateEmployees = () => {
  const emps = [];
  for (let i = 1; i <= 150; i++) {
    let dept = "";
    if (i <= 40) dept = "Assembly (แผนกประกอบ)";
    else if (i <= 70) dept = "Packaging (แผนกบรรจุภัณฑ์)";
    else if (i <= 90) dept = "QA/QC (แผนกตรวจสอบ)";
    else if (i <= 110) dept = "Security (แผนกรปภ.)";
    else if (i <= 130) dept = "Human Resources (แผนกบุคคล)";
    else dept = "IT Support (แผนกไอที)";

    emps.push({
      id: i,
      code: `EMP-${String(i).padStart(3, '0')}`,
      name: `พนักงานคนที่ ${i}`,
      department: dept
    });
  }
  return emps;
};

export const MOCK_SHIFT_EMPLOYEES = generateEmployees();


export const MOCK_SHIFTS_DATA = [
  { id: 1, department: "Security (แผนกรปภ.)", name: "กะกลางวัน", startDate: "2026-04-01", endDate: "2026-04-15", startTime: "07:00", endTime: "19:00", employeeIds: [91, 92, 93, 94, 95] },
  { id: 2, department: "Security (แผนกรปภ.)", name: "กะกลางคืน", startDate: "2026-04-01", endDate: "2026-04-15", startTime: "19:00", endTime: "07:00", employeeIds: [96, 97, 98, 99, 100] },
];

export type Division = {
  id: number;
  code: string;
  name: string;
  company_id: number;
  headName: string;
  totalSections: number;
  headCount: number;
  status: "active" | "inactive";
};

export const MOCK_DIVISIONS: Division[] = [
  { id: 1, code: "DIV-ADM", name: "สายงานบริหาร (Administration)", company_id: 1, headName: "สมชาย รักดี", totalSections: 3, headCount: 45, status: "active" },
  { id: 2, code: "DIV-MKT", name: "สายงานการตลาดและการขาย (Marketing & Sales)", company_id: 1, headName: "มาลี สีสด", totalSections: 2, headCount: 30, status: "active" },
  { id: 3, code: "DIV-OPS", name: "สายงานปฏิบัติการ (Operations)", company_id: 1, headName: "วิชัย ใจสู้", totalSections: 5, headCount: 150, status: "active" },
  { id: 4, code: "DIV-IT", name: "สายงานเทคโนโลยีสารสนเทศ (IT)", company_id: 1, headName: "ณรงค์ โค้ดไว", totalSections: 2, headCount: 25, status: "active" },
  { id: 5, code: "DIV-HR", name: "สายงานทรัพยากรบุคคล (Human Resources)", company_id: 1, headName: "สมหญิง งานเนี๊ยบ", totalSections: 2, headCount: 10, status: "active" },
];