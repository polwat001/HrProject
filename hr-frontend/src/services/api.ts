import axios from 'axios';
import type {
  User, Company, Employee, Department, Position,
  Shift, AttendanceLog, OTRecord, LeaveRequest, LeaveType,
  Contract, ContractTemplate, ReportRequest, ReportResult,
  EmployeeTransferRequest, LeavePolicy, Holiday, Role,
  UserAssignment, DashboardStats, HeadcountByCompany, HeadcountByDepartment,
  ContractExpiringWidget, AttendanceStats, OTCostSummary,
  EmploymentHistory, LeaveQuota, Section, Payroll, Level, Division
} from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hr_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('hr_token');
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

api.interceptors.request.use(
  (config) => {

    // 🔥 ใส่ token ตายตัวตรงนี้เลย
    config.headers.Authorization =
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoxLCJpc19zdXBlcl9hZG1pbiI6MX0sImlhdCI6MTc3Mjc2NjM2NCwiZXhwIjoxNzcyODUyNzY0fQ.Zgc31pgsJl-2qNv4GkD9fpWNHusbXlOgs4S4ofv8Me8";

    return config;
  },
  (error) => Promise.reject(error)
);

// ============ AUTHENTICATION ============
export const authAPI = {
  login: async (username: string, password: string) => {
    const res = await api.post("/auth/login", {
      username,
      password,
    });

    const token = res.data.token; // 👈 backend ต้องส่ง token กลับมา
    localStorage.setItem("hr_token", token);

    return res;
  },
};

// ============ DASHBOARD ============
export const dashboardAPI = {
  getStats: (companyId?: number) =>
    api.get<DashboardStats>('/dashboard/stats', { params: { companyId } }),
  getHeadcountByCompany: () =>
    api.get<HeadcountByCompany[]>('/dashboard/headcount/companies'),
  getHeadcountByDepartment: (companyId: number) =>
    api.get<HeadcountByDepartment[]>(`/dashboard/headcount/departments/${companyId}`),
  getContractExpiring: (days: number = 30) =>
    api.get<ContractExpiringWidget[]>('/dashboard/contracts/expiring', { params: { days } }),
  getAttendanceStats: (date?: string) =>
    api.get<AttendanceStats>('/dashboard/attendance/stats', { params: { date } }),
  getOTCostSummary: (months: number = 6) =>
    api.get<OTCostSummary[]>('/dashboard/ot/cost-summary', { params: { months } }),
};

// ============ ORGANIZATION ============
export const organizationAPI = {
  // Companies
  getCompanies: () => api.get<Company[]>('/organization/companies'),
  getCompanyById: (id: number) => api.get<Company>(`/organization/companies/${id}`),
  createCompany: (data: Partial<Company>) => api.post('/organization/companies', data),
  updateCompany: (id: number, data: Partial<Company>) =>
    api.put(`/organization/companies/${id}`, data),
  deleteCompany: (id: number) => api.delete(`/organization/companies/${id}`),

  // Departments
  getDepartments: (companyId?: number) =>
    api.get<Department[]>('/organization/departments', { params: { companyId } }),
  getDepartmentById: (id: number) => api.get<Department>(`/organization/departments/${id}`),
  createDepartment: (data: Partial<Department>) =>
    api.post('/organization/departments', data),
  updateDepartment: (id: number, data: Partial<Department>) =>
    api.put(`/organization/departments/${id}`, data),
  deleteDepartment: (id: number) => api.delete(`/organization/departments/${id}`),

  // Positions
  getPositions: () => api.get<Position[]>('/organization/positions'),
  getPositionById: (id: number) => api.get<Position>(`/organization/positions/${id}`),
  createPosition: (data: Partial<Position>) => api.post('/organization/positions', data),
  updatePosition: (id: number, data: Partial<Position>) =>
    api.put(`/organization/positions/${id}`, data),
  deletePosition: (id: number) => api.delete(`/organization/positions/${id}`),

  //Levels
getLevels: () => api.get<Level[]>('/organization/levels'),
  getLevelById: (id: number) => api.get<Level>(`/organization/levels/${id}`),
  createLevel: (data: Partial<Level>) => api.post('/organization/levels', data),
  updateLevel: (id: number, data: Partial<Level>) => api.put(`/organization/levels/${id}`, data),
  deleteLevel: (id: number) => api.delete(`/organization/levels/${id}`),

 // division
  
  getDivisions: (companyId?: number) => 
    api.get<Division[]>('/organization/divisions', { params: { companyId } }),
  getDivisionById: (id: number) => api.get<Division>(`/organization/divisions/${id}`),
  createDivision: (data: Partial<Division>) => api.post('/organization/divisions', data),
  updateDivision: (id: number, data: Partial<Division>) => api.put(`/organization/divisions/${id}`, data),
  deleteDivision: (id: number) => api.delete(`/organization/divisions/${id}`),

  // section
  getSections: (divisionId?: number) => 
    api.get<Section[]>('/organization/sections', { params: { divisionId } }),
  getSectionById: (id: number) => api.get<Section>(`/organization/sections/${id}`),
  createSection: (data: Partial<Section>) => api.post('/organization/sections', data),
  updateSection: (id: number, data: Partial<Section>) => api.put(`/organization/sections/${id}`, data),
  deleteSection: (id: number) => api.delete(`/organization/sections/${id}`),
};

