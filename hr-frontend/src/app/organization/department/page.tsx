"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Briefcase, X, Users, CheckCircle2, XCircle } from "lucide-react";

// ✅ Import ข้อมูลจำลองและ Type ที่แยกไฟล์ไว้
import { Department, INITIAL_MOCK_DEPARTMENTS, MOCK_SECTIONS } from "@/mocks/departmentData";

export default function DepartmentPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  
  const [departments, setDepartments] = useState<Department[]>(INITIAL_MOCK_DEPARTMENTS);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Department form
  const [deptForm, setDeptForm] = useState({
    code: "",
    name: "",
    sectionId: "",
    headName: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    setDeptForm({
      code: "",
      name: "",
      sectionId: "",
      headName: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!deptForm.name.trim() || !deptForm.code.trim() || !deptForm.sectionId) {
        setFormError("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (*)");
        setSaving(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      const selectedSection = MOCK_SECTIONS.find(s => s.id === deptForm.sectionId);

      if (isEditMode && editingId) {
        setDepartments((prev) => 
          prev.map((dept) => 
            dept.id === editingId 
              ? { 
                  ...dept, 
                  code: deptForm.code.toUpperCase(),
                  name: deptForm.name, 
                  sectionName: selectedSection?.name || dept.sectionName,
                  divisionName: selectedSection?.divName || dept.divisionName,
                  headName: deptForm.headName || "-",
                  status: deptForm.status
                } 
              : dept
          )
        );
      } else {
        const newId = departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1;
        const newDept: Department = {
          id: newId,
          code: deptForm.code.toUpperCase(),
          name: deptForm.name,
          sectionName: selectedSection?.name || "-",
          divisionName: selectedSection?.divName || "-",
          headName: deptForm.headName || "-",
          headCount: 0, 
          status: deptForm.status,
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
    const sec = MOCK_SECTIONS.find(s => s.name === dept.sectionName);
    setDeptForm({
      code: dept.code,
      name: dept.name,
      sectionId: sec ? sec.id : "",
      headName: dept.headName !== "-" ? dept.headName : "",
      status: dept.status,
    });
    setIsEditMode(true);
    setEditingId(dept.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm("ยืนยันการลบแผนกนี้ ?")) return;
    
    await new Promise((resolve) => setTimeout(resolve, 300));
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

      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        
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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-700">Code</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Department Name</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Section / Division</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Head</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">Headcount</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {departments.map((dept) => (
                    <tr key={dept.id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6 font-mono text-sm text-blue-600 font-semibold">{dept.code}</td>
                      <td className="py-4 px-6 text-slate-800 font-medium">{dept.name}</td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-700">{dept.sectionName}</div>
                        <div className="text-xs text-slate-500">{dept.divisionName}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {dept.headName}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center justify-center bg-slate-100 px-2 py-1 rounded-full text-xs font-semibold text-slate-600">
                          <Users size={12} className="mr-1" /> {dept.headCount}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {dept.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                            <CheckCircle2 size={14}/> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            <XCircle size={14}/> Inactive
                          </span>
                        )}
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

      
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            
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

            
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">
                  {formError}
                </div>
              )}

              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  รหัสแผนก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="เช่น DPT-IT-01"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  ชื่อแผนก <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="เช่น แผนกพัฒนาซอฟต์แวร์"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  สังกัดส่วนงาน (Section) <span className="text-red-500">*</span>
                </label>
                <select
                  value={deptForm.sectionId}
                  onChange={(e) => setDeptForm({ ...deptForm, sectionId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">-- เลือกส่วนงานต้นสังกัด --</option>
                  {MOCK_SECTIONS.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name} ({sec.divName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  ชื่อหัวหน้าแผนก (ตัวเลือก)
                </label>
                <input
                  type="text"
                  value={deptForm.headName}
                  onChange={(e) => setDeptForm({ ...deptForm, headName: e.target.value })}
                  placeholder="เช่น สมชาย มั่นคง"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  สถานะ
                </label>
                <select
                  value={deptForm.status}
                  onChange={(e) => setDeptForm({ ...deptForm, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="active">ใช้งาน (Active)</option>
                  <option value="inactive">ไม่ใช้งาน (Inactive)</option>
                </select>
              </div>
            </div>

            
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