export type Section = {
  id: number;
  code: string;
  name: string;
  divisionId: number;
  divisionName: string;
  managerName: string;
  totalDepartments: number;
  headCount: number;
  status: "active" | "inactive";
};

export const MOCK_DIVISIONS = [
  { id: 1, name: "สายงานบริหาร (Administration)" },
  { id: 2, name: "สายงานการตลาดและการขาย (Marketing & Sales)" },
  { id: 3, name: "สายงานปฏิบัติการ (Operations)" },
  { id: 4, name: "สายงานเทคโนโลยีสารสนเทศ (IT)" },
];

export const INITIAL_MOCK_SECTIONS: Section[] = [
  { id: 1, code: "SEC-ACC", name: "ส่วนงานบัญชี", divisionId: 1, divisionName: "สายงานบริหาร (Administration)", managerName: "สมฤดี ดีเสมอ", totalDepartments: 2, headCount: 15, status: "active" },
  { id: 2, code: "SEC-PUR", name: "ส่วนงานจัดซื้อ", divisionId: 1, divisionName: "สายงานบริหาร (Administration)", managerName: "ประเสริฐ เลิศล้ำ", totalDepartments: 1, headCount: 5, status: "active" },
  { id: 3, code: "SEC-DOM", name: "ส่วนงานการขายในประเทศ", divisionId: 2, divisionName: "สายงานการตลาดและการขาย (Marketing & Sales)", managerName: "กฤษณา พาเพลิน", totalDepartments: 3, headCount: 20, status: "active" },
  { id: 4, code: "SEC-INT", name: "ส่วนงานการขายต่างประเทศ", divisionId: 2, divisionName: "สายงานการตลาดและการขาย (Marketing & Sales)", managerName: "David Smith", totalDepartments: 2, headCount: 12, status: "active" },
  { id: 5, code: "SEC-DIG", name: "ส่วนงานการตลาดดิจิทัล", divisionId: 2, divisionName: "สายงานการตลาดและการขาย (Marketing & Sales)", managerName: "วิภาดา น่ารัก", totalDepartments: 2, headCount: 8, status: "active" },
  { id: 6, code: "SEC-PRD", name: "ส่วนงานผลิต", divisionId: 3, divisionName: "สายงานปฏิบัติการ (Operations)", managerName: "สมชาย ชาตรี", totalDepartments: 4, headCount: 120, status: "active" },
  { id: 7, code: "SEC-WHS", name: "ส่วนงานคลังสินค้า", divisionId: 3, divisionName: "สายงานปฏิบัติการ (Operations)", managerName: "วินัย ใจเย็น", totalDepartments: 2, headCount: 35, status: "active" },
  { id: 8, code: "SEC-SUP", name: "ส่วนงานซัพพอร์ต", divisionId: 4, divisionName: "สายงานเทคโนโลยีสารสนเทศ (IT)", managerName: "เอกพล คนเก่ง", totalDepartments: 1, headCount: 10, status: "active" },
];