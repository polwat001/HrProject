'use client';

import { useState, useEffect } from 'react';
import { CalendarHeart, Palmtree, Clock, CheckCircle, XCircle, Loader, Plus, Calendar } from 'lucide-react';
// นำเข้าข้อมูลจำลองจากไฟล์ data (สมมติว่าไฟล์ที่คุณส่งมาชื่อ @/data/mock)
import { employees } from '@/data/mockData';

// --- Mock Data เพิ่มเติมสำหรับส่วน Leave ---
const mockLeaveRequests = [
  {
    id: 'lv-001',
    employeeId: 'emp-001',
    leaveTypeId: 'Business Leave',
    startDate: '2026-03-10',
    endDate: '2026-03-12',
    days: 3,
    status: 'pending',
    reason: 'ติดต่อทำธุระเรื่องบ้าน'
  },
  {
    id: 'lv-002',
    employeeId: 'emp-002',
    leaveTypeId: 'Sick Leave',
    startDate: '2026-03-05',
    endDate: '2026-03-05',
    days: 1,
    status: 'approved',
    reason: 'มีไข้ ปวดหัว'
  }
];

const mockHolidays = [
  { id: 'h-1', name: 'วันมาฆบูชา', date: '2026-03-03', type: 'national' },
  { id: 'h-2', name: 'Company Outing', date: '2026-03-25', type: 'company' },
  { id: 'h-3', name: 'วันจักรี', date: '2026-04-06', type: 'national' },
];

export default function LeavesPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'holidays'>('requests');
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    // จำลองการโหลดข้อมูลจาก Mock
    const loadMockData = () => {
      setLoading(true);
      setTimeout(() => {
        setLeaveRequests(mockLeaveRequests);
        setHolidays(mockHolidays);
        setLoading(false);
      }, 800); // หน่วงเวลาเพื่อให้เห็น Loading State
    };

    loadMockData();
  }, []);

  // ฟังก์ชันหาชื่อพนักงานจาก ID
  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : `Unknown (${id})`;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
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
          <p className="text-slate-600 font-medium">Loading leave data from mock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">🏖️ Leave & Holidays</h1>
          <p className="text-slate-600 mt-1">Manage leave requests and company holidays</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium">
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
              activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <CalendarHeart size={20} />
            Leave Requests ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'holidays' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-slate-600'
            }`}
          >
            <Palmtree size={20} />
            Holidays ({holidays.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'requests' ? (
            <div className="space-y-4">
              {leaveRequests.map((request) => (
                <div key={request.id} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {getEmployeeName(request.employeeId).charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{getEmployeeName(request.employeeId)}</h3>
                        <p className="text-xs text-slate-500">{request.leaveTypeId}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 my-4">
                    <div>
                      <p className="text-xs text-slate-500">From</p>
                      <p className="font-bold text-slate-700">{request.startDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">To</p>
                      <p className="font-bold text-slate-700">{request.endDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="font-bold text-blue-600">{request.days} days</p>
                    </div>
                  </div>

                  {request.reason && (
                    <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded">📝 {request.reason}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {holidays.map((holiday) => (
                <div key={holiday.id} className={`p-4 rounded-lg border flex items-center justify-between ${holiday.type === 'national' ? 'border-purple-200 bg-purple-50' : 'border-blue-200 bg-blue-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold ${holiday.type === 'national' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                      {holiday.date.split('-')[2]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{holiday.name}</h4>
                      <p className="text-sm text-slate-500">{holiday.date}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{holiday.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
