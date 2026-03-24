"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader, Users, X, Briefcase, CheckCircle2, XCircle } from "lucide-react";
import { PositionMock, INITIAL_MOCK_POSITIONS, INITIAL_MOCK_LEVELS, INITIAL_MOCK_DEPARTMENTS } from "@/mocks/positionData";

export default function PositionPage() {
  const [positions, setPositions] = useState<PositionMock[]>(INITIAL_MOCK_POSITIONS);
  const [levels, setLevels] = useState<any[]>(INITIAL_MOCK_LEVELS);
  const [departments, setDepartments] = useState<any[]>(INITIAL_MOCK_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [posForm, setPosForm] = useState({
    code: "",
    title_th: "",
    level_id: 0,
    department_id: 0,
    budget_headcount: 1,
    isActive: "true",
  });

  useEffect(() => {
    loadData();
  }, []);

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
    setPosForm({ 
      code: "",
      title_th: "", 
      level_id: levels[0]?.id ?? 0, 
      department_id: departments[0]?.id ?? 0,
      budget_headcount: 1,
      isActive: "true",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!posForm.title_th.trim() || !posForm.code.trim() || !posForm.level_id || !posForm.department_id) {
        setFormError("กรุณากรอกข้อมูลให้ครบถ้วน (*)");
        setSaving(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      if (isEditMode && editingId) {
        setPositions((prev) => 
          prev.map((pos) => 
            pos.id === editingId 
              ? { 
                  ...pos, 
                  code: posForm.code.toUpperCase(),
                  title_th: posForm.title_th, 
                  level_id: posForm.level_id, 
                  department_id: posForm.department_id,
                  budget_headcount: posForm.budget_headcount,
                  isActive: posForm.isActive === "true" 
                }
              : pos
          )
        );
      } else {
        const newId = positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1;
        setPositions((prev) => [
          ...prev, 
          { 
            id: newId, 
            code: posForm.code.toUpperCase(),
            title_th: posForm.title_th, 
            level_id: posForm.level_id, 
            department_id: posForm.department_id, 
            current_headcount: 0, // ค่าเริ่มต้นตอนสร้างใหม่
            budget_headcount: posForm.budget_headcount,
            isActive: posForm.isActive === "true" 
          }
        ]);
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

  const handleEditPosition = (pos: PositionMock) => {
    setPosForm({
      code: pos.code,
      title_th: pos.title_th,
      level_id: pos.level_id || 0,
      department_id: pos.department_id || 0,
      budget_headcount: pos.budget_headcount,
      isActive: pos.isActive ? "true" : "false",
    });
    setIsEditMode(true);
    setEditingId(pos.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm("ยืนยันการลบตำแหน่งนี้ ? (พนักงานที่ถือตำแหน่งนี้อาจได้รับผลกระทบ)")) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Position Management</h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          Add New Position
        </button>
      </div>

      {/* แถบสีม่วงด้านบนตาราง */}
      <div className="flex items-center justify-center w-full gap-2 py-3 border-b-2 border-blue-500 text-blue-600 bg-white font-semibold">
        <Briefcase size={20} />
        Positions (ตำแหน่งงาน)
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
          {positions.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-0">
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No positions found</p>
              <p className="text-slate-500 text-sm mt-1">Create your first position to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">Code</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">Position Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">Level (ระดับ)</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-600 text-sm">Department (แผนก)</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">Headcount (Actual / Budget)</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {positions.map((pos) => {
                    const matchedLevel = levels.find(l => l.id === pos.level_id);
                    const matchedDept = departments.find(d => d.id === pos.department_id); 
                    
                    // คำนวณสีของ Headcount
                    const headcountRatio = pos.current_headcount / pos.budget_headcount;
                    let hcColor = "text-slate-600 bg-slate-100"; // ปกติ
                    if (headcountRatio === 1) hcColor = "text-green-700 bg-green-100"; // เต็มแล้ว
                    if (headcountRatio > 1) hcColor = "text-red-700 bg-red-100"; // คนล้น (Over budget)
                    if (pos.current_headcount === 0 && pos.budget_headcount > 0) hcColor = "text-amber-700 bg-amber-100"; // ว่างทั้งหมด

                    return (
                    <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-semibold text-slate-800">
                        {pos.id}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-blue-600 font-medium">
                          {pos.code}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-800">
                        {pos.title_th}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-xs font-semibold">
                          {matchedLevel ? `${matchedLevel.level_code} - ${matchedLevel.level_title}` : "No Level"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {matchedDept ? matchedDept.name : "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${hcColor}`}>
                          <Users size={12} className="mr-1" /> {pos.current_headcount} / {pos.budget_headcount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {pos.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                            <XCircle size={12} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleEditPosition(pos)} className="text-blue-500 hover:text-blue-700 transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePosition(pos.id)} className="text-red-500 hover:text-red-700 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditMode ? "Edit Position" : "Add New Position"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {formError && <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm text-red-600">{formError}</div>}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  รหัสตำแหน่ง (Code) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={posForm.code}
                  onChange={(e) => setPosForm({ ...posForm, code: e.target.value })}
                  placeholder="เช่น POS-01"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  ชื่อตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={posForm.title_th}
                  onChange={(e) => setPosForm({ ...posForm, title_th: e.target.value })}
                  placeholder="เช่น ผู้จัดการแผนกไอที"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Level (ระดับ) <span className="text-red-500">*</span>
                </label>
                <select
                  value={posForm.level_id}
                  onChange={(e) => setPosForm({ ...posForm, level_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value={0}>-- เลือกระดับ --</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.level_code} - {lvl.level_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Department (แผนก) <span className="text-red-500">*</span>
                </label>
                <select
                  value={posForm.department_id}
                  onChange={(e) => setPosForm({ ...posForm, department_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value={0}>-- เลือกแผนก --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  อัตรากำลังคน (Budget Headcount)
                </label>
                <input
                  type="number"
                  min="1"
                  value={posForm.budget_headcount}
                  onChange={(e) => setPosForm({ ...posForm, budget_headcount: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  สถานะ (Status)
                </label>
                <select
                  value={posForm.isActive}
                  onChange={(e) => setPosForm({ ...posForm, isActive: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="true">Active (ใช้งาน)</option>
                  <option value="false">Inactive (ระงับ)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? <Loader size={16} className="animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}