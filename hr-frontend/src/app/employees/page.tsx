"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { employeeAPI, organizationAPI } from "@/services/api";
import {
  Plus,
  Search,
  ChevronRight,
  Loader,
  Download,
  Filter,
  Briefcase,
  MapPin,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

const EMPTY_FORM = {
  employee_code: "",
  firstname_th: "",
  lastname_th: "",
  nickname: "",
  id_card_number: "",
  current_company_id: 0,
  STATUS: "active",
};

export default function EmployeesPage() {
  const { currentCompanyId } = useAppStore();

  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(currentCompanyId);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Add/Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // ===========================
  // LOAD DATA
  // ===========================
  const loadData = async () => {
    try {
      setLoading(true);
      const filters = { companyId: filterCompanyId ?? undefined };
      const [empRes, coRes, deptRes, posRes] = await Promise.all([
        employeeAPI.getEmployees(filters),
        organizationAPI.getCompanies(),
        organizationAPI.getDepartments(),
        organizationAPI.getPositions(),
      ]);

      const companiesData = coRes.data;
      const departmentsData = deptRes.data;
      const positionsData = posRes.data;

      setDepartments(departmentsData);
      setPositions(positionsData);

      const mappedEmployees = empRes.data.map((emp: any) => {
        const company = companiesData.find((c: any) => c.id === emp.current_company_id);
        const department = departmentsData.find((d: any) => d.id === emp.department_id);
        const position = positionsData.find((p: any) => p.id === emp.position_id);
        return {
          id: emp.id,
          employee_code: emp.employee_code,
          firstname_th: emp.firstname_th,
          lastname_th: emp.lastname_th,
          nickname: emp.nickname,
          id_card_number: emp.id_card_number,
          current_company_id: emp.current_company_id,
          company_name: company?.name_th ?? "-",
          department_name: department?.NAME ?? "-",
          position_name: position?.title_th ?? "-",
          status: emp.STATUS?.toLowerCase(),
          avatar_url: emp.avatar_url,
        };
      });

      setEmployees(mappedEmployees);
      setCompanies(companiesData);
    } catch (err) {
      console.error("Error loading employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => loadData(), 400);
    return () => clearTimeout(delay);
  }, [filterCompanyId]);

  // ===========================
  // ADD / EDIT
  // ===========================
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      current_company_id: companies[0]?.id ?? 0,
    });
    setFormError("");
    setShowFormModal(true);
  };

  const handleOpenEdit = (emp: any) => {
    setIsEditMode(true);
    setEditingId(emp.id);
    setFormData({
      employee_code: emp.employee_code ?? "",
      firstname_th: emp.firstname_th ?? "",
      lastname_th: emp.lastname_th ?? "",
      nickname: emp.nickname ?? "",
      id_card_number: emp.id_card_number ?? "",
      current_company_id: emp.current_company_id ?? 0,
      STATUS: emp.status ?? "active",
    });
    setFormError("");
    setShowFormModal(true);
  };

  const handleSave = async () => {
    setFormError("");

    // Validation
    if (!formData.firstname_th.trim()) {
      setFormError("กรุณากรอกชื่อ");
      return;
    }
    if (!formData.lastname_th.trim()) {
      setFormError("กรุณากรอกนามสกุล");
      return;
    }
    if (!formData.employee_code.trim()) {
      setFormError("กรุณากรอกรหัสพนักงาน");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        employee_code: formData.employee_code,
        firstname_th: formData.firstname_th,
        lastname_th: formData.lastname_th,
        nickname: formData.nickname,
        id_card_number: formData.id_card_number,
        current_company_id: formData.current_company_id,
        STATUS: formData.STATUS,
      };

      if (isEditMode && editingId) {
        await employeeAPI.updateEmployee(editingId, payload);
      } else {
        await employeeAPI.createEmployee(payload);
      }

      setShowFormModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  // ===========================
  // DELETE
  // ===========================
  const handleDeleteClick = (emp: any) => {
    setDeletingEmployee(emp);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    try {
      setDeleting(true);
      await employeeAPI.deleteEmployee(deletingEmployee.id);
      setShowDeleteModal(false);
      setDeletingEmployee(null);
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  // ===========================
  // FILTER
  // ===========================
  const filteredEmployees = employees.filter((emp) => {
    const firstName = emp.firstname_th ?? "";
    const lastName = emp.lastname_th ?? "";
    const code = emp.employee_code ?? "";
    const matchSearch =
      firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCompany = !filterCompanyId || emp.current_company_id === filterCompanyId;
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
          <h1 className="text-3xl font-bold text-slate-900">👥 Employee Directory</h1>
          <p className="text-slate-600 mt-1">Manage and view all employees</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium">
            <Download size={20} />
            Export
          </button>
          {/* ✅ เปลี่ยนจาก Link เป็น button เปิด modal */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Plus size={20} />
            Add Employee
          </button>
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
            <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
            <select
              value={filterCompanyId ?? ""}
              onChange={(e) => setFilterCompanyId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name_th}</option>
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
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Department</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Position</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {emp.firstname_th?.charAt(0)}{emp.lastname_th?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {emp.firstname_th} {emp.lastname_th}
                            {emp.nickname && (
                              <span className="ml-1 text-xs text-slate-400 font-normal">
                                ({emp.nickname})
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">{emp.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <MapPin size={12} />
                        {emp.company_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <Briefcase size={12} />
                        {emp.department_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-700 font-medium">{emp.position_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(emp)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">Total Employees</p>
          <p className="text-3xl font-bold text-blue-900">{employees.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-medium">Showing</p>
          <p className="text-3xl font-bold text-green-900">{filteredEmployees.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700 font-medium">Active</p>
          <p className="text-3xl font-bold text-purple-900">
            {employees.filter((e) => e.status === "active").length}
          </p>
        </div>
      </div>

      {/* ✅ Add / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !saving && setShowFormModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <UserPlus size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {isEditMode ? "แก้ไขพนักงาน" : "เพิ่มพนักงานใหม่"}
                </h3>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                disabled={saving}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Row 1: ชื่อ - นามสกุล */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstname_th}
                    onChange={(e) => setFormData({ ...formData, firstname_th: e.target.value })}
                    placeholder="เช่น สมชาย"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastname_th}
                    onChange={(e) => setFormData({ ...formData, lastname_th: e.target.value })}
                    placeholder="เช่น ใจดี"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 2: ชื่อเล่น - รหัสพนักงาน */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="เช่น โอ๊ต"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    รหัสพนักงาน <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    placeholder="เช่น EMP001"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 3: เลขบัตรประชาชน */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  เลขบัตรประชาชน
                </label>
                <input
                  type="text"
                  value={formData.id_card_number}
                  onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
                  placeholder="เช่น 1234567890123"
                  maxLength={13}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Row 4: บริษัท - สถานะ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    บริษัท <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.current_company_id}
                    onChange={(e) => setFormData({ ...formData, current_company_id: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name_th}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    สถานะ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.STATUS}
                    onChange={(e) => setFormData({ ...formData, STATUS: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="probation">Probation</option>
                    <option value="resigned">Resigned</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowFormModal(false)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirm Modal */}
      {showDeleteModal && deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-slate-50">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">ยืนยันการลบ</h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <p className="text-slate-600 text-sm mb-4">
                คุณต้องการลบพนักงานคนนี้ใช่หรือไม่?
              </p>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {deletingEmployee.firstname_th?.charAt(0)}
                  {deletingEmployee.lastname_th?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {deletingEmployee.firstname_th} {deletingEmployee.lastname_th}
                  </p>
                  <p className="text-xs text-slate-500">{deletingEmployee.employee_code}</p>
                </div>
              </div>
              <p className="text-xs text-red-600 mt-3">⚠️ การลบนี้ไม่สามารถย้อนกลับได้</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                {deleting ? "กำลังลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ StatusBadge component
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "✓ Active", className: "bg-green-100 text-green-700" },
    probation: { label: "⏳ Probation", className: "bg-yellow-100 text-yellow-700" },
    resigned: { label: "✕ Resigned", className: "bg-red-100 text-red-700" },
    retired: { label: "🎓 Retired", className: "bg-slate-100 text-slate-600" },
  };
  const s = map[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.className}`}>
      {s.label}
    </span>
  );
}