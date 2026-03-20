export interface PositionMock {
  id: number;
  code: string;
  title_th: string;
  level_id: number;
  department_id: number;
  current_headcount: number;
  budget_headcount: number;
  isActive: boolean;
}

export const INITIAL_MOCK_LEVELS = [
  { id: 1, level_code: "M1", level_title: "Manager 1" },
  { id: 2, level_code: "M2", level_title: "Manager 2" },
  { id: 3, level_code: "S1", level_title: "Senior Staff" },
  { id: 4, level_code: "S2", level_title: "Staff" },
  { id: 5, level_code: "O1", level_title: "Operator" },
];

export const INITIAL_MOCK_DEPARTMENTS = [
  { id: 1, name: "แผนกพัฒนาซอฟต์แวร์" },
  { id: 2, name: "แผนกสรรหาบุคลากร" },
  { id: 3, name: "แผนกบัญชีทั่วไป" },
];

export const INITIAL_MOCK_POSITIONS: PositionMock[] = [
  { id: 1, code: "POS-IT-01", title_th: "ผู้จัดการแผนกไอที", level_id: 1, department_id: 1, current_headcount: 1, budget_headcount: 1, isActive: true },
  { id: 2, code: "POS-HR-01", title_th: "หัวหน้าฝ่ายบุคคล", level_id: 2, department_id: 2, current_headcount: 1, budget_headcount: 1, isActive: true },
  { id: 3, code: "POS-IT-02", title_th: "โปรแกรมเมอร์อาวุโส", level_id: 3, department_id: 1, current_headcount: 3, budget_headcount: 5, isActive: true },
  { id: 4, code: "POS-ACC-01", title_th: "พนักงานบัญชี", level_id: 4, department_id: 3, current_headcount: 2, budget_headcount: 2, isActive: true },
  { id: 5, code: "POS-IT-03", title_th: "พนักงานสนับสนุน (IT Support)", level_id: 4, department_id: 1, current_headcount: 0, budget_headcount: 2, isActive: false },
];