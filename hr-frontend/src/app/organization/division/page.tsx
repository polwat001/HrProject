"use client";

import { useState, useEffect } from "react";
import { organizationAPI } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Users, X } from "lucide-react";
import type { Division } from "@/types";

export default function DivisionPage() {
  // ดึง companyId ปัจจุบันมาใช้เป็นค่าเริ่มต้นเบื้องหลัง
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<Division[]>([]);

  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State (เหลือแค่ชื่อฝ่าย)
  const [divisionForm, setDivisionForm] = useState({ name: "" });

  // โหลดข้อมูลเมื่อเข้าหน้าเว็บ หรือเมื่อ currentCompanyId เปลี่ยน
  useEffect(() => {
    loadDivisions();
  }, [currentCompanyId]);

  const loadDivisions = async () => {
    try {
      setLoading(true);
      // ส่ง currentCompanyId ไปให้ API กรองข้อมูลให้เลย
      const res = await organizationAPI.getDivisions(currentCompanyId || undefined);
      setDivisions(res.data);
    } catch (err) {
      console.error("Error loading divisions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    setDivisionForm({ name: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!divisionForm.name.trim()) {
        setFormError("กรุณากรอกชื่อฝ่าย");
        setSaving(false);
        return;
      }
      
      // แอบแนบ company_id ส่งไปหลังบ้านอัตโนมัติ (ถ้าไม่มีให้ default เป็น 1)
      const payload = { 
        name: divisionForm.name,
        company_id: currentCompanyId || 1 
      };

      if (isEditMode && editingId) {
        await organizationAPI.updateDivision(editingId, payload);
      } else {
        await organizationAPI.createDivision(payload);
      }
      
      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      await loadDivisions();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (division: Division) => {
    setIsEditMode(true);
    setEditingId(division.id);
    setFormError("");
    setDivisionForm({ name: division.name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`ยืนยันการลบ Division นี้?`)) return;
    try {
      await organizationAPI.deleteDivision(id);
      await loadDivisions();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || `ไม่สามารถลบได้ อาจมีข้อมูล Section ผูกอยู่`);
    }
  };

  const getModalTitle = () => {
    return isEditMode ? "แก้ไข Division" : "เพิ่ม Division";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading divisions...</p>
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
            Divisions Management
          </h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} />
          Add New Division
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">Divisions</h3>
          <p className="text-4xl font-bold text-blue-900">{divisions.length}</p>
          <p className="text-sm text-blue-700 mt-2">Total division units</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <div className="flex w-full items-center justify-center gap-2 py-4 px-6 font-semibold border-b-2 border-blue-600 text-blue-600 bg-blue-50">
            <Users size={20} />
            Divisions (ฝ่าย/สายงาน)
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700">
              {divisions.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Table */}
          {divisions.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No divisions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-700 w-24">ID</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Division Name</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {divisions.map((div) => (
                    <tr key={div.id} className="hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{div.id}</td>
                      <td className="py-4 px-6 text-slate-800">{div.name}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(div)} className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(div.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={16} /></button>
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <Users className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">{getModalTitle()}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">{formError}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Division Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={divisionForm.name}
                  onChange={(e) => setDivisionForm({ ...divisionForm, name: e.target.value })}
                  placeholder="เช่น สายงานผลิต, สายงานบริหาร"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
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
