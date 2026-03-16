'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Calendar,
  Clock,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader,
  Filter,
} from 'lucide-react';

// ✅ Import mockdata
import { employees } from '@/data/mockData'; // ปรับ path ให้ตรง

// ===========================
// MOCK ATTENDANCE & OT DATA
// ===========================
const generateMockAttendance = (date: string) =>
  employees.map((emp, i) => {
    const statuses = ['present', 'present', 'present', 'late', 'absent', 'halfday'];
    const status = statuses[i % statuses.length];
    return {
      id: `att-${emp.id}-${date}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      companyId: emp.companyId,
      date,
      timeIn: status === 'absent' ? null : status === 'late' ? '09:30' : '08:00',
      timeOut: status === 'absent' ? null : '17:30',
      status,
    };
  });

const mockOTRecords = [
  { id: 'ot-1', employeeId: 'emp-001', employeeName: 'สมชาย วงศ์สวัสดิ์', employeeCode: 'A-0001', date: '2026-03-01', hours: 3, remarks: 'ปิดงบประจำเดือน', status: 'pending' },
  { id: 'ot-2', employeeId: 'emp-002', employeeName: 'สมหญิง ใจดี',        employeeCode: 'A-0002', date: '2026-03-02', hours: 2, remarks: 'Deploy production', status: 'approved' },
  { id: 'ot-3', employeeId: 'emp-005', employeeName: 'ประสิทธิ์ แก้วมณี',  employeeCode: 'A-0003', date: '2026-03-03', hours: 4, remarks: 'ซ่อมระบบ server', status: 'pending' },
  { id: 'ot-4', employeeId: 'emp-006', employeeName: 'อรุณ ศรีสุข',        employeeCode: 'C-0001', date: '2026-03-01', hours: 5, remarks: 'Production overtime', status: 'rejected' },
  { id: 'ot-5', employeeId: 'emp-008', employeeName: 'ธนา รุ่งเรือง',      employeeCode: 'A-0004', date: '2026-03-04', hours: 2, remarks: 'Campaign launch', status: 'pending' },
];

export default function AttendancePage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'ot'>('logs');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
  const [otRecords, setOtRecords] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [currentCompanyId, selectedDate]);

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      // ✅ กรองตาม currentCompanyId ถ้ามี
      const logs = generateMockAttendance(selectedDate).filter((r) =>
        currentCompanyId ? employees.find((e) => e.id === r.employeeId)?.companyId === `company-${currentCompanyId}` : true,
      );
      const ots = mockOTRecords.filter((r) =>
        currentCompanyId ? employees.find((e) => e.id === r.employeeId)?.companyId === `company-${currentCompanyId}` : true,
      );
      setAttendanceLogs(logs);
      setOtRecords(ots);
      setLoading(false);
    }, 300);
  };

  // ✅ OT approve/reject (mock state update)
  const handleOTAction = (id: string, action: 'approved' | 'rejected') => {
    setOtRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: action } : r)),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':  return <CheckCircle size={18} className="text-green-500" />;
      case 'late':     return <AlertTriangle size={18} className="text-orange-500" />;
      case 'absent':   return <XCircle size={18} className="text-red-500" />;
      case 'halfday':  return <AlertTriangle size={18} className="text-yellow-500" />;
      default:         return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border border-green-300';
      case 'late':    return 'bg-orange-100 text-orange-700 border border-orange-300';
      case 'absent':  return 'bg-red-100 text-red-700 border border-red-300';
      case 'halfday': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      default:        return 'bg-slate-100 text-slate-700';
    }
  };

  const getOTStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">✓ Approved</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">✗ Rejected</span>;
      case 'pending':  return <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">⏳ Pending</span>;
      default:         return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">⏱️ Attendance Management</h1>
          <p className="text-slate-600 mt-1">Track employee attendance and overtime approvals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Upload size={20} />
          Import Records
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'logs'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Calendar size={20} />
            Attendance Logs
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {attendanceLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('ot')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ot'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Clock size={20} />
            OT Requests
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {otRecords.filter((r) => r.status === 'pending').length}
            </span>
          </button>
        </div>

        {/* Attendance Logs Tab */}
        {activeTab === 'logs' && (
          <div className="p-6 space-y-6">
            {/* Date Filter */}
            <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
              <Filter size={20} className="text-slate-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <div className="ml-auto flex items-center gap-2 text-sm text-slate-600">
                <span className="font-semibold">Showing records for:</span>
                <span className="font-mono bg-white px-3 py-1 rounded border border-slate-300">{selectedDate}</span>
              </div>
            </div>

            {/* Table */}
            {attendanceLogs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No attendance records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee Code</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Check In</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Check Out</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Hours Worked</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {attendanceLogs.map((record) => {
                      const checkIn  = record.timeIn  ? new Date(`2000-01-01 ${record.timeIn}`)  : null;
                      const checkOut = record.timeOut ? new Date(`2000-01-01 ${record.timeOut}`) : null;
                      const hoursWorked = checkIn && checkOut
                        ? ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)).toFixed(1)
                        : '-';

                      return (
                        <tr key={record.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors">
                          {/* ✅ แสดงชื่อจริงจาก mockdata */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {record.employeeName.charAt(0)}
                              </div>
                              <p className="font-semibold text-slate-900">{record.employeeName}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              {record.employeeCode}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-mono font-semibold text-slate-700">
                              {record.timeIn || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-mono font-semibold text-slate-700">
                              {record.timeOut || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-semibold text-slate-700">{hoursWorked} hrs</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(record.status)}
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(record.status)}`}>
                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stats Footer */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
                <p className="text-sm text-green-700 font-medium">Present</p>
                <p className="text-2xl font-bold text-green-900">
                  {attendanceLogs.filter((r) => r.status === 'present').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-4">
                <p className="text-sm text-orange-700 font-medium">Late Arrivals</p>
                <p className="text-2xl font-bold text-orange-900">
                  {attendanceLogs.filter((r) => r.status === 'late').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
                <p className="text-sm text-red-700 font-medium">Absences</p>
                <p className="text-2xl font-bold text-red-900">
                  {attendanceLogs.filter((r) => r.status === 'absent').length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
                <p className="text-sm text-blue-700 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-blue-900">{attendanceLogs.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* OT Requests Tab */}
        {activeTab === 'ot' && (
          <div className="p-6">
            {otRecords.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No OT requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Date</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Hours</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Remarks</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {otRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors">
                        {/* ✅ แสดงชื่อและรหัสพนักงานจริง */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {record.employeeName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{record.employeeName}</p>
                              <p className="text-xs text-slate-500 font-mono">{record.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-slate-600">{record.date}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-bold text-slate-900">{record.hours}h</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-sm text-slate-600">{record.remarks || '-'}</span>
                        </td>
                        <td className="py-4 px-6 text-center">{getOTStatusBadge(record.status)}</td>
                        <td className="py-4 px-6 text-center">
                          {record.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              {/* ✅ Approve/Reject อัปเดต state จริง */}
                              <button
                                onClick={() => handleOTAction(record.id, 'approved')}
                                className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold text-sm transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleOTAction(record.id, 'rejected')}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
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
    </div>
  );
}
