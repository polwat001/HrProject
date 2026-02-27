'use client';

import { useState, useEffect } from 'react';
import { organizationAPI } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Edit2, Trash2, Loader, Briefcase, Users, X } from 'lucide-react';
import type { Department, Position } from '@/types';

const COMPANIES = [
  { company_id: 1, name_th: 'บริษัท ทดสอบ จำกัด' },
];

export default function OrganizationPage() {
  const { currentCompanyId } = useAppStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'departments' | 'positions'>('departments');
  const [showModal, setShowModal] = useState(false);

  // Department form
  const [deptForm, setDeptForm] = useState({ name: '', costCenter: '', companyId: 1 });

  // Position form
  const [posForm, setPosForm] = useState({ title_th: '', level: '', companyId: 1 });

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [depRes, posRes] = await Promise.all([
        organizationAPI.getDepartments(currentCompanyId ?? undefined),
        organizationAPI.getPositions(),
      ]);

      const mappedDepartments = depRes.data.map((d: any) => ({
        id: d.id,
        name: d.NAME ?? '-',
        headCount: 0,
        costCenterCode: d.cost_center ?? '-',
        companyId: d.company_id,
        parentDeptId: d.parent_dept_id,
      }));

      const mappedPositions = posRes.data.map((p: any) => ({
        id: p.id,
        name: p.title_th ?? '-',
        code: p.LEVEL ?? '-',
        companyId: p.company_id,
        companyName: COMPANIES.find(c => c.company_id === p.company_id)?.name_th ?? '-',
        isActive: true,
      }));

      setDepartments(mappedDepartments);
      setPositions(mappedPositions);
    } catch (err) {
      console.error('Error loading organization data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormError('');
    setDeptForm({ name: '', costCenter: '', companyId: 1 });
    setPosForm({ title_th: '', level: '', companyId: 1 });
    setShowModal(true);
  };

  const handleSave = async () => {
    setFormError('');
    setSaving(true);
    try {
      if (selectedTab === 'departments') {
        if (!deptForm.name.trim()) {
          setFormError('กรุณากรอกชื่อแผนก');
          setSaving(false);
          return;
        }
        await organizationAPI.createDepartment({
          name: deptForm.name,
          costCenterCode: deptForm.costCenter,
          companyId: deptForm.companyId,
        });
      } else {
        if (!posForm.title_th.trim()) {
          setFormError('กรุณากรอกชื่อตำแหน่ง');
          setSaving(false);
          return;
        }
        await organizationAPI.createPosition({
          name: posForm.title_th,
          code: posForm.level,
          companyId: posForm.companyId,
        });
      }
      setShowModal(false);
      await loadData(); // reload ข้อมูลใหม่
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading organization structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🏢 Organization Structure</h1>
          <p className="text-slate-600 mt-1">Manage departments and positions</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} />
          Add New {selectedTab === 'departments' ? 'Department' : 'Position'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setSelectedTab('departments')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedTab === 'departments'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Briefcase size={20} />
            Departments
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {departments.length}
            </span>
          </button>
          <button
            onClick={() => setSelectedTab('positions')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedTab === 'positions'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users size={20} />
            Positions
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {positions.length}
            </span>
          </button>
        </div>

        {/* Departments Tab */}
        {selectedTab === 'departments' && (
          <div className="p-6">
            {departments.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No departments found</p>
                <p className="text-slate-500 text-sm mt-1">Create your first department to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300 group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {dept.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{dept.name}</h3>
                          <p className="text-xs text-slate-500">{dept.headCount} members</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Cost Center</span>
                        <span className="font-mono text-slate-700 font-semibold">
                          {dept.costCenterCode || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Positions Tab */}
        {selectedTab === 'positions' && (
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
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Position Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Level</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Company</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {positions.map((pos) => (
                      <tr
                        key={pos.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900">{pos.name}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {pos.code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {pos.companyName}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            pos.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {pos.isActive ? '✓ Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
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
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">📊 Departments</h3>
          <p className="text-4xl font-bold text-blue-900">{departments.length}</p>
          <p className="text-sm text-blue-700 mt-2">Total organizational units</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <h3 className="font-bold text-purple-900 mb-3">👔 Positions</h3>
          <p className="text-4xl font-bold text-purple-900">{positions.length}</p>
          <p className="text-sm text-purple-700 mt-2">Total job positions</p>
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
                {selectedTab === 'departments' ? (
                  <Briefcase size={20} className="text-blue-600" />
                ) : (
                  <Users size={20} className="text-blue-600" />
                )}
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedTab === 'departments' ? 'เพิ่มแผนกใหม่' : 'เพิ่มตำแหน่งใหม่'}
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

              {selectedTab === 'departments' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      ชื่อแผนก <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deptForm.name}
                      onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                      placeholder="เช่น ฝ่ายบุคคล"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Cost Center Code
                    </label>
                    <input
                      type="text"
                      value={deptForm.costCenter}
                      onChange={e => setDeptForm({ ...deptForm, costCenter: e.target.value })}
                      placeholder="เช่น CC001"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      บริษัท <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={deptForm.companyId}
                      onChange={e => setDeptForm({ ...deptForm, companyId: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {COMPANIES.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.name_th}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      ชื่อตำแหน่ง <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={posForm.title_th}
                      onChange={e => setPosForm({ ...posForm, title_th: e.target.value })}
                      placeholder="เช่น ผู้จัดการ"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      Level
                    </label>
                    <input
                      type="number"
                      value={posForm.level}
                      onChange={e => setPosForm({ ...posForm, level: e.target.value })}
                      placeholder="เช่น 1, 2, 3"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                      บริษัท <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={posForm.companyId}
                      onChange={e => setPosForm({ ...posForm, companyId: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {COMPANIES.map(c => (
                        <option key={c.company_id} value={c.company_id}>{c.name_th}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
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
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}