"use client";

import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Loader, Filter, Map, X, CheckCircle2, XCircle } from "lucide-react";
import { Section, INITIAL_MOCK_SECTIONS, MOCK_DIVISIONS } from "@/mocks/sectionData";

export default function SectionPage() {
  const [sections, setSections] = useState<Section[]>(INITIAL_MOCK_SECTIONS);
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [filterDivision, setFilterDivision] = useState<string>("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    divisionId: "",
    managerName: "",
    status: "active" as "active" | "inactive",
  });

  // 🔍 กรองข้อมูลตาม Division ที่เลือก
  const filteredSections = useMemo(() => {
    if (filterDivision === "all") return sections;
    return sections.filter((s) => s.divisionId.toString() === filterDivision);
  }, [sections, filterDivision]);

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormError("");
    setFormData({ code: "", name: "", divisionId: "", managerName: "", status: "active" });
    setShowModal(true);
  };

  const handleEdit = (section: Section) => {
    setFormData({
      code: section.code,
      name: section.name,
      divisionId: section.divisionId.toString(),
      managerName: section.managerName,
      status: section.status,
    });
    setIsEditMode(true);
    setEditingId(section.id);
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบส่วนงานนี้?")) return;
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async () => {
    setFormError("");
    setSaving(true);

    try {
      if (!formData.name.trim() || !formData.code.trim() || !formData.divisionId) {
        setFormError("กรุณากรอกข้อมูลที่มีเครื่องหมาย (*) ให้ครบถ้วน");
        setSaving(false);
        return;
      }

      await new Promise((res) => setTimeout(res, 400)); // จำลองการโหลด

      const div = MOCK_DIVISIONS.find((d) => d.id.toString() === formData.divisionId);

      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        divisionId: Number(formData.divisionId),
        divisionName: div?.name || "-",
        managerName: formData.managerName || "-",
        status: formData.status,
      };

      if (isEditMode && editingId) {
        setSections((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
        );
      } else {
        const newId = sections.length > 0 ? Math.max(...sections.map((s) => s.id)) + 1 : 1;
        setSections((prev) => [...prev, { id: newId, totalDepartments: 0, headCount: 0, ...payload }]);
      }

      setShowModal(false);
    } catch (err) {
      setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header แบบในรูป */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Sections Management</h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> Add New Section
        </button>
      </div>

      {/* แถบสีม่วงด้านบนตาราง (เหมือนในรูป) */}
      <div className="flex items-center justify-center w-full gap-2 py-3 border-b-2 border-purple-500 text-purple-600 bg-white font-semibold">
        <Map size={20} />
        Sections (ส่วนงาน)
        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
          {sections.length}
        </span>
      </div>

      {/* กล่อง Filter (เหมือนในรูป) */}
      <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter size={18} />
          <span>Division:</span>
        </div>
        <select
          value={filterDivision}
          onChange={(e) => setFilterDivision(e.target.value)}
          className="flex-1 max-w-md border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all text-slate-700"
        >
          <option value="all">All Divisions</option>
          {MOCK_DIVISIONS.map((div) => (
            <option key={div.id} value={div.id}>
              {div.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">ID</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Code</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Section Name</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Division</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm">Manager</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Depts</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Headcount</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Status</th>
              <th className="py-4 px-6 font-semibold text-slate-600 text-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredSections.map((section) => (
              <tr key={section.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6 text-sm font-semibold text-slate-800">{section.id}</td>
                <td className="py-4 px-6 text-sm font-mono text-purple-600 font-medium">{section.code}</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-800">{section.name}</td>
                <td className="py-4 px-6 text-sm">
                  {/* Badge สีม่วงแบบในรูปเป๊ะๆ */}
                  <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-full text-xs font-medium">
                    {section.divisionName}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">{section.managerName}</td>
                <td className="py-4 px-6 text-sm text-center font-medium text-slate-700">{section.totalDepartments}</td>
                <td className="py-4 px-6 text-sm text-center font-medium text-slate-700">{section.headCount}</td>
                <td className="py-4 px-6 text-center">
                  {section.status === "active" ? (
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
                  {/* ไอคอน Edit/Delete สีม่วง/แดง แบบในรูป */}
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleEdit(section)} className="text-purple-500 hover:text-purple-700 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(section.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSections.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-10 text-slate-500 font-medium">
                  ไม่พบข้อมูลส่วนงาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {isEditMode ? "Edit Section" : "Add New Section"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสส่วนงาน (Code) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 uppercase"
                  placeholder="SEC-01"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อส่วนงาน (Section Name) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="เช่น ส่วนงานผลิต"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">สังกัดฝ่าย (Division) <span className="text-red-500">*</span></label>
                <select
                  value={formData.divisionId}
                  onChange={(e) => setFormData({ ...formData, divisionId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">-- เลือกฝ่ายต้นสังกัด --</option>
                  {MOCK_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>{div.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ผู้จัดการส่วนงาน (Manager)</label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="ชื่อผู้จัดการ (ถ้ามี)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">สถานะ (Status)</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="active">Active (ใช้งาน)</option>
                  <option value="inactive">Inactive (ระงับ)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}