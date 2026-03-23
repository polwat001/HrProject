"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader, Hash, X, ShieldAlert } from "lucide-react";
import { LevelMock, INITIAL_MOCK_LEVELS, INITIAL_MOCK_POSITIONS } from "@/mocks/levelData";

export default function LevelPage() {
  const [levels, setLevels] = useState<LevelMock[]>(INITIAL_MOCK_LEVELS);
  const [positions, setPositions] = useState<any[]>(INITIAL_MOCK_POSITIONS);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [levelForm, setLevelForm] = useState({
    level_code: "",
    level_title: "",
    base_salary: "",
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
    setLevelForm({ level_code: "", level_title: "", base_salary: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!levelForm.level_code.trim() || !levelForm.level_title.trim()) {
        setFormError("กรุณากรอกข้อมูล Level ให้ครบถ้วน");
        setSaving(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      if (isEditMode && editingId) {
        setLevels((prev) =>
          prev.map((lvl) =>
            lvl.id === editingId
              ? { 
                  ...lvl, 
                  level_code: levelForm.level_code.toUpperCase(), 
                  level_title: levelForm.level_title,
                  base_salary: levelForm.base_salary || "-" 
                }
              : lvl
          )
        );
      } else {
        const newId = levels.length > 0 ? Math.max(...levels.map((l) => l.id)) + 1 : 1;
        setLevels((prev) => [
          ...prev,
          { 
            id: newId, 
            level_code: levelForm.level_code.toUpperCase(), 
            level_title: levelForm.level_title,
            base_salary: levelForm.base_salary || "-" 
          },
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

  const handleEditLevel = (level: LevelMock) => {
    setLevelForm({
      level_code: level.level_code,
      level_title: level.level_title,
      base_salary: level.base_salary !== "-" ? level.base_salary : "",
    });
    setIsEditMode(true);
    setEditingId(level.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteLevel = async (id: number) => {
    if (!confirm("ยืนยันการลบ Level นี้ ?")) return;
    await new Promise((resolve) => setTimeout(resolve, 300));
    setLevels((prev) => prev.filter((lvl) => lvl.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading levels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Levels Management</h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} />
          Add New Level
        </button>
      </div>

      {/* แถบสีม่วงด้านบนตาราง (ให้เหมือนหน้า Section) */}
      <div className="flex items-center justify-center w-full gap-2 py-3 border-b-2 border-purple-500 text-purple-600 bg-white font-semibold">
        <Hash size={20} />
        Levels (ระดับพนักงาน)
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
          {levels.length}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-0">
          {levels.length === 0 ? (
            <div className="text-center py-12">
              <Hash className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No levels found</p>
              <p className="text-slate-500 text-sm mt-1">Create your first level to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm w-24">ID</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm w-40">Level Code</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm w-48">Level Title</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm w-48">Salary Range</th>
                    <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Positions (ตำแหน่งที่เกี่ยวข้อง)</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-600 text-sm w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {levels.map((level) => {
                    const relatedPositions = positions.filter((p) => p.level_id === level.id);

                    return (
                      <tr key={level.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-semibold text-slate-800">{level.id}</td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded text-sm font-mono font-medium">
                            {level.level_code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-800 text-sm font-medium">{level.level_title}</td>
                        <td className="py-4 px-6 text-slate-600 text-sm font-mono">฿{level.base_salary}</td>
                        
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {relatedPositions.length > 0 ? (
                              relatedPositions.map((pos) => (
                                <span key={pos.id} className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-xs font-medium">
                                  {pos.title_th}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs  flex items-center gap-1">
                                <ShieldAlert size={12}/> ยังไม่มีตำแหน่งในระดับนี้
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => handleEditLevel(level)} className="text-purple-500 hover:text-purple-700 transition-colors" title="Edit Level">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteLevel(level.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Level">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditMode ? "Edit Level" : "Add New Level"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm text-red-600">{formError}</div>}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Level Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={levelForm.level_code}
                  onChange={(e) => setLevelForm({ ...levelForm, level_code: e.target.value })}
                  placeholder="เช่น M1, S1"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Level Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={levelForm.level_title}
                  onChange={(e) => setLevelForm({ ...levelForm, level_title: e.target.value })}
                  placeholder="เช่น Manager, Staff"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Base Salary Range (ออปชัน)
                </label>
                <input
                  type="text"
                  value={levelForm.base_salary}
                  onChange={(e) => setLevelForm({ ...levelForm, base_salary: e.target.value })}
                  placeholder="เช่น 30,000 - 50,000"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
                {saving ? <Loader size={16} className="animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}