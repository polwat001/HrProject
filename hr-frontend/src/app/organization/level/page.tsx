"use client";

import { useState, useEffect } from "react";
import { organizationAPI } from "@/services/api";
import { Plus, Edit2, Trash2, Loader, Users, X } from "lucide-react";

interface LevelAPI {
  id: number;
  level_code: string;
  level_title: string;
}

export default function LevelPage() {
  const [levels, setLevels] = useState<LevelAPI[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Level form (อิงตามฟิลด์ในฐานข้อมูล SQL)
  const [levelForm, setLevelForm] = useState({
    level_code: "",
    level_title: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  // ดึงข้อมูล Level จากฐานข้อมูลจริง
  const loadData = async () => {
    try {
      setLoading(true);
      const response = await organizationAPI.getLevels();
      setLevels(response.data);
    } catch (err) {
      console.error("Error loading level data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    setLevelForm({ level_code: "", level_title: "" });
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

      const payload = {
        level_code: levelForm.level_code,
        level_title: levelForm.level_title,
      };

      if (isEditMode && editingId) {
        await organizationAPI.updateLevel(editingId, payload);
      } else {
        await organizationAPI.createLevel(payload);
      }

      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      await loadData(); // โหลดข้อมูลใหม่หลังบันทึกเสร็จ
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditLevel = (level: LevelAPI) => {
    setLevelForm({
      level_code: level.level_code,
      level_title: level.level_title,
    });
    setIsEditMode(true);
    setEditingId(level.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteLevel = async (id: number) => {
    if (!confirm("ยืนยันการลบ Level นี้ ?")) return;
    try {
      await organizationAPI.deleteLevel(id);
      await loadData(); // โหลดข้อมูลใหม่หลังลบเสร็จ
    } catch (err) {
      console.error("Delete failed:", err);
      alert("ไม่สามารถลบได้ อาจมีข้อมูลตำแหน่ง (Position) ที่ผูกกับ Level นี้อยู่");
    }
  };

  const getModalTitle = () => {
    return isEditMode ? "แก้ไข Level" : "เพิ่ม Level";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading levels...</p>
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
          Add New Level
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-purple-900 mb-3">Levels</h3>
          <p className="text-4xl font-bold text-purple-900">
            {levels.length}
          </p>
          <p className="text-sm text-purple-700 mt-2">Total levels in system</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header Tab ของตาราง */}
        <div className="flex border-b border-slate-200">
          <div className="flex w-full items-center justify-center gap-2 py-4 px-6 font-semibold border-b-2 border-blue-600 text-blue-600 bg-blue-50">
            <Users size={20} />
             Levels
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700">
              {levels.length}
            </span>
          </div>
        </div>

        {/* ตาราง Levels */}
        <div className="p-6">
          {levels.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No levels found</p>
              <p className="text-slate-500 text-sm mt-1">
                Create your first level to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-700 w-24">ID</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Level Code</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Level Title</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {levels.map((level) => (
                    <tr
                      key={level.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {level.id}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {level.level_code}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        {level.level_title}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditLevel(level)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="Edit Level"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteLevel(level.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                            title="Delete Level"
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

      {/* Modal เพิ่ม / แก้ไข Level */}
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
                <Users size={20} className="text-blue-600" />
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

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Level Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={levelForm.level_code}
                  onChange={(e) =>
                    setLevelForm({ ...levelForm, level_code: e.target.value })
                  }
                  placeholder="เช่น M1, S1, H1"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase"
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