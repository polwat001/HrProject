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
  Briefcase,
  MapPin,
} from 'lucide-react';

export default function EmployeesPage() {
  const { currentCompanyId } = useAppStore();

  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(
    currentCompanyId
  );
  const [showFilters, setShowFilters] = useState(false);

  // ===========================
  // LOAD DATA
  // ===========================
  const loadData = async () => {
    try {
      setLoading(true);

      const filters = {
        companyId: filterCompanyId ?? undefined,
      };

      const [empRes, coRes] = await Promise.all([
        employeeAPI.getEmployees(filters),
        organizationAPI.getCompanies(),
      ]);

      const mappedEmployees = empRes.data.map((emp: any) => ({
        id: emp.id,
        employee_code: emp.employee_code,
        firstname_th: emp.firstname_th,
        lastname_th: emp.lastname_th,
        nickname: emp.nickname,
        id_card_number: emp.id_card_number,
        current_company_id: emp.current_company_id,
        status: emp.STATUS?.toLowerCase(),
        avatar_url: emp.avatar_url,
      }));

      setEmployees(mappedEmployees);
      setCompanies(coRes.data);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      loadData();
    }, 400);

    return () => clearTimeout(delay);
  }, [filterCompanyId]);

  // ===========================
  // FILTER LOGIC
  // ===========================
  const filteredEmployees = employees.filter((emp) => {
    const firstName = emp.firstname_th ?? '';
    const lastName = emp.lastname_th ?? '';
    const code = emp.employee_code ?? '';

    const matchSearch =
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCompany =
      !filterCompanyId ||
      emp.current_company_id === filterCompanyId;

    return matchSearch && matchCompany;
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
          <h1 className="text-3xl font-bold text-slate-900">
            👥 Employee Directory
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and view all employees
          </p>
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

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or employee code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Company
            </label>
            <select
              value={filterCompanyId ?? ''}
              onChange={(e) =>
                setFilterCompanyId(
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_th}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-600 font-medium">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b">
                  <th className="text-left py-4 px-6">Employee</th>
                  <th className="text-left py-4 px-6">Company</th>
                  <th className="text-left py-4 px-6">Status</th>
                  <th className="text-center py-4 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {emp.firstname_th?.charAt(0)}
                          {emp.lastname_th?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {emp.firstname_th} {emp.lastname_th}
                          </p>
                          <p className="text-xs text-slate-500">
                            {emp.employee_code}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <MapPin size={14} />
                        {emp.current_company_id}
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
                        {emp.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="inline-flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border">
          <p className="text-sm text-blue-700">Total Employees</p>
          <p className="text-3xl font-bold">{employees.length}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border">
          <p className="text-sm text-green-700">Showing</p>
          <p className="text-3xl font-bold">{filteredEmployees.length}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border">
          <p className="text-sm text-purple-700">Active</p>
          <p className="text-3xl font-bold">
            {employees.filter((e) => e.status === 'active').length}
          </p>
        </div>
      </div>
    </div>
  );
}