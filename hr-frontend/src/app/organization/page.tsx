'use client';

import { useState, useEffect } from 'react';
import { organizationAPI } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Edit2, Trash2, Loader, Briefcase, Users } from 'lucide-react';
import type { Department, Position } from '@/types';

export default function OrganizationPage() {
  const { currentCompanyId } = useAppStore();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'departments' | 'positions'>('departments');

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
      setDepartments(depRes.data);
      setPositions(posRes.data);
    } catch (err) {
      console.error('Error loading organization data:', err);
    } finally {
      setLoading(false);
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
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus size={20} />
          Add New
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
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Code</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Companies</th>
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
                            {pos.companyIds.length} companies
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              pos.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
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
    </div>
  );
}
