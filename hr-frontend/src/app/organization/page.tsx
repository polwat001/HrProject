"use client";

import { useState, useEffect } from "react";
import { organizationAPI } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Briefcase, Users, X } from "lucide-react";
import type { Department, Position } from "@/types";

interface DepartmentAPI {
  id: number;
  NAME: string;
  company_id: number;
  parent_dept_id?: number;
  cost_center?: string;
}

export default function OrganizationPage() {
  const { currentCompanyId } = useAppStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<
    "departments" | "positions" | "companies" | "levels"
  >("departments");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [mockLevel, setMockLevel] = useState([
    {
      id: 1,
      level: "s1",
      level_title: "Staff",
      thai_title: "พนักงาน / เจ้าหน้าที่",
    },
    {
      id: 2,
      level: "s2",
      level_title: "Senior Staff",
      thai_title: "พนักงานอาวุโส / เจ้าหน้าที่อาวุโส",
    },
    {
      id: 3,
      level: "S3",
      level_title: "Supervisor",
      thai_title: "หัวหน้างาน / หัวหน้าหน่วย",
    },
    {
      id: 4,
      level: "M1",
      level_title: "Assistant Manager",
      thai_title: "ผู้ช่วยผู้จัดการแผนก",
    }, 
    {
      id: 5,
      level: "M2",
      level_title: "Section Manager",
      thai_title: "ผู้จัดการแผนก",
    },
    {
      id: 6,
      level: "M3",
      level_title: "Division Manager",
      thai_title: "ผู้จัดการส่วน",
    },
    {
      id: 7,
      level: "M4",
      level_title: "Department Manager",
      thai_title: "ผู้จัดการฝ่าย",
    },
    { id: 8, level: "E1", level_title: "Director", thai_title: "ผู้อำนวยการ" },
    {
      id: 9,
      level: "E2",
      level_title: "General Manager (GM)",
      thai_title: "ผู้จัดการทั่วไป",
    },
    {
      id: 10,
      level: "c1",
      level_title: "Chief Executive Officer (CEO)",
      thai_title: "ประธานเจ้าหน้าที่บริหาร",
    },
  ]);

  // Department form
  const [deptForm, setDeptForm] = useState({
    name: "",
    costCenter: "",
    companyId: 1,
  });

  // Position form
  const [posForm, setPosForm] = useState({
    title_th: "",
    level: "",
    companyId: 1,
  });

  // Company form
  const [companyForm, setCompanyForm] = useState({ name_th: "" });

  // Level form 
  const [levelForm, setLevelForm] = useState({ level: "", level_title: "" });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [depRes, posRes, companyRes] = await Promise.all([
        organizationAPI.getDepartments(),
        organizationAPI.getPositions(),
        organizationAPI.getCompanies(),
      ]);

      setCompanies(companyRes.data);

      const mappedDepartments: Department[] = depRes.data.map(
        (dept: DepartmentAPI) => ({
          id: dept.id,
          name: dept.NAME,
          companyId: dept.company_id,
          parentId: dept.parent_dept_id ?? undefined,
          costCenterCode: dept.cost_center ?? undefined,
          headCount: 0,
        }),
      );

      const mappedPositions = posRes.data.map((p: any) => ({
        id: p.id,
        name: p.title_th ?? "-",
        code: p.LEVEL ?? "-",
        companyId: p.company_id,
        companyName:
          companyRes.data.find((c: any) => c.id === p.company_id)?.name_th ??
          "-",
          departmentName: mappedDepartments.find((d) => d.id === p.department_id)?.name ?? "ไม่ระบุแผนก",
        isActive: true,
      }));

      setDepartments(mappedDepartments);
      setPositions(mappedPositions);
    } catch (err) {
      console.error("Error loading organization data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = (company: any) => {
    setCompanyForm({ name_th: company.name_th });
    setSelectedTab("companies");
    setIsEditMode(true);
    setEditingId(company.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteCompany = async (id: number) => {
    if (!confirm("ยืนยันการลบบริษัทนี้ ?")) return;
    try {
      await organizationAPI.deleteCompany(id);
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const tabConfig = {
    companies: { label: "Company" },
    departments: { label: "Department" },
    positions: { label: "Position" },
    levels: { label: "Level" },
  };

  const currentTab = tabConfig[selectedTab];

  // แก้ handleOpenModal 
  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");

    if (selectedTab === "companies") {
      setCompanyForm({ name_th: "" });
    } else if (selectedTab === "departments") {
      setDeptForm({
        name: "",
        costCenter: "",
        companyId: companies[0]?.id ?? 1,
      });
    } else if (selectedTab === "positions") {
      setPosForm({ title_th: "", level: "", companyId: companies[0]?.id ?? 1 });
    } else if (selectedTab === "levels") {
      setLevelForm({ level: "", level_title: "" });
    }

    setShowModal(true);
  };

  // แก้ handleSave 
  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (selectedTab === "companies") {
        if (!companyForm.name_th.trim()) {
          setFormError("กรุณากรอกชื่อบริษัท");
          return;
        }
        if (isEditMode && editingId) {
          await organizationAPI.updateCompany(editingId, {
            name_th: companyForm.name_th,
          });
        } else {
          await organizationAPI.createCompany({ name_th: companyForm.name_th });
        }
      } else if (selectedTab === "departments") {
        if (!deptForm.name.trim()) {
          setFormError("กรุณากรอกชื่อแผนก");
          return;
        }
        if (isEditMode && editingId) {
          await organizationAPI.updateDepartment(editingId, {
            NAME: deptForm.name,
            cost_center: deptForm.costCenter,
            company_id: deptForm.companyId,
          });
        } else {
          await organizationAPI.createDepartment({
            NAME: deptForm.name,
            cost_center: deptForm.costCenter,
            company_id: deptForm.companyId,
          });
        }
      } else if (selectedTab === "positions") {
        if (!posForm.title_th.trim()) {
          setFormError("กรุณากรอกชื่อตำแหน่ง");
          return;
        }
        if (isEditMode && editingId) {
          await organizationAPI.updatePosition(editingId, {
            title_th: posForm.title_th,
            LEVEL: posForm.level,
            company_id: posForm.companyId,
          });
        } else {
          await organizationAPI.createPosition({
            title_th: posForm.title_th,
            LEVEL: posForm.level,
            company_id: posForm.companyId,
          });
        }
      } else if (selectedTab === "levels") {
        //  Level save 
        if (!levelForm.level.trim() || !levelForm.level_title.trim()) {
          setFormError("กรุณากรอกข้อมูล Level ให้ครบ");
          return;
        }
        if (isEditMode && editingId) {
          setMockLevel((prev) =>
            prev.map((l) => (l.id === editingId ? { ...l, ...levelForm } : l)),
          );
        } else {
          const newId = Math.max(...mockLevel.map((l) => l.id), 0) + 1;
          setMockLevel((prev) => [...prev, { id: newId, ...levelForm }]);
        }
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);

      if (selectedTab !== "levels") {
        await loadData();
      }
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
    } finally {
      setSaving(false);
    }
  };

  // ✅ Modal title ตาม tab และ mode
  const getModalTitle = () => {
    const action = isEditMode ? "แก้ไข" : "เพิ่ม";
    const tabLabel: Record<string, string> = {
      companies: "บริษัท",
      departments: "แผนก",
      positions: "ตำแหน่ง",
      levels: "Level",
    };
    return `${action}${tabLabel[selectedTab]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={40}
          />
          <p className="text-slate-600 font-medium">
            Loading organization structure...
          </p>
        </div>
      </div>
    );
  }

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm("ยืนยันการลบแผนกนี้ ?")) return;
    try {
      await organizationAPI.deleteDepartment(id);
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // ✅ แก้ handleEditDepartment 
  const handleEditDepartment = (dept: Department) => {
    setDeptForm({
      name: dept.name,
      costCenter: dept.costCenterCode || "",
      companyId: dept.companyId,
    });
    setSelectedTab("departments");
    setIsEditMode(true);
    setEditingId(dept.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm("ยืนยันการลบตำแหน่งนี้ ?")) return;
    try {
      await organizationAPI.deletePosition(id);
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEditPosition = (pos: Position) => {
    setPosForm({
      title_th: pos.name,
      level: pos.code || "",
      companyId: pos.companyId,
    });
    setSelectedTab("positions");
    setIsEditMode(true);
    setEditingId(pos.id);
    setFormError("");
    setShowModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Thai Summit Automotive Co., Ltd. (Headquarter)
          </h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} />
          Add New {currentTab.label}
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3"> Organization</h3>
          <p className="text-4xl font-bold text-blue-900">{companies.length}</p>
          <p className="text-sm text-blue-700 mt-2">
            Total organizational units
          </p>
        </div> */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3"> Departments</h3>
          <p className="text-4xl font-bold text-blue-900">
            {departments.length}
          </p>
          <p className="text-sm text-blue-700 mt-2">Total Department units</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-purple-900 mb-3"> Positions</h3>
          <p className="text-4xl font-bold text-purple-900">
            {positions.length}
          </p>
          <p className="text-sm text-purple-700 mt-2">Total positions</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-purple-900 mb-3">Level</h3>
          <p className="text-4xl font-bold text-purple-900">
            {mockLevel.length}
          </p>
          <p className="text-sm text-purple-700 mt-2">Total levels</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          {/* companies */}
          {/* <button
            onClick={() => setSelectedTab("companies")}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedTab === "companies"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Users size={20} />
            Organization
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {companies.length}
            </span>
          </button> */}
          {/* departments */}
          <button
            onClick={() => setSelectedTab("departments")}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedTab === "departments"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Briefcase size={20} />
            Departments
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {departments.length}
            </span>
          </button>
          {/* positions */}
          <button
            onClick={() => setSelectedTab("positions")}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedTab === "positions"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Users size={20} />
            Positions
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {positions.length}
            </span>
          </button>
          {/* Level */}
          <button
            onClick={() => setSelectedTab("levels")}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedTab === "levels"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Users size={20} />
            LEVEL
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {mockLevel.length}
            </span>
          </button>
        </div>

        {/* Companies Tab */}
        {selectedTab === "companies" && (
          <div className="p-6">
            {companies.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No companies found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4">ID</th>
                      <th className="text-left py-3 px-4">Company Name</th>
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id} className="border-b">
                        <td className="py-3 px-4">{company.id}</td>
                        <td className="py-3 px-4 font-semibold">
                          {company.name_th}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="mr-2 text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Departments Tab */}
        {selectedTab === "departments" && (
          <div className="p-6">
            {departments.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">
                  No departments found
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Create your first department to get started
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {dept.name}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Company:{" "}
                            {companies.find((c) => c.id === dept.companyId)
                              ?.name_th || "-"}
                          </p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          ID: {dept.id}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="mt-4 space-y-2 text-sm text-slate-600">
                        {dept.costCenterCode && (
                          <p>
                            <span className="font-medium text-slate-700">
                              Cost Center:
                            </span>{" "}
                            {dept.costCenterCode}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 mt-5">
                        <button
                          onClick={() => handleEditDepartment(dept)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(dept.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Positions Tab */}
        {selectedTab === "positions" && (
          <div className="p-6">
            {positions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No positions found</p>
                <p className="text-slate-500 text-sm mt-1">
                  Create your first position to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        Position Name
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        Level
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        company
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
                    {positions.map((pos) => (
                      <tr
                        key={pos.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900">
                            {pos.name}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {pos.code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {pos.companyName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              pos.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {pos.isActive ? "✓ Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditPosition(pos)}
                              className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeletePosition(pos.id)}
                              className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
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
        )}

        {/* ✅ LEVEL TAB — เพิ่ม Actions column + edit/delete */}
        {selectedTab === "levels" && (
          <div className="p-6">
            {mockLevel.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No levels found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        ID
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        Level Code
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">
                        Level Title
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {mockLevel.map((level) => (
                      <tr
                        key={level.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-slate-900">
                          {level.id}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {level.level}
                          </span>
                        </td>
                        <td className="py-4 px-6">{level.level_title}</td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setLevelForm({
                                  level: level.level,
                                  level_title: level.level_title,
                                });
                                setIsEditMode(true);
                                setEditingId(level.id);
                                setFormError("");
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("ยืนยันการลบ Level นี้ ?")) {
                                  setMockLevel((prev) =>
                                    prev.filter((l) => l.id !== level.id),
                                  );
                                }
                              }}
                              className="p-2 hover:bg-red-100 rounded transition-colors text-red-600"
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Box */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                {selectedTab === "departments" ? (
                  <Briefcase size={20} className="text-blue-600" />
                ) : (
                  <Users size={20} className="text-blue-600" />
                )}
                {/* ✅ ใช้ getModalTitle() แทนข้อความ hardcode */}
                <h3 className="text-lg font-bold text-slate-900">
                  {getModalTitle()}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}

              {/* Companies Form */}
              {selectedTab === "companies" && (
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    ชื่อบริษัท <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyForm.name_th}
                    onChange={(e) =>
                      setCompanyForm({ name_th: e.target.value })
                    }
                    placeholder="เช่น บริษัท ABC จำกัด"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              )}

              {/* Departments Form */}
              {selectedTab === "departments" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      ชื่อแผนก <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deptForm.name}
                      onChange={(e) =>
                        setDeptForm({ ...deptForm, name: e.target.value })
                      }
                      placeholder="เช่น ฝ่ายบุคคล"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Cost Center Code
                    </label>
                    <input
                      type="text"
                      value={deptForm.costCenter}
                      onChange={(e) =>
                        setDeptForm({ ...deptForm, costCenter: e.target.value })
                      }
                      placeholder="เช่น CC001"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      บริษัท <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deptForm.companyId}
                      onChange={(e) =>
                        setDeptForm({
                          ...deptForm,
                          companyId: Number(e.target.value),
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_th}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Positions Form */}
              {selectedTab === "positions" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      ชื่อตำแหน่ง <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={posForm.title_th}
                      onChange={(e) =>
                        setPosForm({ ...posForm, title_th: e.target.value })
                      }
                      placeholder="เช่น ผู้จัดการ"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Level
                    </label>
                    <input
                      type="text"
                      value={posForm.level}
                      onChange={(e) =>
                        setPosForm({ ...posForm, level: e.target.value })
                      }
                      placeholder="เช่น m1, s1"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      บริษัท <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={posForm.companyId}
                      onChange={(e) =>
                        setPosForm({
                          ...posForm,
                          companyId: Number(e.target.value),
                        })
                      }
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_th}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* ✅ Levels Form (เพิ่มใหม่) */}
              {selectedTab === "levels" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Level Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={levelForm.level}
                      onChange={(e) =>
                        setLevelForm({ ...levelForm, level: e.target.value })
                      }
                      placeholder="เช่น m1, s1, h1"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Level Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={levelForm.level_title}
                      onChange={(e) =>
                        setLevelForm({
                          ...levelForm,
                          level_title: e.target.value,
                        })
                      }
                      placeholder="เช่น Manager, Staff"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
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
    </div>
  );
}
