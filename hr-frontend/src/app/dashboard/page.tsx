'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Briefcase,
  Loader,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ✅ Import mockdata จาก @/data
import {
  employees,
  headcountByCompany,
  headcountByDepartment,
  contractExpiring,
  attendanceData,
  otCostData,
} from '@/data/mockData'; // ปรับ path ให้ตรงกับโปรเจกต์

export default function DashboardPage() {
  const { currentCompanyId, user } = useAppStore();
  const [loading, setLoading] = useState(true);

  // ✅ คำนวณ stats จาก mockdata
  const filteredEmployees =
    currentCompanyId === null
      ? employees
      : employees.filter((e) => e.companyId === currentCompanyId);

  const stats = {
    totalHeadcount: filteredEmployees.length,
    activeEmployees: filteredEmployees.filter((e) => e.status === 'active').length,
    newJoiners: filteredEmployees.filter((e) => {
      const hireDate = new Date(e.hireDate);
      const now = new Date();
      return (
        hireDate.getMonth() === now.getMonth() &&
        hireDate.getFullYear() === now.getFullYear()
      );
    }).length,
    resignedThisMonth: 0,
  };

  // ✅ attendance จาก attendanceData (mock)
  const attendanceStats = {
    present: attendanceData.find((a) => a.name === 'มาทำงาน')?.value ?? 0,
    absent: attendanceData.find((a) => a.name === 'ขาด')?.value ?? 0,
    late: attendanceData.find((a) => a.name === 'สาย')?.value ?? 0,
    onLeave: attendanceData.find((a) => a.name === 'ลา')?.value ?? 0,
  };

  // ✅ headcount by company
  const headcountByCompanyData = headcountByCompany.map((item) => ({
    companyId: item.companyId,
    companyName: item.company,
    count: item.count,
  }));

  // ✅ headcount by department — กรองตาม currentCompanyId
  const headcountByDepartmentData =
    currentCompanyId && headcountByDepartment[currentCompanyId as keyof typeof headcountByDepartment]
      ? headcountByDepartment[currentCompanyId as keyof typeof headcountByDepartment].map((item) => ({
          departmentId: item.department,
          departmentName: item.department,
          count: item.count,
        }))
      : [];

  // ✅ OT cost summary จาก otCostData
  const otCostSummary = otCostData.map((item) => ({
    month: item.month,
    totalCost: item.amount,
    totalHours: Math.round(item.amount / 150), // สมมติค่าแรง OT 150/ชม
  }));

  // ✅ Contract expiring — map field ให้ตรง
  const contractExpiringData = contractExpiring.map((c) => ({
    employeeName: c.name,
    companyName: c.company,
    endDate: c.expireDate,
    daysRemaining: c.daysLeft,
  }));

  useEffect(() => {
    // simulate loading
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [currentCompanyId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.firstName}! 
          </h1>
          <p className="text-slate-600">Here's your HR performance overview for today</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Last updated just now</p>
        </div>
      </div>

      {/* Key Stats - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Headcount"
          value={stats.totalHeadcount}
          prevValue={145}
          icon={Users}
          trend="up"
          color="blue"
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          prevValue={120}
          icon={Briefcase}
          trend="up"
          color="green"
        />
        <StatCard
          title="Present Today"
          value={attendanceStats.present}
          prevValue={125}
          icon={Users}
          trend="down"
          color="purple"
        />
        <StatCard
          title="On Leave"
          value={attendanceStats.onLeave}
          prevValue={8}
          icon={AlertTriangle}
          trend="up"
          color="amber"
        />
      </div>

      {/* Main Grid - Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headcount Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Headcount Distribution</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {currentCompanyId === null ? 'By Company' : 'By Department'}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-semibold text-blue-700">Updated</span>
              </div>
            </div>

            {currentCompanyId === null ? (
              <div className="space-y-4">
                {headcountByCompanyData.map((item) => (
                  <div key={item.companyId} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">{item.companyName}</span>
                      <span className="text-sm font-bold text-slate-900">{item.count} employees</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min((item.count / 150) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {headcountByDepartmentData.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">
                    No department data for this company
                  </p>
                ) : (
                  headcountByDepartmentData.map((item) => (
                    <div key={item.departmentId} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">{item.departmentName}</span>
                        <span className="text-sm font-bold text-slate-900">{item.count} employees</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${Math.min((item.count / 20) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* OT Cost Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">OT Cost Trend</h3>
                <p className="text-sm text-slate-500 mt-1">Last 6 months</p>
              </div>
              <div className="px-3 py-1 bg-green-50 rounded-lg">
                <span className="text-xs font-semibold text-green-700">📈 Trending</span>
              </div>
            </div>
            <div className="space-y-3">
              {otCostSummary.map((item) => (
                <div key={item.month} className="group">
                  <div className="flex items-end gap-4 mb-2">
                    <span className="w-16 text-sm font-medium text-slate-700">{item.month}</span>
                    <div className="flex-1 bg-slate-100 rounded-lg h-8 relative overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                        style={{ width: `${Math.min((item.totalCost / 250000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-right w-32">
                      <p className="text-sm font-bold text-slate-900">
                        ฿{item.totalCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{item.totalHours}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Attendance Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Today's Attendance</h3>
              <p className="text-sm text-slate-500 mt-1">Live status</p>
            </div>
            <div className="space-y-3">
              <AttendanceTag label="Present" count={attendanceStats.present} color="green" />
              <AttendanceTag label="Absent" count={attendanceStats.absent} color="red" />
              <AttendanceTag label="Late" count={attendanceStats.late} color="amber" />
              <AttendanceTag label="On Leave" count={attendanceStats.onLeave} color="blue" />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-600">Attendance Rate</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {attendanceStats.present + attendanceStats.absent > 0
                    ? Math.round(
                        (attendanceStats.present /
                          (attendanceStats.present + attendanceStats.absent)) *
                          100,
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-sm font-bold text-blue-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">New Joiners</span>
                <span className="text-lg font-bold text-blue-900">{stats.newJoiners}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800">Resigned</span>
                <span className="text-lg font-bold text-blue-900">{stats.resignedThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts Expiring */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={24} />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Contracts Expiring Soon</h3>
              <p className="text-sm text-slate-600 mt-1">Next 30 days</p>
            </div>
          </div>
        </div>

        {contractExpiringData.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 font-medium">
              No contracts expiring in the next 30 days
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Employee</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Company</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">End Date</th>
                  <th className="text-center py-4 px-6 font-semibold text-slate-700">Days Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contractExpiringData.map((contract, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">{contract.employeeName}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{contract.companyName}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(contract.endDate).toLocaleDateString('th-TH')}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          contract.daysRemaining <= 7
                            ? 'bg-red-100 text-red-700'
                            : contract.daysRemaining <= 14
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {contract.daysRemaining} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({
  title,
  value,
  prevValue,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: number;
  prevValue: number;
  icon: any;
  trend: 'up' | 'down';
  color: 'blue' | 'green' | 'purple' | 'amber';
}) {
  const change = prevValue > 0
    ? Math.abs(((value - prevValue) / prevValue) * 100).toFixed(1)
    : '0.0';

  const colorMap = {
    blue: 'from-blue-50 to-blue-100 text-blue-600',
    green: 'from-green-50 to-green-100 text-green-600',
    purple: 'from-purple-50 to-purple-100 text-purple-600',
    amber: 'from-amber-50 to-amber-100 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-slate-600 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span className="font-semibold">{change}%</span>
        </div>
        <span className="text-slate-500">vs. last month</span>
      </div>
    </div>
  );
}

function AttendanceTag({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: 'green' | 'red' | 'amber' | 'blue';
}) {
  const colorMap = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${colorMap[color]}`}>{count}</span>
    </div>
  );
}
