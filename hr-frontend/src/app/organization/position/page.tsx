"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Users, X } from "lucide-react";

// ==========================================
// 📦 MOCK DATA (ข้อมูลตั้งต้นสำหรับ Position)
// ==========================================
const INITIAL_MOCK_COMPANIES = [
  { id: 1, name_th: "Thai Summit Automotive Co., Ltd. (Headquarter)" },
  { id: 2, name_th: "Thai Summit Harness Co., Ltd." },
];

const INITIAL_MOCK_LEVELS = [
  { id: 1, level_code: "M1", level_title: "Manager 1" },
  { id: 2, level_code: "M2", level_title: "Manager 2" },
  { id: 3, level_code: "S1", level_title: "Senior Staff" },
  { id: 4, level_code: "S2", level_title: "Staff" },
];

// ✅ เพิ่ม Mock Data สำหรับแผนก
const INITIAL_MOCK_DEPARTMENTS = [
  { id: 1, name: "แผนกเทคโนโลยีสารสนเทศ (IT)" },
  { id: 2, name: "แผนกทรัพยากรบุคคล (HR)" },
  { id: 3, name: "แผนกบัญชีและการเงิน (Accounting)" },
];

// ✅ เพิ่ม department_id เข้าไปใน Mock Data ของ Position
const INITIAL_MOCK_POSITIONS = [
  { id: 1, title_th: "ผู้จัดการแผนกไอที", level_id: 1, department_id: 1, companyId: 1, isActive: true },
  { id: 2, title_th: "หัวหน้าฝ่ายบุคคล", level_id: 2, department_id: 2, companyId: 1, isActive: true },
  { id: 3, title_th: "โปรแกรมเมอร์อาวุโส", level_id: 3, department_id: 1, companyId: 1, isActive: true },
  { id: 4, title_th: "พนักงานบัญชี", level_id: 4, department_id: 3, companyId: 2, isActive: true },
];

export default function PositionPage() {
  const { currentCompanyId } = useAppStore();
  const [positions, setPositions] = useState<any[]>(INITIAL_MOCK_POSITIONS);
  const [levels, setLevels] = useState<any[]>(INITIAL_MOCK_LEVELS);
  const [departments, setDepartments] = useState<any[]>(INITIAL_MOCK_DEPARTMENTS); // ✅ State แผนก
  const [companies, setCompanies] = useState<any[]>(INITIAL_MOCK_COMPANIES);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // ✅ Position form (เพิ่ม department_id)
  const [posForm, setPosForm] = useState({
    title_th: "",
    level_id: 0,
    department_id: 0,
    companyId: 1,
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
    setPosForm({ 
      title_th: "", 
      level_id: levels[0]?.id ?? 0, 
      department_id: departments[0]?.id ?? 0, // ✅ Default แผนกแรก
      companyId: companies[0]?.id ?? 1 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      // ✅ เช็ค validation เพิ่มเติมสำหรับแผนก
      if (!posForm.title_th.trim() || !posForm.level_id || !posForm.department_id) {
        setFormError("กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อตำแหน่ง, ระดับ, แผนก)");
        setSaving(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      if (isEditMode && editingId) {
        setPositions((prev) => 
          prev.map((pos) => 
            pos.id === editingId 
              ? { ...pos, title_th: posForm.title_th, level_id: posForm.level_id, department_id: posForm.department_id, companyId: posForm.companyId }
              : pos
          )
        );
      } else {
        const newId = positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1;
        setPositions((prev) => [
          ...prev, 
          { id: newId, title_th: posForm.title_th, level_id: posForm.level_id, department_id: posForm.department_id, companyId: posForm.companyId, isActive: true }
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

  const handleEditPosition = (pos: any) => {
    setPosForm({
      title_th: pos.title_th,
      level_id: pos.level_id || 0,
      department_id: pos.department_id || 0, // ✅ เซ็ตค่าแผนกตอนแก้ไข
      companyId: pos.companyId,
    });
    setIsEditMode(true);
    setEditingId(pos.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeletePosition = async (id: number) => {
    if (!confirm("ยืนยันการลบตำแหน่งนี้ ?")) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    setPositions((prev) => prev.filter((p) => p.id !== id));
  };

  const getModalTitle = () => {
    return isEditMode ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่ง";
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Position Management
          </h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} />
          Add New Position
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <div className="flex items-center justify-center w-full gap-2 py-4 px-6 font-semibold border-b-2 border-blue-600 text-blue-600 bg-blue-50">
            <Users size={20} />
            Positions
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700">
              {positions.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          {positions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No positions found</p>
              <p className="text-slate-500 text-sm mt-1">Create your first position to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Position Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Level (ระดับ)</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Department (แผนก)</th>{/* ✅ เพิ่มหัวตารางแผนก */}
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {positions.map((pos) => {
                    const matchedLevel = levels.find(l => l.id === pos.level_id);
                    const matchedDept = departments.find(d => d.id === pos.department_id); // ✅ ค้นหาชื่อแผนก
                    return (
                    <tr key={pos.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {pos.id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{pos.title_th}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          {matchedLevel ? `${matchedLevel.level_code} - ${matchedLevel.level_title}` : "No Level"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {/* ✅ แสดงชื่อแผนก */}
                        <span className="text-sm text-slate-600">
                          {matchedDept ? matchedDept.name : "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${pos.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"}`}>
                          {pos.isActive ? "✓ Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEditPosition(pos)} className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeletePosition(pos.id)} className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">{getModalTitle()}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">{formError}</div>}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  ชื่อตำแหน่ง <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={posForm.title_th}
                  onChange={(e) => setPosForm({ ...posForm, title_th: e.target.value })}
                  placeholder="เช่น ผู้จัดการ"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Level (ระดับ) <span className="text-red-500">*</span>
                </label>
                <select
                  value={posForm.level_id}
                  onChange={(e) => setPosForm({ ...posForm, level_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value={0}>เลือก Level</option>
                  {levels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.level_code} - {lvl.level_title}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ เพิ่ม Dropdown สำหรับให้เลือกแผนก */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Department (แผนก) <span className="text-red-500">*</span>
                </label>
                <select
                  value={posForm.department_id}
                  onChange={(e) => setPosForm({ ...posForm, department_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value={0}>เลือกแผนก</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  บริษัท <span className="text-red-500">*</span>
                </label>
                <select
                  value={posForm.companyId}
                  onChange={(e) => setPosForm({ ...posForm, companyId: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name_th}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
