"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Briefcase, X } from "lucide-react";
import type { Department } from "@/types";

// ==========================================
// 📦 MOCK DATA (ข้อมูลตั้งต้น)
// ==========================================
const INITIAL_MOCK_COMPANIES = [
  { id: 1, name_th: "Thai Summit Automotive Co., Ltd. (Headquarter)" },
  { id: 2, name_th: "Thai Summit Harness Co., Ltd." },
];

const INITIAL_MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: "แผนกทรัพยากรบุคคล (HR)", companyId: 1, costCenterCode: "CC-HR01", headCount: 15 },
  { id: 2, name: "แผนกเทคโนโลยีสารสนเทศ (IT)", companyId: 1, costCenterCode: "CC-IT01", headCount: 24 },
  { id: 3, name: "แผนกบัญชีและการเงิน (Accounting)", companyId: 1, costCenterCode: "CC-ACC01", headCount: 10 },
  { id: 4, name: "แผนกผลิตชิ้นส่วน (Production)", companyId: 2, costCenterCode: "CC-PRD01", headCount: 120 },
  { id: 5, name: "แผนกควบคุมคุณภาพ (QA/QC)", companyId: 2, costCenterCode: "CC-QA01", headCount: 35 },
];

export default function DepartmentPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  
  // ✅ ใช้ Mock Data เป็นค่าเริ่มต้นของ State
  const [departments, setDepartments] = useState<Department[]>(INITIAL_MOCK_DEPARTMENTS);
  const [companies, setCompanies] = useState<any[]>(INITIAL_MOCK_COMPANIES);
  
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

  const loadData = () => {
    setLoading(true);
    // จำลองเวลาโหลดข้อมูลจาก Backend 0.5 วินาที
    setTimeout(() => {
      setLoading(false);
    }, 500);
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

      // จำลองเวลาบันทึกข้อมูล 0.4 วินาที
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (isEditMode && editingId) {
        // อัปเดตข้อมูลลงใน State
        setDepartments((prev) => 
          prev.map((dept) => 
            dept.id === editingId 
              ? { 
                  ...dept, 
                  name: deptForm.name, 
                  costCenterCode: deptForm.costCenter, 
                  companyId: deptForm.companyId 
                } 
              : dept
          )
        );
      } else {
        // สร้างข้อมูลใหม่ (หา ID ล่าสุดแล้ว +1)
        const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
        const newDept: Department = {
          id: newId,
          name: deptForm.name,
          costCenterCode: deptForm.costCenter,
          companyId: deptForm.companyId,
          headCount: 0, // ค่าเริ่มต้น
        };
        setDepartments((prev) => [...prev, newDept]);
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
    } catch (err: any) {
      setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่");
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
    
    // จำลองเวลาลบข้อมูล 0.3 วินาที
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // ลบข้อมูลออกจาก State
    setDepartments((prev) => prev.filter((dept) => dept.id !== id));
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
            Departments Management
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
            /* ✅ เปลี่ยนจาก Grid Card มาเป็นตารางตรงนี้ครับ */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-700 w-24">ID</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Department Name</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Company</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Cost Center</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{dept.id}</td>
                      <td className="py-4 px-6 text-slate-800 font-medium">{dept.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          {companies.find((c) => c.id === dept.companyId)?.name_th || "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                        {dept.costCenterCode || "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditDepartment(dept)} 
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteDepartment(dept.id)} 
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
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