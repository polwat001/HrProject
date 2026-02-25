import { create } from 'zustand';
import type {
  User, Company, UserAssignment, Permission, LeaveQuota
} from '@/types';

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

  // Check permissions
  hasPermission: (permission: Permission) => boolean;
  hasPermissionInCompany: (permission: Permission, companyId: number) => boolean;

  // Leave quotas
  leaveQuotas: LeaveQuota[];
  setLeaveQuotas: (quotas: LeaveQuota[]) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Logout
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth State
  user: null,
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
    
    // Check if user has this permission
    if (!permissions.includes(permission)) return false;

    // Check if user has access to this company
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

  // Logout
  logout: () => set({
    user: null,
    token: null,
    availableCompanies: [],
    currentCompanyId: null,
    userAssignments: [],
    permissions: [],
    leaveQuotas: [],
  }),
}));