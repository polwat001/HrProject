"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
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
  Share,
  Eye,
  Info,
} from "lucide-react";

import {
  MOCK_COMPANIES,
  MOCK_DIVISIONS,
  MOCK_SECTIONS,
  MOCK_DEPARTMENTS,
  MOCK_POSITIONS,
  MOCK_LEVELS,
  MOCK_EMPLOYEES,
} from "@/mocks/employeeData";

const EMPTY_FORM = {
  employee_code: "",
  firstname_th: "",
  lastname_th: "",
  nickname: "",
  id_card_number: "",
  current_company_id: 0,
  department_id: 0,
  position_id: 0,
  STATUS: "active",
};

export default function EmployeesPage() {
  const { currentCompanyId } = useAppStore();
  const router = useRouter();
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [divisions, setDivisions] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCompanyId, setFilterCompanyId] = useState<number | "">(
    currentCompanyId || "",
  );
  const [filterDivisionId, setFilterDivisionId] = useState<number | "">("");
  const [filterSectionId, setFilterSectionId] = useState<number | "">("");
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | "">("");
  const [filterPositionId, setFilterPositionId] = useState<number | "">("");
  const [filterLevelId, setFilterLevelId] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const activeFilterCount = [
    filterCompanyId,
    filterDivisionId,
    filterSectionId,
    filterDepartmentId,
    filterPositionId,
    filterLevelId,
    filterStatus,
  ].filter(Boolean).length;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // 🔴 เพิ่ม State สำหรับจัดการ Information Modal
  const [showInfoModal, setShowInfoModal] = useState(false);

  const loadData = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    setCompanies(MOCK_COMPANIES);
    setDivisions(MOCK_DIVISIONS);
    setSections(MOCK_SECTIONS);
    setDepartments(MOCK_DEPARTMENTS);
    setPositions(MOCK_POSITIONS);
    setLevels(MOCK_LEVELS);

    const mappedEmployees = MOCK_EMPLOYEES.map((emp: any) => {
      const company = MOCK_COMPANIES.find(
        (c: any) => Number(c.id) === Number(emp.current_company_id),
      );
      const department = MOCK_DEPARTMENTS.find(
        (d: any) => Number(d.id) === Number(emp.department_id),
      );
      const position = MOCK_POSITIONS.find(
        (p: any) => Number(p.id) === Number(emp.position_id),
      );

      return {
        ...emp,
        company_name: company?.name_th ?? "-",
        department_name: department?.NAME ?? "-",
        position_name: position?.title_th ?? "-",
        status:
          emp.STATUS?.toLowerCase() || emp.status?.toLowerCase() || "active",
      };
    });

    setEmployees(mappedEmployees);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const mapSingleEmployee = (empData: any) => {
    const company = companies.find(
      (c: any) => Number(c.id) === Number(empData.current_company_id),
    );
    const department = departments.find(
      (d: any) => Number(d.id) === Number(empData.department_id),
    );
    const position = positions.find(
      (p: any) => Number(p.id) === Number(empData.position_id),
    );

    return {
      ...empData,
      company_name: company?.name_th ?? "-",
      department_name: department?.NAME ?? "-",
      position_name: position?.title_th ?? "-",
      status: empData.STATUS?.toLowerCase() || "active",
    };
  };

  const handleOpenAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, current_company_id: companies[0]?.id ?? 0 });
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
      department_id: emp.department_id ?? 0,
      position_id: emp.position_id ?? 0,
      STATUS: emp.status ?? "active",
    });
    setFormError("");
    setShowFormModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (
      !formData.firstname_th.trim() ||
      !formData.lastname_th.trim() ||
      !formData.employee_code.trim()
    ) {
      setFormError("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน");
      return;
    }

    try {
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      const payload = {
        ...formData,
        department_id: formData.department_id || null,
        position_id: formData.position_id || null,
      };

      if (isEditMode && editingId) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingId
              ? mapSingleEmployee({ ...emp, ...payload })
              : emp,
          ),
        );
      } else {
        const newId =
          employees.length > 0
            ? Math.max(...employees.map((e) => e.id)) + 1
            : 1;
        const newEmployee = mapSingleEmployee({ id: newId, ...payload });
        setEmployees((prev) => [...prev, newEmployee]);
      }

      setShowFormModal(false);
      setIsEditMode(false);
      setEditingId(null);
    } catch (err: any) {
      setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (emp: any) => {
    setDeletingEmployee(emp);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEmployee) return;
    try {
      setDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      setEmployees((prev) =>
        prev.filter((emp) => emp.id !== deletingEmployee.id),
      );
      setShowDeleteModal(false);
      setDeletingEmployee(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCompanyId("");
    setFilterDivisionId("");
    setFilterSectionId("");
    setFilterDepartmentId("");
    setFilterPositionId("");
    setFilterLevelId("");
    setFilterStatus("");
  };

  const filteredEmployees = employees.filter((emp) => {
    const keyword = searchTerm.toLowerCase();
    const matchSearch =
      (emp.firstname_th || "").toLowerCase().includes(keyword) ||
      (emp.lastname_th || "").toLowerCase().includes(keyword) ||
      (emp.employee_code || "").toLowerCase().includes(keyword);
    if (!matchSearch) return false;

    if (filterStatus && emp.status !== filterStatus) return false;
    if (filterCompanyId && emp.current_company_id !== Number(filterCompanyId))
      return false;

    const empPos = positions.find((p) => p.id === emp.position_id);
    if (filterPositionId && emp.position_id !== Number(filterPositionId))
      return false;
    if (filterLevelId && empPos?.level_id !== Number(filterLevelId))
      return false;

    const empDept = departments.find((d) => d.id === emp.department_id);
    const empSec = sections.find((s) => s.id === empDept?.section_id);
    const empDiv = divisions.find((d) => d.id === empSec?.division_id);

    if (filterDepartmentId && emp.department_id !== Number(filterDepartmentId))
      return false;
    if (filterSectionId && empSec?.id !== Number(filterSectionId)) return false;
    if (filterDivisionId && empDiv?.id !== Number(filterDivisionId))
      return false;

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={40}
          />
          <p className="text-slate-600 font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">
            Employee Directory
          </h1>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="ดูข้อมูลเพิ่มเติม"
          >
            <Info size={24} />
          </button>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center border border-slate-300 gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium">
            <Share size={20} /> นำเข้าข้อมูล
          </button>
          <button className="flex items-center border border-slate-300 gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium">
            <Share size={20} /> ส่งออกข้อมูล
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Plus size={20} /> Add Employee
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={20}
            />
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
            className={`flex items-center gap-2 px-5 py-2.5 border rounded-lg font-medium transition-all relative ${
              showFilters || activeFilterCount > 0
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Filter size={20} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-slate-800">Filter Criteria</h4>
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Clear All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Status</option>
                  <option value="active">Active (ใช้งานปกติ)</option>
                  <option value="probation">Probation (ทดลองงาน)</option>
                  <option value="resigned">Resigned (ลาออก)</option>
                  <option value="retired">Retired (เกษียณ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Division (ฝ่าย)
                </label>
                <select
                  value={filterDivisionId}
                  onChange={(e) => {
                    setFilterDivisionId(
                      e.target.value ? Number(e.target.value) : "",
                    );
                    setFilterSectionId("");
                  }}
                  disabled={!filterCompanyId && divisions.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">All Divisions</option>
                  {divisions
                    .filter(
                      (d) =>
                        !filterCompanyId || d.company_id === filterCompanyId,
                    )
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Section (ส่วนงาน)
                </label>
                <select
                  value={filterSectionId}
                  onChange={(e) => {
                    setFilterSectionId(
                      e.target.value ? Number(e.target.value) : "",
                    );
                    setFilterDepartmentId("");
                  }}
                  disabled={!filterDivisionId && sections.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">All Sections</option>
                  {sections
                    .filter(
                      (s) =>
                        !filterDivisionId || s.division_id === filterDivisionId,
                    )
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Department (แผนก)
                </label>
                <select
                  value={filterDepartmentId}
                  onChange={(e) =>
                    setFilterDepartmentId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Departments</option>
                  {departments
                    .filter(
                      (d) =>
                        !filterSectionId || d.section_id === filterSectionId,
                    )
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.NAME}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Level (ระดับ)
                </label>
                <select
                  value={filterLevelId}
                  onChange={(e) =>
                    setFilterLevelId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Levels</option>
                  {levels.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.level_code} - {l.level_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Position (ตำแหน่ง)
                </label>
                <select
                  value={filterPositionId}
                  onChange={(e) =>
                    setFilterPositionId(
                      e.target.value ? Number(e.target.value) : "",
                    )
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Positions</option>
                  {positions
                    .filter(
                      (p) =>
                        !filterDepartmentId ||
                        p.department_id === filterDepartmentId,
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_th}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

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
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Department
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Position
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {emp.firstname_th?.charAt(0)}
                          {emp.lastname_th?.charAt(0)}
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
                          <p className="text-xs text-slate-500">
                            {emp.employee_code}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        <Briefcase size={12} /> {emp.department_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-slate-700 font-medium">
                        {emp.position_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => router.push(`/employees/${emp.id}`)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
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

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !saving && setShowFormModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
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

            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstname_th}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname_th: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, lastname_th: e.target.value })
                    }
                    placeholder="เช่น ใจดี"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ชื่อเล่น
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) =>
                      setFormData({ ...formData, nickname: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employee_code: e.target.value,
                      })
                    }
                    placeholder="เช่น EMP001"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  เลขบัตรประชาชน
                </label>
                <input
                  type="text"
                  value={formData.id_card_number}
                  onChange={(e) =>
                    setFormData({ ...formData, id_card_number: e.target.value })
                  }
                  placeholder="เช่น 1234567890123"
                  maxLength={13}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
    
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    สถานะ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.STATUS}
                    onChange={(e) =>
                      setFormData({ ...formData, STATUS: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="probation">Probation</option>
                    <option value="resigned">Resigned</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    แผนก (Department)
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        department_id: Number(e.target.value),
                        position_id: 0,
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value={0}>ไม่ระบุแผนก</option>

                    {departments
                      .filter(
                        (d) => d.company_id === formData.current_company_id,
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.NAME}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    ตำแหน่ง (Position)
                  </label>
                  <select
                    value={formData.position_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        position_id: Number(e.target.value),
                      })
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    <option value={0}>ไม่ระบุตำแหน่ง</option>

                    {positions
                      .filter(
                        (p) =>
                          !formData.department_id ||
                          p.department_id === formData.department_id,
                      )
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_th}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

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

      {showDeleteModal && deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setShowDeleteModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-red-50 to-slate-50">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  ยืนยันการลบ
                </h3>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
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
                    {deletingEmployee.firstname_th}{" "}
                    {deletingEmployee.lastname_th}
                  </p>
                  <p className="text-xs text-slate-500">
                    {deletingEmployee.employee_code}
                  </p>
                </div>
              </div>
              <p className="text-xs text-red-600 mt-3">
                ⚠️ การลบนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
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

      {/* Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl w-full  max-w-5xl p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Info className="text-blue-600 mt-[-5px]" size={20} />
                *ตัวอย่างแบบการนำเข้าข้อมูล
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-500 bg-slate-50 flex items-center justify-center min-h-[300px] p-4">
              <img
                src="/employee_tem.png"
                alt="Information Detail"
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "✓ Active", className: "bg-green-100 text-green-700" },
    probation: {
      label: "⏳ Probation",
      className: "bg-yellow-100 text-yellow-700",
    },
    resigned: { label: "✕ Resigned", className: "bg-red-100 text-red-700" },
    retired: { label: "🎓 Retired", className: "bg-slate-100 text-slate-600" },
  };
  const s = map[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.className}`}>
      {s.label}
    </span>
  );
}