// ============ EMPLOYEES ============
export const employeeAPI = {
  getEmployees: (filters?: {
    companyId?: number;
    departmentId?: number;
    positionId?: number;
    status?: string;
  }) => api.get<Employee[]>('/employees', { params: filters }),
  
   getEmployees: () => api.get("/employees"),
  createEmployee: (data) => api.post("/employees", data),
  
  updateEmployee: (id: number, data: Partial<Employee>) =>
    api.put(`/employees/${id}`, data),
  
  deleteEmployee: (id: number) => api.delete(`/employees/${id}`),

  // Employment History
  getEmploymentHistory: (employeeId: number) =>
    api.get<EmploymentHistory[]>(`/employees/${employeeId}/history`),
  
  transferEmployee: (employeeId: number, data: EmployeeTransferRequest) =>
    api.post(`/employees/${employeeId}/transfer`, data),

  // Documents
  uploadDocument: (employeeId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/employees/${employeeId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ TIME & ATTENDANCE ============

export const attendanceAPI = {
  // Shifts
  getShifts: (companyId?: number) =>
    api.get<Shift[]>('/attendance/shifts', { params: { companyId } }),
  
  createShift: (data: Partial<Shift>) => api.post('/attendance/shifts', data),
  
  updateShift: (id: number, data: Partial<Shift>) =>
    api.put(`/attendance/shifts/${id}`, data),
  
  assignShift: (employeeId: number, shiftId: number, data: any) =>
    api.post(`/attendance/assignments`, { employeeId, shiftId, ...data }),

  // Attendance Logs

  getAttendanceLogs: (filters?: {
    employeeId?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get<AttendanceLog[]>('/attendance/logs', { params: filters }),
  
  importAttendance: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/attendance/logs/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // OT Management
  getOTRecords: (filters?: {
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => api.get<OTRecord[]>('/attendance/ot', { params: filters }),
  
  approveOT: (otId: number, hours?: number) =>
    api.post(`/attendance/ot/${otId}/approve`, { hours }),
  
  rejectOT: (otId: number, reason?: string) =>
    api.post(`/attendance/ot/${otId}/reject`, { reason }),
};


// ============ LEAVE ============
export const leaveAPI = {
  // Leave Types
  getLeaveTypes: () => api.get<LeaveType[]>('/leaves/types'),
  
  createLeaveType: (data: Partial<LeaveType>) => api.post('/leaves/types', data),
  
  updateLeaveType: (id: number, data: Partial<LeaveType>) =>
    api.put(`/leaves/types/${id}`, data),

  // Leave Policies
  getLeavePolicy: (companyId: number, year: number) =>
    api.get<LeavePolicy[]>('/leaves/policies', { params: { companyId, year } }),
  
  createLeavePolicy: (data: Partial<LeavePolicy>) => api.post('/leaves/policies', data),
  
  updateLeavePolicy: (id: number, data: Partial<LeavePolicy>) =>
    api.put(`/leaves/policies/${id}`, data),

  // Leave Requests
  getLeaveRequests: (filters?: {
    employeeId?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get<LeaveRequest[]>('/leaves/requests', { params: filters }),
  
// ใน services/api.ts
  createLeaveRequest: (data: FormData) =>
    api.post('/leaves/requests', data, {
      headers: {
        // 🚨 ทริคลับ: ตั้งเป็น undefined เพื่อให้ Browser จัดการ Multipart Boundary เอง
        'Content-Type': undefined 
      },
    }),

  updateLeaveStatus: (id: number, status: string, reject_reason?: string) => 
    api.put(`/leaves/${id}/status`, { STATUS: status, reject_reason }),

  // หมายเหตุ: ถ้ายังอยากเก็บปุ่มแยกตามเดิม ให้แก้ข้างในมาเรียกใช้ updateLeaveStatus แทน
  approveLeaveRequest: (requestId: number) =>
    api.put(`/leaves/${requestId}/status`, { STATUS: 'approved' }),
  
  rejectLeaveRequest: (requestId: number, reason?: string) =>
    api.put(`/leaves/${requestId}/status`, { STATUS: 'rejected' }),


  // Leave Quota
  getLeaveQuota: (employeeId: number, year?: number) =>
    api.get<LeaveQuota[]>(`/leaves/quotas/${employeeId}`, { params: { year } }),

  // Holiday Management
  getHolidays: (companyId?: number, year?: number) =>
    api.get<Holiday[]>('/leaves/holidays', { params: { companyId, year } }),
  
  createHoliday: (data: Partial<Holiday>) => api.post('/leaves/holidays', data),
  
  updateHoliday: (id: number, data: Partial<Holiday>) =>
    api.put(`/leaves/holidays/${id}`, data),

  // Leave Calendar
  getLeaveCalendar: (filters?: {
    companyId?: number;
    departmentId?: number;
    month?: string;
  }) => api.get<any[]>('/leaves/calendar', { params: filters }),
};

// ============ CONTRACTS ============

export const contractAPI = {
  // GET ทั้งหมด / Filter / หรือดึงตัวเดียว
  getContracts: (params?: {
    id?: number;
    employeeId?: number;
    status?: string;
    companyId?: number;
  }) => api.get<Contract[]>('/contracts', { params }),

  // CREATE
  createContract: (data: Partial<Contract>) =>
    api.post('/contracts', data),

  // UPDATE
  updateContract: (data: {
    id: number;
    action?: 'update' | 'renew';
    newEndDate?: string;
  } & Partial<Contract>) =>
    api.put('/contracts', data),

  // Template / generate ถ้าจำเป็นจริง ๆ
  templateAction: (data: {
    action: 'getTemplates' | 'createTemplate' | 'generate';
    templateId?: number;
    employeeId?: number;
    variables?: Record<string, string>;
  }) => api.post('/contracts', data),


  // Contract Templates
  getTemplates: () => api.get<ContractTemplate[]>('/contracts/templates'),
  
  getTemplateById: (id: number) => api.get<ContractTemplate>(`/contracts/templates/${id}`),
  
  createTemplate: (data: Partial<ContractTemplate>) =>
    api.post('/contracts/templates', data),
  
  updateTemplate: (id: number, data: Partial<ContractTemplate>) =>
    api.put(`/contracts/templates/${id}`, data),

  generateFromTemplate: (templateId: number, employeeId: number, variables: Record<string, string>) =>
    api.post(`/contracts/templates/${templateId}/generate`, { employeeId, variables }),
};
// ============ PAYROLL ============

export const payrollAPI = {
  getAvailableMonths: () => 
    api.get("/payroll/filters/months"),
  getPayrolls: (params: { month: number; year: number; employee_id?: number }) =>
    api.get("/payroll", { params }),

  getPayrollById: (id: number) =>
    api.get(`/payroll/${id}`),

  createPayroll: (data: {
    employee_id: number;
    company_id: number;
    base_salary: number;
    position_allowance?: number;
    ot_amount?: number;
    other_income?: number;
    sso_amount?: number;
    tax_amount?: number;
    other_deduction?: number;
    payroll_month: number;
    payroll_year: number;
  }) =>
    api.post("/payroll", data),

  updatePayroll: (id: number, data: any) =>
    api.put(`/payroll/${id}`, data),

  deletePayroll: (id: number) =>
    api.delete(`/payroll/${id}`),

  updateStatus: (id: number, status: 'calculated' | 'approved' | 'paid') =>
    api.put(`/payroll/${id}/status`, { status }),
};
// ============ REPORTS ============
export const reportsAPI = {
  generateReport: (request: ReportRequest) =>
    api.post<ReportResult>('/reports/generate', request),
  
  getReportList: () =>
    api.get<Array<{ id: string; name: string; description: string }>>('/reports/list'),
};

// ============ USERS & PERMISSIONS ============
export const userAPI = {
  // Users
  getUsers: (companyId?: number | null) => 
    api.get('/users', { params: { companyId } }),
  
  getUserById: (id: number) => api.get<User>(`/users/${id}`),
  
  updateUser: (id: number, data: Partial<User>) =>
    api.put(`/users/${id}`, data),

  // Roles
  getRoles: (companyId?: number | null) => 
    api.get('/users/roles', { params: { companyId } }),
  
  createRole: (data: Partial<Role>) => api.post('/users/roles', data),
  
 updateRole: (id: number, data: Partial<Role>) =>
    api.put(`/users/roles/${id}`, data),
 
  // User Assignments (Permissions)
  getUserAssignments: (userId: number) =>
    api.get<UserAssignment[]>(`/users/${userId}/assignments`),
  
  addUserAssignment: (userId: number, data: Partial<UserAssignment>) =>
    api.post(`/users/${userId}/assignments`, data),
  
  updateUserAssignment: (userId: number, assignmentId: number, data: Partial<UserAssignment>) =>
    api.put(`/users/${userId}/assignments/${assignmentId}`, data),
  
  removeUserAssignment: (userId: number, assignmentId: number) =>
    api.delete(`/users/${userId}/assignments/${assignmentId}`),

  // User Permissions
  getUserPermissions: (userId: number, scope?: { companyId?: number }) =>
    api.get<string[]>(`/users/${userId}/permissions`, { params: scope }),
};

export default api;