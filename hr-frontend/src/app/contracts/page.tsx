"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/locales/translations";
import {
  Plus, Edit2, Trash2, Loader, AlertTriangle, CheckCircle, Recycle, X, Search, Filter, Briefcase, BadgeCheck
} from "lucide-react";

// ✅ Import ข้อมูลจำลองและตัวแปรคงที่จากไฟล์ Mock
import { CONTRACT_TYPES, MOCK_COMPANIES, MOCK_EMPLOYEES, MOCK_CONTRACTS } from "@/mocks/contractData";

const EMPTY_FORM = {
  employee_id: "",
  company_id: "",
  contract_number: "",
  contract_type: "employment", 
  start_date: "",
  end_date: "",
  status: "active"
};

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================
export default function ContractsPage() {
  const { currentCompanyId, language } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  // Search & Filter
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all", division: "all", section: "all", department: "all", position: "all", level: "all"
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const t = translations[language as keyof typeof translations] || translations['en'];

  // ================= LOAD MOCK DATA =================
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmployees(MOCK_EMPLOYEES);
      setCompanies(MOCK_COMPANIES);

      const mappedContracts = MOCK_CONTRACTS.map((c) => {
        const employee = MOCK_EMPLOYEES.find((e) => e.id === c.employee_id);
        const company = MOCK_COMPANIES.find((co) => co.id === c.company_id);

        if (currentCompanyId && c.company_id !== currentCompanyId) return null;

        return {
          ...c,
          employee_name: employee ? `${employee.firstname_th} ${employee.lastname_th}` : "-",
          employee_code: employee?.employee_code || "",
          department_name: employee?.department_name || "-",
          position_name: employee?.position_name || "-",
          company_name: company?.name_th ?? "-",
        };
      }).filter(Boolean);

      setContracts(mappedContracts as any[]);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  // ================= LOGIC & HELPERS =================
  const getContractStatus = (status: string) => {
    if (status === "terminated") return { type: "terminated", label: t.contractTerminated || "Terminated", icon: AlertTriangle, color: "bg-red-100 text-red-700 border-red-300" };
    if (status === "expiring") return { type: "expiring", label: t.contractExpiring || "Expiring Soon", icon: AlertTriangle, color: "bg-orange-100 text-[#F5A10A] border-orange-300" };
    if (status === "expired") return { type: "expired", label: t.contractExpired || "Expired", icon: AlertTriangle, color: "bg-slate-100 text-slate-500 border-slate-300" };
    if (status === "renewed") return { type: "renewed", label: t.contractRenewed || "Renewed", icon: Recycle, color: "bg-blue-100 text-blue-700 border-blue-300" };
    return { type: "active", label: t.contractActive || "Active", icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-300" };
  };

  const getContractTypeBadge = (typeValue: string) => {
    const typeDef = CONTRACT_TYPES.find((t) => t.value === typeValue) || CONTRACT_TYPES[0];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${typeDef.color}`}>
        {typeDef.label.split(" (")[0]}
      </span>
    );
  };

  const filteredContracts = contracts.filter((contract: any) => {
    const matchesSearch = searchQuery === "" || 
      `${contract.employee_name} ${contract.employee_code} ${contract.department_name} ${contract.position_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === "all" || contract.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const handleClearFilters = () => {
    setFilters({ status: "all", division: "all", section: "all", department: "all", position: "all", level: "all" });
    setSearchQuery("");
  };

  // ================= SAVE CONTRACT =================
  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.company_id || !formData.contract_number || !formData.contract_type || !formData.start_date || !formData.end_date) {
      alert(t.errFormIncomplete || "กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const selectedEmp = employees.find(emp => emp.id === Number(formData.employee_id));
      const selectedCompany = companies.find(c => c.id === Number(formData.company_id));

      const newContract = {
        id: Math.floor(Math.random() * 10000), 
        employee_id: Number(formData.employee_id),
        company_id: Number(formData.company_id),
        contract_number: formData.contract_number.toUpperCase(),
        contract_type: formData.contract_type, 
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status,
        employee_name: selectedEmp ? `${selectedEmp.firstname_th} ${selectedEmp.lastname_th}` : "-",
        employee_code: selectedEmp?.employee_code || "",
        department_name: selectedEmp?.department_name || "-",
        position_name: selectedEmp?.position_name || "-",
        company_name: selectedCompany?.name_th || "-",
      };

      setContracts([newContract, ...contracts]);
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      setEmployeeSearch("");
      setSaving(false);
    }, 400);
  };

  // ================= DELETE =================
  const handleDelete = (id: number) => {
    if (!confirm(t.confirmDeleteContract || "ยืนยันการลบสัญญาฉบับนี้?")) return;
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.firstname_th} ${emp.lastname_th} ${emp.employee_code}`.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">{t.loadingContracts || "Loading contracts..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{t.titleContract || "Contracts Management"}</h1>
          <p className="text-slate-500 font-medium text-sm">จัดการข้อมูลสัญญาจ้างพนักงาน</p>
        </div>
        <button 
          onClick={() => {
            setFormData({...EMPTY_FORM, company_id: currentCompanyId?.toString() || ""});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-black text-sm uppercase tracking-widest"
        >
          <Plus size={18} /> {t.btnNewContract || "Add Contract"}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t.phSearchContract || "ค้นหาชื่อ, รหัสพนักงาน, แผนก..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3 border rounded-xl text-sm font-black uppercase tracking-widest transition-all w-full md:w-auto ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Filter size={16} /> {t.btnFilters || "Filters"}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">{t.filterCriteria || "Filter Criteria"}</h3>
              <button onClick={handleClearFilters} className="text-[10px] uppercase font-black tracking-widest text-red-500 hover:text-red-700 transition-colors">
                {t.clearAllFilters || "Clear All"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblStatus || "Status"}</label>
                <select 
                  value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="all">{t.allStatuses || "All Statuses"}</option>
                  <option value="active">{t.contractActive || "Active"}</option>
                  <option value="renewed">{t.contractRenewed || "Renewed"}</option>
                  <option value="expiring">{t.contractExpiring || "Expiring Soon"}</option>
                  <option value="expired">{t.contractExpired || "Expired"}</option>
                  <option value="terminated">{t.contractTerminated || "Terminated"}</option>
                </select>
              </div>

              {/* Department (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblDepartment || "Department"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allDepartments || "All Departments"}</option>
                </select>
              </div>

              {/* Position (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblPosition || "Position"}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allPositions || "All Positions"}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] tracking-widest font-black text-slate-400">
                <th className="text-left py-5 px-6">{t.colEmployee || "Employee"}</th>
                <th className="text-left py-5 px-6">แผนก (Department)</th>
                <th className="text-left py-5 px-6">ตำแหน่ง (Position)</th>
                <th className="text-center py-5 px-6">ประเภทสัญญา (Type)</th>
                <th className="text-center py-5 px-6">{t.lblStartDate || "Start Date"}</th>
                <th className="text-center py-5 px-6">{t.lblEndDate || "End Date"}</th>
                <th className="text-center py-5 px-6">{t.colStatus || "Status"}</th>
                <th className="text-center py-5 px-6">{t.colAction || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredContracts.map((contract: any) => {
                const status = getContractStatus(contract.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={contract.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900 leading-tight">{contract.employee_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{contract.employee_code}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl">
                        <Briefcase size={12} /> {contract.department_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                        <BadgeCheck size={12} /> {contract.position_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getContractTypeBadge(contract.contract_type)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-sm text-slate-600">
                      {new Date(contract.start_date).toLocaleDateString(language === 'th' ? "th-TH" : "en-GB")}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-sm text-slate-600">
                      {contract.end_date ? new Date(contract.end_date).toLocaleDateString(language === 'th' ? "th-TH" : "en-GB") : "-"}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                        <StatusIcon size={14} /> {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(Number(contract.id))} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <AlertTriangle className="mx-auto text-slate-300 mb-3" size={48} />
                    <p className="text-slate-400 font-black uppercase tracking-widest">{t.noContracts || "No Contracts Found"}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ MODAL FOR CREATING CONTRACT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !saving && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter ">
                <Plus size={24} className="text-blue-600"/> {t.addContract || "New Contract"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveContract} className="p-8 space-y-5">
              
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lblEmployee || "Employee"} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={t.phSearchEmp || "ค้นหาพนักงานเพื่อสร้างสัญญา..."}
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setFormData({ ...formData, employee_id: "" });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none transition-all ${!formData.employee_id && employeeSearch ? 'ring-2 ring-red-400 bg-red-50' : 'focus:ring-2 focus:ring-blue-500'}`}
                  />
                </div>
                {employeeSearch && !formData.employee_id && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto p-2">
                    {filteredEmployees.map(emp => (
                      <div
                        key={emp.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer rounded-xl transition-colors flex items-center gap-3"
                        onClick={() => {
                          setFormData({ ...formData, employee_id: emp.id.toString() });
                          setEmployeeSearch(`${emp.employee_code} - ${emp.firstname_th} ${emp.lastname_th}`);
                        }}
                      >
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">{emp.firstname_th.charAt(0)}</div>
                        <div>
                            <span className="text-slate-800 font-bold text-sm block leading-none">{emp.firstname_th} {emp.lastname_th}</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{emp.employee_code}</span> 
                        </div>
                      </div>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <div className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">{t.notFound || "Not found"}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lblCompanyFilter || "Company"} <span className="text-red-500">*</span></label>
                <select 
                  value={formData.company_id} 
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="">{t.selCompany || "เลือกบริษัท..."}</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name_th}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทสัญญา (Contract Type) <span className="text-red-500">*</span></label>
                <select 
                  value={formData.contract_type} 
                  onChange={(e) => setFormData({...formData, contract_type: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lblContractNum || "Contract No."} <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder={t.phContractNum || "เช่น CT-2026-001"}
                  value={formData.contract_number}
                  onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lblStartDate || "Start Date"} <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.lblEndDate || "End Date"} <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 text-slate-400 font-black tracking-widest uppercase text-[10px] hover:bg-slate-100 rounded-xl transition-all">{t.btnCancel || "Cancel"}</button>
                <button type="submit" disabled={saving || !formData.employee_id} className="flex-1 py-3.5 bg-blue-600 text-white font-black tracking-widest uppercase text-[10px] rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:hover:scale-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader className="animate-spin" size={16}/> : (t.btnSave || "Save Contract")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}