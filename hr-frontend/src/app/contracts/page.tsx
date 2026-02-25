'use client';

import { useState, useEffect } from 'react';
import { contractAPI } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { FileText, AlertTriangle, CheckCircle, Clock, Loader, Plus, Download, Edit2, Trash2 } from 'lucide-react';
import type { Contract } from '@/types';

export default function ContractsPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await contractAPI.getContracts({
        companyId: currentCompanyId ?? undefined,
      });
      setContracts(res.data);
    } catch (err) {
      console.error('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getContractStatus = (endDate: string, contractStatus: string) => {
    if (contractStatus === 'expired') {
      return { type: 'expired', label: 'Expired', icon: AlertTriangle, color: 'bg-red-100 text-red-700 border-red-300' };
    }

    if (contractStatus === 'expiring_soon') {
      return { type: 'expiring', label: 'Expiring Soon', icon: AlertTriangle, color: 'bg-orange-100 text-orange-700 border-orange-300' };
    }

    if (contractStatus === 'active') {
      return { type: 'active', label: 'Active', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-300' };
    }

    if (contractStatus === 'renewed') {
      return { type: 'active', label: 'Renewed', icon: CheckCircle, color: 'bg-blue-100 text-blue-700 border-blue-300' };
    }

    return { type: 'active', label: 'Active', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-300' };
  };

  const filteredContracts = contracts.filter((contract) => {
    if (selectedStatus === 'all') return true;
    const status = getContractStatus(contract.endDate, contract.status);
    return status.type === selectedStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading contracts...</p>
        </div>
      </div>
    );
  }

  const activeCount = contracts.filter((c) => getContractStatus(c.endDate, c.status).type === 'active').length;
  const expiringCount = contracts.filter((c) => getContractStatus(c.endDate, c.status).type === 'expiring').length;
  const expiredCount = contracts.filter((c) => getContractStatus(c.endDate, c.status).type === 'expired').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">📋 Contract Management</h1>
          <p className="text-slate-600 mt-1">Manage employment contracts and renewals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus size={20} />
          New Contract
        </button>
      </div>

      {/* Status Filter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedStatus === 'all'
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-200 hover:border-blue-300 bg-white'
          }`}
        >
          <p className="text-sm font-medium text-slate-600 mb-1">All Contracts</p>
          <p className="text-3xl font-bold text-slate-900">{contracts.length}</p>
        </button>
        <button
          onClick={() => setSelectedStatus('active')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedStatus === 'active'
              ? 'border-green-600 bg-green-50'
              : 'border-slate-200 hover:border-green-300 bg-white'
          }`}
        >
          <p className="text-sm font-medium text-green-600 mb-1">✓ Active</p>
          <p className="text-3xl font-bold text-green-900">{activeCount}</p>
        </button>
        <button
          onClick={() => setSelectedStatus('expiring')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedStatus === 'expiring'
              ? 'border-orange-600 bg-orange-50'
              : 'border-slate-200 hover:border-orange-300 bg-white'
          }`}
        >
          <p className="text-sm font-medium text-orange-600 mb-1">⚠ Expiring Soon</p>
          <p className="text-3xl font-bold text-orange-900">{expiringCount}</p>
        </button>
        <button
          onClick={() => setSelectedStatus('expired')}
          className={`p-4 rounded-lg border-2 text-left transition-all ${
            selectedStatus === 'expired'
              ? 'border-red-600 bg-red-50'
              : 'border-slate-200 hover:border-red-300 bg-white'
          }`}
        >
          <p className="text-sm font-medium text-red-600 mb-1">✗ Expired</p>
          <p className="text-3xl font-bold text-red-900">{expiredCount}</p>
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-600 font-medium">No contracts found</p>
            <p className="text-slate-500 text-sm mt-1">Create your first contract to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Contract No</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Contract Type</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">Start Date</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">End Date</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">Status</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredContracts.map((contract) => {
                  const status = getContractStatus(contract.endDate, contract.status);
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded">
                          CN-{contract.id}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {String(contract.employeeId).charAt(0)}
                          </div>
                          <p className="font-semibold text-slate-900">Employee {contract.employeeId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-mono text-slate-600">{contract.startDate}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-mono font-bold text-slate-700">{contract.endDate}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${status.color}`}
                        >
                          <StatusIcon size={16} />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600">
                            <Edit2 size={16} />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
                            <Trash2 size={16} />
                          </button>
                          {status.type === 'expiring' && (
                            <button className="p-2 hover:bg-green-100 rounded transition-colors text-green-600" title="Renew">
                              <CheckCircle size={16} />
                            </button>
                          )}
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">📊 Renewal Tracking</h3>
          <p className="text-sm text-blue-700 mb-2">Time to review and renew expiring contracts</p>
          <p className="text-3xl font-bold text-blue-900">{expiringCount}</p>
          <p className="text-xs text-blue-700 mt-2">contracts due soon</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <h3 className="font-bold text-green-900 mb-3">✓ Active Workforce</h3>
          <p className="text-sm text-green-700 mb-2">Employees under active contracts</p>
          <p className="text-3xl font-bold text-green-900">{activeCount}</p>
          <p className="text-xs text-green-700 mt-2">employees</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
          <h3 className="font-bold text-red-900 mb-3">⚠️ Attention Needed</h3>
          <p className="text-sm text-red-700 mb-2">Contracts past expiration date</p>
          <p className="text-3xl font-bold text-red-900">{expiredCount}</p>
          <p className="text-xs text-red-700 mt-2">take action</p>
        </div>
      </div>
    </div>
  );
}
