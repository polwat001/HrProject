"use client";

import { useState, useEffect } from "react";
import { organizationAPI } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Briefcase, X } from "lucide-react";
import type { Department } from "@/types";

interface DepartmentAPI {
  id: number;
  NAME: string;
  company_id: number;
  parent_dept_id?: number;
  cost_center?: string;
}

export default function DepartmentPage() {
  const { currentCompanyId } = useAppStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Department form
  const [deptForm, setDeptForm] = useState({
    name: "",
    costCenter: "",
    companyId: 1,
  });

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [depRes, companyRes] = await Promise.all([
        organizationAPI.getDepartments(),
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

      setDepartments(mappedDepartments);
    } catch (err) {
      console.error("Error loading department data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    setDeptForm({
      name: "",
      costCenter: "",
      companyId: companies[0]?.id ?? 1,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!deptForm.name.trim()) {
        setFormError("กรุณากรอกชื่อแผนก");
        setSaving(false);
        return;
      }

      const payload = {
        NAME: deptForm.name,
        cost_center: deptForm.costCenter,
        company_id: deptForm.companyId,
      };

      if (isEditMode && editingId) {
        await organizationAPI.updateDepartment(editingId, payload);
      } else {
        await organizationAPI.createDepartment(payload);
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      await loadData();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditDepartment = (dept: Department) => {
    setDeptForm({
      name: dept.name,
      costCenter: dept.costCenterCode || "",
      companyId: dept.companyId,
    });
    setIsEditMode(true);
    setEditingId(dept.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm("ยืนยันการลบแผนกนี้ ?")) return;
    try {
      await organizationAPI.deleteDepartment(id);
      await loadData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const getModalTitle = () => {
    return isEditMode ? "แก้ไขแผนก" : "เพิ่มแผนก";
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
            Loading departments...
          </p>
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
            Thai Summit Automotive Co., Ltd. (Headquarter)
          </h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} />
          Add New Department
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">Departments</h3>
          <p className="text-4xl font-bold text-blue-900">
            {departments.length}
          </p>
          <p className="text-sm text-blue-700 mt-2">Total Department units</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* แถบเมนูหัวส่วนเนื้อหา Departments */}
        <div className="flex border-b border-slate-200">
          <div className="flex items-center justify-center w-full gap-2 py-4 px-6 font-semibold border-b-2 border-blue-600 text-blue-600 bg-blue-50">
            <Briefcase size={20} />
            Departments
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700">
              {departments.length}
            </span>
          </div>
        </div>

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
                    {/* Card Header */}
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

                    {/* Card Details */}
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

                    {/* Card Actions */}
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
                <Briefcase size={20} className="text-blue-600" />
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

              {/* Department Form */}
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