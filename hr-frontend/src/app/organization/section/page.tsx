"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Plus, Edit2, Trash2, Loader, Briefcase, X, Filter } from "lucide-react";
import type { Division, Section } from "@/types";

// ==========================================
// 📦 MOCK DATA (ข้อมูลตั้งต้น)
// ==========================================
const INITIAL_MOCK_DIVISIONS: Division[] = [
  { id: 1, name: "สายงานบริหาร (Administration)", company_id: 1 },
  { id: 2, name: "สายงานการตลาดและการขาย (Marketing & Sales)", company_id: 1 },
  { id: 3, name: "สายงานปฏิบัติการ (Operations)", company_id: 1 },
  { id: 4, name: "สายงานเทคโนโลยีสารสนเทศ (IT)", company_id: 1 },
  { id: 5, name: "สายงานทรัพยากรบุคคล (Human Resources)", company_id: 1 },
];

const INITIAL_MOCK_SECTIONS: any[] = [
  { id: 1, name: "ส่วนงานบัญชี", division_id: 1 },
  { id: 2, name: "ส่วนงานจัดซื้อ", division_id: 1 },
  { id: 3, name: "ส่วนงานการขายในประเทศ", division_id: 2 },
  { id: 4, name: "ส่วนงานการขายต่างประเทศ", division_id: 2 },
  { id: 5, name: "ส่วนงานการตลาดดิจิทัล", division_id: 2 },
  { id: 6, name: "ส่วนงานผลิต", division_id: 3 },
  { id: 7, name: "ส่วนงานคลังสินค้า", division_id: 3 },
  { id: 8, name: "ส่วนงานซัพพอร์ต", division_id: 4 },
  { id: 9, name: "ส่วนงานพัฒนาซอฟต์แวร์", division_id: 4 },
  { id: 10, name: "ส่วนงานสรรหาว่าจ้าง", division_id: 5 },
];

export default function SectionPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  
  // ✅ ใช้ Mock Data เป็นค่าเริ่มต้น
  const [divisions, setDivisions] = useState<Division[]>(INITIAL_MOCK_DIVISIONS);
  const [sections, setSections] = useState<Section[]>(INITIAL_MOCK_SECTIONS);
  
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

  // โหลดข้อมูลเบื้องต้น
  const loadInitialData = () => {
    setLoading(true);
    setTimeout(() => {
      // ในระบบจริง จะต้อง setDivisions ตาม companyId แต่ตอนนี้ให้มันดึง Mock ทั้งหมดมา
      setDivisions(INITIAL_MOCK_DIVISIONS);
      setLoading(false);
    }, 500);
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    
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
      
      // จำลองเวลาบันทึกข้อมูล
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (isEditMode && editingId) {
        // ✅ อัปเดตข้อมูล
        setSections((prev) => 
          prev.map((sec) => sec.id === editingId ? { ...sec, ...sectionForm } : sec)
        );
      } else {
        // ✅ สร้างใหม่
        const newId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
        const newSection: Section = {
          id: newId,
          name: sectionForm.name,
          division_id: sectionForm.division_id
        };
        setSections((prev) => [...prev, newSection]);
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

  const handleEdit = (section: Section) => {
    setIsEditMode(true);
    setEditingId(section.id);
    setFormError("");
    setSectionForm({ name: section.name, division_id: section.division_id });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`ยืนยันการลบ Section นี้?`)) return;
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSections((prev) => prev.filter((sec) => sec.id !== id));
  };

  const getModalTitle = () => {
    return isEditMode ? "แก้ไข Section" : "เพิ่ม Section";
  };

  // ✅ ตัวกรองข้อมูลเพื่อนำไปใช้โชว์ตาราง
  const filteredSections = useMemo(() => {
    if (filterDivisionId === 0) return sections;
    return sections.filter(sec => sec.division_id === filterDivisionId);
  }, [sections, filterDivisionId]);

  if (loading) {
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

    

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <div className="flex w-full items-center justify-center gap-2 py-4 px-6 font-semibold border-b-2 border-purple-600 text-purple-600 bg-purple-50">
            <Briefcase size={20} />
            Sections (ส่วนงาน)
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold text-slate-700">
              {filteredSections.length}
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
          {filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
              <p className="text-slate-600 font-medium">No sections found for the selected division</p>
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
                  {filteredSections.map((sec) => (
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