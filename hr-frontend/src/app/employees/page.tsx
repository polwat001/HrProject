'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { employeeAPI, organizationAPI } from '@/services/api';
import {
  Plus,
  Search,
  ChevronRight,
  Loader,
  Download,
  Filter,
  X,
  Briefcase,
  MapPin,
  Mail,
} from 'lucide-react';
import type { Employee, Company, Department } from '@/types';

export default function EmployeesPage() {
  const { currentCompanyId } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(currentCompanyId);
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
useEffect(() => {
  const delay = setTimeout(() => {
    loadData();
  }, 400); // debounce search

  return () => clearTimeout(delay);
}, [filterCompanyId, filterDepartmentId, searchTerm]);

useEffect(() => {
  const autoLogin = async () => {
    try {
      const res = await authAPI.login("superadmin", "123456");
      console.log("Login success", res.data);
      loadData();
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  autoLogin();
}, []);

const loadData = async () => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const filters = {
      companyId: filterCompanyId ?? undefined,
      departmentId: filterDepartmentId ?? undefined,
      search: searchTerm || undefined,
    };

    const [empRes, coRes, depRes] = await Promise.all([
      employeeAPI.getEmployees(filters),
      organizationAPI.getCompanies(),
      organizationAPI.getDepartments(filterCompanyId ?? undefined),
    ]);

    // 🔥 MAP DATA จาก API → ให้ตรงกับ UI
    const mappedEmployees = empRes.data.map((emp: any) => ({
      id: emp.id,
      code: emp.employee_code,
      firstName: emp.firstname_th,
      lastName: emp.lastname_th,
      nickname: emp.nickname,
      companyId: emp.current_company_id,
      status: emp.STATUS?.toLowerCase(),
      email: emp.email ?? "-", // ถ้าไม่มี field นี้
      positionId: emp.position_id ?? "-", // ถ้า backend ยังไม่มี
      departmentId: emp.department_id ?? null,
      joinDate: emp.join_date ?? new Date().toISOString(),
      avatar: emp.avatar_url,
    }));

    setEmployees(mappedEmployees);
    setCompanies(coRes.data);
    setDepartments(depRes.data);

  } catch (err) {
    console.error("Error loading employee data:", err);
  } finally {
    setLoading(false);
  }
};

  const filteredEmployees = employees.filter((emp) => {
  const firstName = emp.firstName ?? "";
  const lastName = emp.lastName ?? "";
  const code = emp.code ?? "";
  const email = emp.email ?? "";
  console.log("Filtering employee:", filteredEmployees);

  const matchSearch =
    firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.toLowerCase().includes(searchTerm.toLowerCase());

  const matchCompany = !filterCompanyId || emp.companyId === filterCompanyId;
  const matchDepartment = !filterDepartmentId || emp.departmentId === filterDepartmentId;

  return matchSearch && matchCompany && matchDepartment;
});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">👥 Employee Directory</h1>
          <p className="text-slate-600 mt-1">Manage and view all employees</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium">
            <Download size={20} />
            Export
          </button>
          <Link
            href="/employees/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Plus size={20} />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700 font-medium"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
              <select
                value={filterCompanyId ?? ''}
                onChange={(e) => setFilterCompanyId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.name_th}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
              <select
                value={filterDepartmentId ?? ''}
                onChange={(e) => setFilterDepartmentId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => {
                  setFilterCompanyId(currentCompanyId);
                  setFilterDepartmentId(null);
                  setSearchTerm('');
                }}
                className="flex-1 px-4 py-2.5 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-600 font-medium">No employees found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Position</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Join Date</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md">
                          {emp.firstName.charAt(0)}
                          {emp.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {emp.firstName} {emp.lastName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                            <Mail size={12} />
                            {emp.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Briefcase size={16} className="text-slate-400" />
                        <span className="text-sm">{emp.positionId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        <MapPin size={14} />
                        {emp.companyId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          emp.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : emp.status === 'probation'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {emp.status === 'active'
                          ? '✓ Active'
                          : emp.status === 'probation'
                          ? '⏳ Probation'
                          : '✕ Resigned'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 text-sm">
                      {new Date(emp.joinDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="inline-flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900 group"
                      >
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Employees</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{employees.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Showing</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{filteredEmployees.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Status</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">
            {employees.filter((e) => e.status === 'active').length} Active
          </p>
        </div>
      </div>
    </div>
  );
}
