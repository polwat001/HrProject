'use client';

import { useState, useEffect } from 'react';
import { leaveAPI } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { CalendarHeart, Palmtree, Clock, CheckCircle, XCircle, AlertCircle, Loader, Plus, Calendar } from 'lucide-react';
import type { LeaveRequest } from '@/types';

export default function LeavesPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'holidays'>('requests');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsRes, holidaysRes] = await Promise.all([
        leaveAPI.getLeaveRequests(),
        leaveAPI.getHolidays(currentCompanyId ?? undefined),
      ]);
      setLeaveRequests(requestsRes.data);
      setHolidays(holidaysRes.data);
    } catch (err) {
      console.error('Error loading leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'Rejected':
        return <XCircle size={18} className="text-red-500" />;
      case 'Pending':
        return <Clock size={18} className="text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold border border-green-300">
            ✓ Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-300">
            ✗ Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-300">
            ⏳ Pending
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading leave data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🏖️ Leave & Holidays Management</h1>
          <p className="text-slate-600 mt-1">Manage leave requests and company holidays</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus size={20} />
          New Request
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'requests'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CalendarHeart size={20} />
            Leave Requests
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {leaveRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'holidays'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Palmtree size={20} />
            Holidays
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {holidays.length}
            </span>
          </button>
        </div>

        {/* Leave Requests Tab */}
        {activeTab === 'requests' && (
          <div className="p-6 space-y-4">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-12">
                <CalendarHeart className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No leave requests found</p>
                <p className="text-slate-500 text-sm mt-1">All leave requests will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-all hover:border-blue-300 bg-gradient-to-r from-white to-slate-50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {String(request.employeeId).charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">Employee {request.employeeId}</h3>
                            <p className="text-xs text-slate-500">Leave Type ID: {request.leaveTypeId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-slate-200">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">From Date</p>
                        <p className="font-mono text-sm font-bold text-slate-700">{request.startDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">To Date</p>
                        <p className="font-mono text-sm font-bold text-slate-700">{request.endDate}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">Duration</p>
                        <p className="font-bold text-lg text-purple-600">
                          {request.days} days
                        </p>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="mb-4">
                        <p className="text-xs text-slate-500 font-medium mb-1">Remarks</p>
                        <p className="text-sm text-slate-700 bg-blue-50 p-2 rounded border border-blue-100">{request.reason}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Leave Type Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
                <p className="text-sm text-blue-700 font-medium">Pending</p>
                <p className="text-2xl font-bold text-blue-900">
                  {leaveRequests.filter((r) => r.status === 'pending').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
                <p className="text-sm text-green-700 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-900">
                  {leaveRequests.filter((r) => r.status === 'approved').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
                <p className="text-sm text-red-700 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-900">
                  {leaveRequests.filter((r) => r.status === 'rejected').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
                <p className="text-sm text-purple-700 font-medium">Total</p>
                <p className="text-2xl font-bold text-purple-900">{leaveRequests.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Holidays Tab */}
        {activeTab === 'holidays' && (
          <div className="p-6 space-y-4">
            {holidays.length === 0 ? (
              <div className="text-center py-12">
                <Palmtree className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No holidays configured</p>
                <p className="text-slate-500 text-sm mt-1">Add company holidays to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className={`border rounded-lg p-4 flex items-start justify-between hover:shadow-md transition-all ${
                      holiday.type === 'national'
                        ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-purple-100'
                        : 'border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                          holiday.type === 'national'
                            ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                            : 'bg-gradient-to-br from-blue-400 to-blue-600'
                        }`}
                      >
                        {holiday.date.split('-')[2]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 mb-1">{holiday.name}</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Calendar size={16} />
                            <span className="font-mono">{holiday.date}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              holiday.type === 'national'
                                ? 'bg-purple-200 text-purple-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {holiday.type === 'national' ? '🌍 National' : '🏢 Company'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
