'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FileSpreadsheet, FileText, Download, BarChart3, TrendingUp, Users, Clock, AlertCircle, Loader } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  formats: ('excel' | 'pdf')[];
  category: 'payroll' | 'attendance' | 'organization';
}

export default function ReportsPage() {
  const { currentCompanyId } = useAppStore();
  const [generating, setGenerating] = useState<string | null>(null);

  const reports: Report[] = [
    {
      id: 'employee-master',
      title: '👥 Employee Master List',
      description: 'Complete employee directory with personal and employment information',
      icon: <Users className="text-blue-600" size={32} />,
      formats: ['excel', 'pdf'],
      category: 'organization',
    },
    {
      id: 'attendance-summary',
      title: '⏱️ Attendance Summary',
      description: 'Monthly attendance records including absences, late arrivals, and OT',
      icon: <Clock className="text-green-600" size={32} />,
      formats: ['excel', 'pdf'],
      category: 'attendance',
    },
    {
      id: 'ot-report',
      title: '⚡ Overtime Report',
      description: 'Detailed OT logs and costs for payroll processing',
      icon: <TrendingUp className="text-purple-600" size={32} />,
      formats: ['excel', 'pdf'],
      category: 'payroll',
    },
    {
      id: 'headcount-analysis',
      title: '📊 Headcount Analysis',
      description: 'Organization structure and headcount trends by department',
      icon: <BarChart3 className="text-orange-600" size={32} />,
      formats: ['excel', 'pdf'],
      category: 'organization',
    },
    {
      id: 'leave-summary',
      title: '🏖️ Leave Summary',
      description: 'Employee leave balances and utilization report',
      icon: <FileText className="text-pink-600" size={32} />,
      formats: ['excel'],
      category: 'attendance',
    },
    {
      id: 'contract-status',
      title: '📋 Contract Status Report',
      description: 'Active contracts and renewal schedule',
      icon: <AlertCircle className="text-red-600" size={32} />,
      formats: ['excel', 'pdf'],
      category: 'organization',
    },
  ];

  const handleGenerate = async (reportId: string, format: 'excel' | 'pdf') => {
    setGenerating(`${reportId}-${format}`);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerating(null);
    // In real implementation, trigger download here
  };

  const categoryIcons = {
    payroll: { icon: <FileSpreadsheet size={20} className="text-blue-600" />, label: 'Payroll' },
    attendance: { icon: <Clock size={20} className="text-green-600" />, label: 'Attendance' },
    organization: { icon: <Users size={20} className="text-purple-600" />, label: 'Organization' },
  };

  const reportsByCategory = {
    payroll: reports.filter((r) => r.category === 'payroll'),
    attendance: reports.filter((r) => r.category === 'attendance'),
    organization: reports.filter((r) => r.category === 'organization'),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900"> Report Center</h1>
        <p className="text-slate-600 mt-1">Generate and export HR reports in multiple formats</p>
      </div>

      {/* Data Scope Notice */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
        <div>
          <p className="font-semibold text-blue-900">📋 Report Scope</p>
          <p className="text-sm text-blue-800 mt-1">
            Reports will include data from{' '}
            <span className="font-bold">
              {currentCompanyId === null ? 'all companies (Consolidated View)' : 'the currently selected company'}
            </span>
            . Change your company selection to generate reports for a specific entity.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="space-y-8">
        {(Object.entries(reportsByCategory) as Array<[keyof typeof reportsByCategory, Report[]]>).map(
          ([category, categoryReports]) => (
            <div key={category} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-200">
                {categoryIcons[category].icon}
                <h2 className="text-xl font-bold text-slate-900">{categoryIcons[category].label} Reports</h2>
              </div>

              {/* Category Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all p-6 flex flex-col"
                  >
                    {/* Icon */}
                    <div className="mb-4 flex items-center justify-center w-14 h-14 bg-slate-100 rounded-lg">
                      {report.icon}
                    </div>

                    {/* Content */}
                    <h3 className="font-bold text-slate-900 mb-2 text-lg">{report.title}</h3>
                    <p className="text-sm text-slate-600 mb-6 flex-grow">{report.description}</p>

                    {/* Format Buttons */}
                    <div className="flex gap-3">
                      {report.formats.includes('excel') && (
                        <button
                          onClick={() => handleGenerate(report.id, 'excel')}
                          disabled={generating === `${report.id}-excel`}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-300 hover:from-green-100 hover:to-green-200 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generating === `${report.id}-excel` ? (
                            <>
                              <Loader size={16} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FileSpreadsheet size={16} />
                              Excel
                            </>
                          )}
                        </button>
                      )}
                      {report.formats.includes('pdf') && (
                        <button
                          onClick={() => handleGenerate(report.id, 'pdf')}
                          disabled={generating === `${report.id}-pdf`}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-300 hover:from-red-100 hover:to-red-200 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generating === `${report.id}-pdf` ? (
                            <>
                              <Loader size={16} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <FileText size={16} />
                              PDF
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
          💡 Quick Tips
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• <strong>Excel format</strong> allows for further customization and analysis in spreadsheet applications</li>
          <li>• <strong>PDF format</strong> is ideal for printing, sharing, and archival purposes</li>
          <li>• All reports respect your current <strong>company selection</strong> filter</li>
          <li>• Switch to "All Companies" view in the header to generate consolidated reports</li>
        </ul>
      </div>
    </div>
  );
}
