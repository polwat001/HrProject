import { create } from 'zustand';
import type { User, Company, UserAssignment, Permission, LeaveQuota } from '@/types';
import { MOCK_DIVISIONS, Division } from '@/mocks/shiftData'; 
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


  leaveQuotas: LeaveQuota[];
  setLeaveQuotas: (quotas: LeaveQuota[]) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  language: 'th' | 'en';
  setLanguage: (lang: 'th' | 'en') => void;


  divisions: Division[];
  sections: Section[];
  departments: Department[];
  levels: LevelMock[];
  positions: PositionMock[];

 
  shifts: any[];
  addShifts: (newShifts: any[]) => void;
  deleteShift: (id: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  token: null,
  setToken: (token) => set({ token }),


  availableCompanies: [],
  setAvailableCompanies: (companies) => set({ availableCompanies: companies }),
  currentCompanyId: null,
  setCurrentCompanyId: (companyId) => set({ currentCompanyId: companyId }),

  userAssignments: [],
  setUserAssignments: (assignments) => set({ userAssignments: assignments }),
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),

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


  leaveQuotas: [],
  setLeaveQuotas: (quotas) => set({ leaveQuotas: quotas }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  language: 'th',
  setLanguage: (lang) => set({ language: lang }),


  divisions: MOCK_DIVISIONS || [],
  sections: MOCK_SECTIONS || [],
  departments: MOCK_DEPARTMENTS || [],
  levels: MOCK_LEVELS || [],
  positions: MOCK_POSITIONS || [],
  

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

