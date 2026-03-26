'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FileSpreadsheet, Clock, Users, AlertCircle, Settings2 } from 'lucide-react';
import { REPORT_LIST, ReportConfig } from '@/mocks/reportData';
import ReportFilterModal from './components/ReportFilterModal';

export default function ReportsPage() {
  const { currentCompanyId } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(null);

  const categoryIcons = {
    payroll: { icon: <FileSpreadsheet size={20} className="text-purple-600" />, label: 'Payroll & Finance' },
    attendance: { icon: <Clock size={20} className="text-green-600" />, label: 'Attendance & Leave' },
    organization: { icon: <Users size={20} className="text-blue-600" />, label: 'Organization & Employee' },
  };

  const reportsByCategory = {
    payroll: REPORT_LIST.filter((r) => r.category === 'payroll'),
    attendance: REPORT_LIST.filter((r) => r.category === 'attendance'),
    organization: REPORT_LIST.filter((r) => r.category === 'organization'),
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen">
      
      <div>
        <h1 className="text-4xl font-black text-slate-900  tracking-tighter uppercase">Report Center</h1>
        <p className="text-slate-500 font-bold mt-1">ศูนย์รวมรายงาน สร้างและดาวน์โหลดข้อมูล (Mock Data)</p>
      </div>

      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><AlertCircle size={24} /></div>
        <div>
          <p className="font-black text-blue-900 uppercase tracking-widest text-sm">📋 Report Scope Configuration</p>
          <p className="text-sm font-bold text-blue-700/80 mt-1">
            รายงานทั้งหมดจะถูกดึงข้อมูลภายใต้{' '}
            <span className="font-black text-blue-700 underline decoration-blue-300 underline-offset-4">
              {currentCompanyId === null ? 'ทุกบริษัท (Consolidated View)' : 'บริษัทที่คุณกำลังเลือกใช้งานอยู่'}
            </span>
          </p>
        </div>
      </div>

      
      <div className="space-y-10">
        {(Object.entries(reportsByCategory) as Array<[keyof typeof reportsByCategory, ReportConfig[]]>).map(
          ([category, categoryReports]) => (
            <div key={category} className="space-y-6">
              
              <div className="flex items-center gap-3 pb-3 border-b-2 border-slate-200/60">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    {categoryIcons[category].icon}
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">{categoryIcons[category].label}</h2>
              </div>

              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-100/50 hover:border-blue-200 transition-all p-8 flex flex-col group cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center justify-center w-16 h-16 bg-slate-50 group-hover:bg-blue-50 rounded-xl transition-colors">
                        {report.icon}
                      </div>
                      <div className="text-slate-300 group-hover:text-blue-500 transition-colors p-2 bg-slate-50 group-hover:bg-blue-50 rounded-xl">
                          <Settings2 size={20} />
                      </div>
                    </div>
                    <h3 className="font-black text-slate-900 mb-2 text-lg  tracking-tight group-hover:text-blue-700 transition-colors">{report.title}</h3>
                    <p className="text-sm font-bold text-slate-400 leading-relaxed">{report.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      
      {selectedReport && (
        <ReportFilterModal 
          report={selectedReport} 
          isOpen={!!selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}
    </div>
  );
}
