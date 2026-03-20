// ==========================================
// 📦 MOCK DATA: Department (ข้อมูลแผนก)
// ==========================================

export type Department = {
  id: number;
  code: string;
  name: string;
  sectionName: string;
  divisionName: string;
  headName: string;
  headCount: number;
  status: "active" | "inactive";
};

export const INITIAL_MOCK_DEPARTMENTS: Department[] = [
  { id: 1, code: "DPT-IT-01", name: "แผนกพัฒนาซอฟต์แวร์", sectionName: "ส่วนงานเทคโนโลยี (IT)", divisionName: "ฝ่ายปฏิบัติการ", headName: "สมชาย มั่นคง", headCount: 12, status: "active" },
  { id: 2, code: "DPT-IT-02", name: "แผนกโครงสร้างพื้นฐาน", sectionName: "ส่วนงานเทคโนโลยี (IT)", divisionName: "ฝ่ายปฏิบัติการ", headName: "มานี ทำดี", headCount: 8, status: "active" },
  { id: 3, code: "DPT-HR-01", name: "แผนกสรรหาบุคลากร", sectionName: "ส่วนงานทรัพยากรบุคคล (HR)", divisionName: "ฝ่ายบริหาร", headName: "สมหญิง ใจดี", headCount: 4, status: "active" },
  { id: 4, code: "DPT-HR-02", name: "แผนกเงินเดือนและสวัสดิการ", sectionName: "ส่วนงานทรัพยากรบุคคล (HR)", divisionName: "ฝ่ายบริหาร", headName: "วิชัย เก่งโค้ด", headCount: 3, status: "active" },
  { id: 5, code: "DPT-ACC-01", name: "แผนกบัญชีทั่วไป", sectionName: "ส่วนงานบัญชีและการเงิน", divisionName: "ฝ่ายบริหาร", headName: "ปิติ รักเรียน", headCount: 5, status: "inactive" },
];

export const MOCK_SECTIONS = [
  { id: "SEC-01", name: "ส่วนงานเทคโนโลยี (IT)", divName: "ฝ่ายปฏิบัติการ" },
  { id: "SEC-02", name: "ส่วนงานทรัพยากรบุคคล (HR)", divName: "ฝ่ายบริหาร" },
  { id: "SEC-03", name: "ส่วนงานบัญชีและการเงิน", divName: "ฝ่ายบริหาร" },
];