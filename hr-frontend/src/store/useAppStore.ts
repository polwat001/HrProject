import { create } from 'zustand';
import type { User, Company, UserAssignment, Permission, LeaveQuota } from '@/types';

// ✅ นำเข้า Mock Data ของคุณ (เช็ค Path ให้ตรงกับโฟลเดอร์ของคุณนะครับ)
// สมมติว่าไฟล์ Mock ของคุณอยู่ในโฟลเดอร์ @/mocks/...
import { MOCK_DIVISIONS } from '@/mocks/shiftData'; 
import { INITIAL_MOCK_SECTIONS as MOCK_SECTIONS, Section } from '@/mocks/sectionData';
import { INITIAL_MOCK_DEPARTMENTS as MOCK_DEPARTMENTS, Department } from '@/mocks/departmentData';
import { INITIAL_MOCK_LEVELS as MOCK_LEVELS, LevelMock } from '@/mocks/levelData';
import { INITIAL_MOCK_POSITIONS as MOCK_POSITIONS, PositionMock } from '@/mocks/positionData';

interface AppState {
  // Auth
  user: User | null;
  setUser: (userData: User | null) => void;
  token: string | null;
  setToken: (token: string) => void;

  // Companies
  availableCompanies: Company[];
  setAvailableCompanies: (companies: Company[]) => void;
  currentCompanyId: number | null;
  setCurrentCompanyId: (companyId: number | null) => void;

  // Permissions
  userAssignments: UserAssignment[];
  setUserAssignments: (assignments: UserAssignment[]) => void;
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;

  hasPermission: (permission: Permission) => boolean;
  hasPermissionInCompany: (permission: Permission, companyId: number) => boolean;

  // Leave quotas
  leaveQuotas: LeaveQuota[];
  setLeaveQuotas: (quotas: LeaveQuota[]) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Language
  language: 'th' | 'en';
  setLanguage: (lang: 'th' | 'en') => void;

  // ==========================================
  // 🟢 State สำหรับโครงสร้างองค์กร (Organization)
  // ==========================================
  divisions: any[];
  sections: Section[];
  departments: Department[];
  levels: LevelMock[];
  positions: PositionMock[];

  // ==========================================
  // 🟢 State สำหรับกะทำงาน (Shift Management)
  // ==========================================
  shifts: any[];
  addShifts: (newShifts: any[]) => void;
  deleteShift: (id: number) => void;

  // Logout
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth State
 user: {
    id: 999,
    username: "emp_test",
    firstName: "สมชาย",
    lastName: "ใจดี",
    role_id: 4, // 🔴 เลข 4 คือสิทธิ์พนักงาน
    is_super_admin: false,
    department_name: "แผนกพัฒนาซอฟต์แวร์" // ให้ตรงกับ mock department ที่มี
  } as any, // ใส่ as any ไว้ก่อนกัน Type error (ถ้ามีการบังคับฟิลด์อื่นๆใน Type User)
  
  setUser: (userData) => set({ user: userData }),
  token: null,
  setToken: (token) => set({ token }),

  // Company State
  availableCompanies: [],
  setAvailableCompanies: (companies) => set({ availableCompanies: companies }),
  currentCompanyId: null,
  setCurrentCompanyId: (companyId) => set({ currentCompanyId: companyId }),

  // Permissions State
  userAssignments: [],
  setUserAssignments: (assignments) => set({ userAssignments: assignments }),
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),

  // Permission helpers
  hasPermission: (permission: Permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  hasPermissionInCompany: (permission: Permission, companyId: number) => {
    const { userAssignments, permissions } = get();
    if (!permissions.includes(permission)) return false;
    const hasCompanyAccess = userAssignments.some(
      (assignment) =>
        assignment.scope === 'all' ||
        (assignment.scope === 'company' && assignment.scopeValue === companyId)
    );
    return hasCompanyAccess;
  },

  // Leave Quotas
  leaveQuotas: [],
  setLeaveQuotas: (quotas) => set({ leaveQuotas: quotas }),

  // UI State
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Language
  language: 'th',
  setLanguage: (lang) => set({ language: lang }),

  // ==========================================
  // 🟢 กำหนดค่าตั้งต้นให้ Organization (จาก Mock Data)
  // ==========================================
  divisions: MOCK_DIVISIONS || [],
  sections: MOCK_SECTIONS || [],
  departments: MOCK_DEPARTMENTS || [],
  levels: MOCK_LEVELS || [],
  positions: MOCK_POSITIONS || [],
  

  // ==========================================
  // 🟢 กำหนดค่าตั้งต้นให้กะการทำงาน (Shifts)
  // ==========================================
  // ใส่ข้อมูลกะตัวอย่างเริ่มต้น เพื่อให้เปิดมาแล้วมีข้อมูลเลย
  shifts: [
    { 
      id: 1, 
      department: "แผนกพัฒนาซอฟต์แวร์", 
      name: "กะปกติ", 
      startDate: "2026-04-01", 
      endDate: "2026-04-30", 
      startTime: "09:00", 
      endTime: "18:00", 
      employeeIds: [1, 2, 3] 
    }
  ],
  addShifts: (newShifts) => set((state) => ({ shifts: [...newShifts, ...state.shifts] })),
  deleteShift: (id) => set((state) => ({ shifts: state.shifts.filter(s => s.id !== id) })),

  // Logout
  logout: () => set((state) => ({
    user: null,
    token: null,
    availableCompanies: [],
    currentCompanyId: null,
    userAssignments: [],
    permissions: [],
    leaveQuotas: [],
    shifts: []
  })),
}));

