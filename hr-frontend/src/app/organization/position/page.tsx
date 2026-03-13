"use client";

import { useState, useEffect } from "react";
import { organizationAPI } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Users, X } from "lucide-react";
import type { Position } from "@/types";

export default function PositionPage() {
  const { currentCompanyId } = useAppStore();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  
  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Position form
  const [posForm, setPosForm] = useState({
    title_th: "",
    level: "",
    companyId: 1,
  });

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [posRes, companyRes] = await Promise.all([
        organizationAPI.getPositions(),
        organizationAPI.getCompanies(),
      ]);

      setCompanies(companyRes.data);

      const mappedPositions = posRes.data.map((p: any) => ({
        id: p.id,
        name: p.title_th ?? "-",
        code: p.LEVEL ?? "-",
        companyId: p.company_id,
        companyName:
          companyRes.data.find((c: any) => c.id === p.company_id)?.name_th ??
          "-",
        isActive: true,
      }));

      setPositions(mappedPositions);
    } catch (err) {
      console.error("Error loading positions data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    setPosForm({ title_th: "", level: "", companyId: companies[0]?.id ?? 1 });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!posForm.title_th.trim()) {
        setFormError("กรุณากรอกชื่อตำแหน่ง");
        setSaving(false);
        return;
      }

      const payload = {
        title_th: posForm.title_th,
        LEVEL: posForm.level,
        company_id: posForm.companyId,
      };

      if (isEditMode && editingId) {
        await organizationAPI.updatePosition(editingId, payload);
      } else {
        await organizationAPI.createPosition(payload);
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

  const handleEditPosition = (pos: Position) => {
    setPosForm({
      title_th: pos.name,
      level: pos.code || "",
      companyId: pos.companyId,
    });
    setIsEditMode(true);
    setEditingId(pos.id);
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

  const getModalTitle = () => {
    return isEditMode ? "แก้ไขตำแหน่ง" : "เพิ่มตำแหน่ง";
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
            Loading positions...
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
          Add New Position
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-purple-900 mb-3">Positions</h3>
          <p className="text-4xl font-bold text-purple-900">
            {positions.length}
          </p>
          <p className="text-sm text-purple-700 mt-2">Total positions</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* แถบเมนูหัวตาราง Positions */}
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
                      ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Position Name
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Company
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
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {pos.id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">
                          {pos.name}
                        </p>
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

              {/* Position Form */}
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
                  placeholder="เช่น M1, S1"
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