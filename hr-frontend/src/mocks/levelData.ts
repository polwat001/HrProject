export interface LevelMock {
  id: number;
  level_code: string;
  level_title: string;
  base_salary: string;
}

export const INITIAL_MOCK_LEVELS: LevelMock[] = [
  { id: 1, level_code: "M1", level_title: "Manager 1", base_salary: "60,000 - 100,000" },
  { id: 2, level_code: "M2", level_title: "Manager 2", base_salary: "50,000 - 80,000" },
  { id: 3, level_code: "S1", level_title: "Senior Staff", base_salary: "35,000 - 50,000" },
  { id: 4, level_code: "S2", level_title: "Staff", base_salary: "20,000 - 35,000" },
  { id: 5, level_code: "O1", level_title: "Operator", base_salary: "15,000 - 20,000" },
];

export const INITIAL_MOCK_POSITIONS = [
  { id: 1, title_th: "ผู้จัดการแผนกไอที", level_id: 1 },
  { id: 2, title_th: "ผู้จัดการฝ่ายบัญชี", level_id: 1 },
  { id: 3, title_th: "หัวหน้าฝ่ายบุคคล", level_id: 2 },
  { id: 4, title_th: "วิศวกรอาวุโส", level_id: 3 },
  { id: 5, title_th: "โปรแกรมเมอร์อาวุโส", level_id: 3 },
  { id: 6, title_th: "พนักงานบัญชี", level_id: 4 },
  { id: 7, title_th: "เจ้าหน้าที่ธุรการ", level_id: 4 },
  { id: 8, title_th: "พนักงานควบคุมเครื่องจักร", level_id: 5 },
];