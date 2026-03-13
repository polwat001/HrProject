"use client";

import { useState, useEffect } from "react";
import { organizationAPI } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Briefcase, X, Filter } from "lucide-react";
import type { Division, Section } from "@/types";

export default function SectionPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  
  // ✅ กำหนดค่าเริ่มต้นเป็น 0 (All Divisions)
  const [filterDivisionId, setFilterDivisionId] = useState<number>(0);

  // Modal & Edit State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [sectionForm, setSectionForm] = useState({ name: "", division_id: 0 });

  useEffect(() => {
    loadInitialData();
  }, [currentCompanyId]);

  useEffect(() => {
    loadSections();
  }, [filterDivisionId, currentCompanyId]); // โหลดใหม่เมื่อเปลี่ยน Filter หรือเปลี่ยนบริษัท

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // โหลด Divisions ของบริษัทปัจจุบันมาเป็นตัวเลือกใน Dropdown
      const resDivisions = await organizationAPI.getDivisions(currentCompanyId || undefined); 
      setDivisions(resDivisions.data);
      
      // ✅ ไม่ต้องบังคับเซ็ตค่า Division แรกแล้ว ปล่อยให้เป็น 0 (All Divisions) ต่อไป
    } catch (err) {
      console.error("Error loading divisions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSections = async () => {
    try {
      setLoading(true);
      // ส่ง filterDivisionId ไป ถ้าเป็น 0 Backend จะไม่ query WHERE division_id (ดึงมาทั้งหมด)
      const res = await organizationAPI.getSections(filterDivisionId || undefined);
      setSections(res.data);
    } catch (err) {
      console.error("Error loading sections:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    
    // ถ้า Filter เป็น All Divisions อยู่ ตอนกดเพิ่มให้บังคับเลือกใหม่ (ค่าเริ่มต้น 0)
    // แต่ถ้า Filter เลือก Division ไหนอยู่ ให้เอาค่านั้นมาเป็นค่าเริ่มต้นในฟอร์มเลย
    setSectionForm({ 
      name: "", 
      division_id: filterDivisionId !== 0 ? filterDivisionId : (divisions[0]?.id || 0) 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!sectionForm.name.trim() || !sectionForm.division_id) {
        setFormError("กรุณากรอกชื่อส่วนงานและเลือกฝ่าย (Division)");
        setSaving(false);
        return;
      }
      
      const payload = { ...sectionForm };
      if (isEditMode && editingId) {
        await organizationAPI.updateSection(editingId, payload);
      } else {
        await organizationAPI.createSection(payload);
      }
      
      setShowModal(false);
      setIsEditMode(false);
      setEditingId(null);
      await loadSections();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (section: Section) => {
    setIsEditMode(true);
    setEditingId(section.id);
    setFormError("");
    setSectionForm({ name: section.name, division_id: section.division_id });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`ยืนยันการลบ Section นี้?`)) return;
    try {
      await organizationAPI.deleteSection(id);
      await loadSections();
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || `ไม่สามารถลบได้ อาจมีข้อมูล Department ผูกอยู่`);
    }
  };

  const getModalTitle = () => {
    return isEditMode ? "แก้ไข Section" : "เพิ่ม Section";
  };

  if (loading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sections Management</h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} />
          Add New Section
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-purple-900 mb-3">Sections</h3>
          <p className="text-4xl font-bold text-purple-900">{sections.length}</p>
          <p className="text-sm text-purple-700 mt-2">Total section units</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <div className="flex w-full items-center justify-center gap-2 py-4 px-6 font-semibold border-b-2 border-purple-600 text-purple-600 bg-purple-50">
            <Briefcase size={20} />
            Sections (ส่วนงาน)
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700">
              {sections.length}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 mb-6 bg-slate-50 rounded-xl border border-slate-200">
            <Filter size={20} className="text-slate-500" />
            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium text-slate-600">Division:</label>
              <select 
                value={filterDivisionId} 
                onChange={(e) => setFilterDivisionId(Number(e.target.value))}
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={0}>All Divisions</option>
                {divisions.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No sections found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="py-4 px-6 font-semibold text-slate-700 w-24">ID</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Section Name</th>
                    <th className="py-4 px-6 font-semibold text-slate-700">Division</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sections.map((sec) => (
                    <tr key={sec.id} className="hover:bg-purple-50 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{sec.id}</td>
                      <td className="py-4 px-6 text-slate-800">{sec.name}</td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {divisions.find(d => d.id === sec.division_id)?.name || "Unknown"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(sec)} className="p-2 hover:bg-blue-100 rounded-lg text-purple-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(sec.id)} className="p-2 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={16} /></button>
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
                <Briefcase className="text-purple-600" />
                <h3 className="text-lg font-bold text-slate-900">{getModalTitle()}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && <div className="bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded text-sm text-red-700">{formError}</div>}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Division <span className="text-red-500">*</span></label>
                <select 
                  value={sectionForm.division_id} 
                  onChange={(e) => setSectionForm({ ...sectionForm, division_id: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0}>Select Division</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Section Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                  placeholder="เช่น ส่วนงานบัญชี, ส่วนงานจัดซื้อ"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg">ยกเลิก</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg disabled:opacity-50">
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