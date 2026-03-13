// ============ AUTHENTICATION & SECURITY ============
export interface User {
  id: number;
  username: string;
  email: string;
  is_super_admin: boolean;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export type Permission = 
  | 'view_dashboard'
  | 'view_employees'
  | 'edit_employees'
  | 'view_attendance'
  | 'approve_ot'
  | 'view_leaves'
  | 'approve_leaves'
  | 'view_contracts'
  | 'edit_contracts'
  | 'view_reports'
  | 'view_organization'
  | 'edit_organization'
  | 'manage_users'
  | 'manage_roles';

export interface UserAssignment {
  id: number;
  userId: number;
  roleId: number;
  scope: AssignmentScope; // 'all' | 'company' | 'department'
  scopeValue?: number; // company_id or department_id
}

export type AssignmentScope = 'all' | 'company' | 'department';

// ============ ORGANIZATION ============
export interface Company {
  company_id: number;
  name_th: string;
  name_en?: string;
  logo?: string;
  parentId?: number; // For hierarchical structure
  level: 'holding' | 'company' | 'branch';
}

export interface Department {
  id: number;
  name: string;
  companyId: number;
  parentId?: number; // For nested departments
  costCenterCode?: string;
  headCount: number;
}

export interface DepartmentAPI {
  id: number;
  company_id: number;
  NAME: string;
  parent_dept_id: number | null;
  cost_center: string | null;
}

export interface Position {
  id: number;
  code: string;
  name: string;
  level?: string;
  companyIds: number[];     // เก็บไว้เหมือนเดิม
  companyId?: number;       // เพิ่ม optional
  companyName?: string;  // Positions can be used in multiple companies
  isActive: boolean;
}

export interface Level {
  id: number;
  level_code: string;
  level_title: string;
}

export interface Division {
  id: number;
  name: string;
  company_id: number;
}

export interface Section {
  id: number;
  name: string;
  division_id: number;
}
export interface Section {
  id: number;
  name: string;
  departmentId: number;
}

// ============ EMPLOYEE ============
export interface Employee {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  companyId: number;
  departmentId: number;
  positionId: number;
  joinDate: string;
  status: 'active' | 'probation' | 'resigned' | 'on_leave';
  salary?: number;
  contractId?: number;
  reportingManagerId?: number;
}

export interface EmploymentHistory {
  id: number;
  employeeId: number;
  fromDate: string;
  toDate?: string;
  companyId: number;
  departmentId: number;
  positionId: number;
  changeType: 'hire' | 'transfer' | 'promote' | 'demote';
  reason?: string;
}

export interface EmployeeTransferRequest {
  employeeId: number;
  targetCompanyId: number;
  targetDepartmentId: number;
  targetPositionId: number;
  effectiveDate: string;
  reason?: string;
}

// ============ TIME & ATTENDANCE ============
export interface Shift {
  id: number;
  name: string;
  companyId: number;
  startTime: string; // HH:mm format
  endTime: string;
  breakDuration?: number; // minutes
  lateThreshold?: number; // minutes
  description?: string;
}

export interface EmployeeShiftAssignment {
  id: number;
  employeeId: number;
  shiftId: number;
  startDate: string;
  endDate?: string;
  assignmentType: 'individual' | 'department'; // If department, departmentId is used
  departmentId?: number;
}

export interface AttendanceLog {
  id: number;
  employeeId: number;
  date: string;
  timeIn?: string; // HH:mm:ss format
  timeOut?: string;
  status: 'present' | 'absent' | 'late' | 'halfday';
  notes?: string;
  recordedAt: string;
}

export interface OTRecord {
  id: number;
  employeeId: number;
  date: string;
  hours: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  remarks?: string;
  rate?: number; // Hourly OT rate
}

// ============ LEAVE ============
export interface LeaveType {
  id: number;
  name: string; // 'Annual', 'Sick', 'Unpaid', etc.
  defaultDays: number;
  carryOverDays?: number;
  companyIds: number[]; // Which companies use this leave type
}

export interface LeavePolicy {
  id: number;
  companyId: number;
  leaveTypeId: number;
  quotaDays: number;
  year: number;
  maxCarryOver?: number;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approveDate?: string;
  createdAt: string;
}

export interface LeaveQuota {
  employeeId: number;
  leaveTypeId: number;
  year: number;
  totalQuota: number;
  used: number;
  remaining: number;
}

export interface Holiday {
  id: number;
  date: string;
  name: string;
  companyIds: number[]; // Multi-company support
  type: 'national' | 'company' | 'special';
}

// ============ CONTRACTS ============
export interface Contract {
  id: number;
  employeeId: number;
  templateId?: number;
  startDate: string;
  endDate: string;
  contractType: 'permanent' | 'temporary' | 'probation';
  salary: number;
  terms?: string;
  documentUrl?: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'renewed';
  createdAt: string;
  lastModified: string;
}

export interface ContractTemplate {
  id: number;
  name: string;
  companyId: number;
  content: string; // Rich text content
  variables: string[]; // e.g., [{employee_name}, {start_date}, {salary}]
  logoUrl?: string;
  createdAt: string;
}

// ============ DASHBOARD ============
export interface DashboardStats {
  totalHeadcount: number;
  activeEmployees: number;
  newJoiners: number;
  resignedThisMonth: number;
}

export interface HeadcountByCompany {
  companyId: number;
  companyName: string;
  count: number;
}

export interface HeadcountByDepartment {
  departmentId: number;
  departmentName: string;
  count: number;
}

export interface ContractExpiringWidget {
  contractId: number;
  employeeName: string;
  companyName: string;
  endDate: string;
  daysRemaining: number;
}

export interface AttendanceStats {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export interface OTCostSummary {
  month: string;
  totalCost: number;
  totalHours: number;
}

// ============ REPORTS ============
export type ReportType = 
  | 'employee_master'
  | 'attendance_summary'
  | 'ot_report'
  | 'contract_expiry'
  | 'payroll_summary';

export type ReportScope = 'current_company' | 'all_companies';

export type ReportFormat = 'excel' | 'pdf';

export interface ReportRequest {
  reportType: ReportType;
  scope: ReportScope;
  format: ReportFormat;
  filters?: Record<string, any>;
  startDate?: string;
  endDate?: string;
}

export interface ReportResult {
  reportType: ReportType;
  downloadUrl: string;
  generatedAt: string;
  fileName: string;
}

// ============ PAYROLL ============
export interface Payroll {

  id: number

  employee_id: number

  base_salary: number

  position_allowance: number

  ot_amount: number

  total_income: number

  total_deduction: number

  net_pay: number

  payroll_month: number

  payroll_year: number

  status: 'draft' | 'approved' | 'paid'

  created_at: string

  employee_code?: string
  first_name?: string
  last_name?: string

}