"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { contractAPI, employeeAPI, organizationAPI } from "@/services/api";
import { translations } from "@/locales/translations";
import {
  Plus,
  Edit2,
  Trash2,
  Loader,
  AlertTriangle,
  CheckCircle,
  Recycle,
  X,
  Search,
  Filter // ✅ เพิ่มไอคอน Filter
} from "lucide-react";

import type { Contract } from "@/types";

const EMPTY_FORM = {
  employee_id: "",
  company_id: "",
  contract_number: "",
  start_date: "",
  end_date: "",
  status: "active"
};

export default function ContractsPage() {
  const { currentCompanyId, language } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  // ✅ State สำหรับ Search & Filter ตาม UI ใหม่
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    company: "all",
    division: "all",
    section: "all",
    department: "all",
    position: "all",
    level: "all"
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const t = translations[language as keyof typeof translations] || translations['en'];

  // ================= LOAD ALL DATA =================
  useEffect(() => {
    loadContracts();
  }, [currentCompanyId]);

  const loadContracts = async () => {
    try {
      setLoading(true);

      const [contractRes, empRes, coRes] = await Promise.all([
        contractAPI.getContracts({ companyId: currentCompanyId || undefined }),
        employeeAPI.getEmployees(),
        organizationAPI.getCompanies(),
      ]);

      const contractsData = contractRes.data;
      const employeesData = empRes.data;
      const companiesData = coRes.data;

      setEmployees(employeesData);
      setCompanies(companiesData);

      const mappedContracts = contractsData.map((c: any) => {
        const employee = employeesData.find((e: any) => e.id === c.employee_id);
        const company = companiesData.find((co: any) => co.id === c.company_id);

        return {
          ...c,
          employee_name: employee ? `${employee.firstname_th} ${employee.lastname_th}` : "-",
          employee_code: employee?.employee_code || "",
          company_name: company?.name_th ?? "-",
        };
      });

      setContracts(mappedContracts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= STATUS LOGIC =================
  const getContractStatus = (contract: Contract) => {
    if (contract.status === "terminated") {
      return { type: "terminated", label: t.contractTerminated, icon: AlertTriangle, color: "bg-red-100 text-red-700 border-red-300" };
    }
    if (contract.status === "expired") {
      return { type: "expiring", label: t.contractExpired, icon: AlertTriangle, color: "bg-orange-100 text-[#F5A10A] border-orange-300" };
    }
    if (contract.status === "renewed") {
      return { type: "renewed", label: t.contractRenewed, icon: Recycle, color: "bg-blue-100 text-blue-700 border-blue-300" };
    }
    return { type: "active", label: t.contractActive, icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-300" };
  };

  // ✅ การกรองข้อมูล (Filter & Search)
  const filteredContracts = contracts.filter((contract: any) => {
    // กรองด้วย Search Bar (ชื่อ หรือ รหัส)
    const matchesSearch = searchQuery === "" || 
      `${contract.employee_name} ${contract.employee_code}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    // กรองด้วย Status
    const matchesStatus = filters.status === "all" || contract.STATUS === filters.status || contract.status === filters.status;
    
    // กรองด้วย Company
    const matchesCompany = filters.company === "all" || contract.company_id?.toString() === filters.company;

    return matchesSearch && matchesStatus && matchesCompany;
  });

  const handleClearFilters = () => {
    setFilters({
      status: "all", company: "all", division: "all", section: "all", department: "all", position: "all", level: "all"
    });
  };

  // ================= SAVE CONTRACT =================
  const handleSaveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_id || !formData.company_id || !formData.contract_number || !formData.start_date || !formData.end_date) {
      alert(t.errFormIncomplete);
      return;
    }

    try {
      setSaving(true);
      await contractAPI.createContract?.(formData); 
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      setEmployeeSearch("");
      loadContracts(); 
    } catch (error) {
      console.error(error);
      alert("Failed to save contract");
    } finally {
      setSaving(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!confirm(t.confirmDeleteContract)) return;
    try {
      await contractAPI.updateContract({ id, action: "delete" });
      loadContracts();
    } catch (error) {
      console.error(error);
    }
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
          <p className="text-slate-600 font-medium">{t.loadingContracts}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900"> {t.titleContract}</h1>
          
        </div>

        <button 
          onClick={() => {
            setFormData({...EMPTY_FORM, company_id: currentCompanyId?.toString() || ""});
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          <Plus size={20} /> {t.btnNewContract}
        </button>
      </div>

      {/* ✅ Search & Filter Bar ตาม UI ต้นแบบ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {/* Search Row */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t.phSearchContract}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-2 border rounded-lg text-sm font-medium transition-all ${
              showFilters 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} /> {t.btnFilters}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">{t.filterCriteria}</h3>
              <button onClick={handleClearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                {t.clearAllFilters}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblStatus}</label>
                <select 
                  value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="active">{t.contractActive}</option>
                  <option value="renewed">{t.contractRenewed}</option>
                  <option value="expiring">{t.contractExpiring}</option>
                  <option value="expired">{t.contractExpired}</option>
                  <option value="terminated">{t.contractTerminated}</option>
                </select>
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblCompanyFilter}</label>
                <select 
                  value={filters.company} onChange={(e) => setFilters({...filters, company: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t.allCompanies}</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name_th}</option>)}
                </select>
              </div>

              {/* Division (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblDivision}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allDivisions}</option>
                </select>
              </div>

              {/* Section (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblSection}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allSections}</option>
                </select>
              </div>

              {/* Department (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblDepartment}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allDepartments}</option>
                </select>
              </div>

              {/* Position (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblPosition}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allPositions}</option>
                </select>
              </div>

              {/* Level (Placeholder UI) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblLevel}</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="all">{t.allLevels}</option>
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
              <tr className="bg-slate-50 border-b border-slate-200 uppercase text-sm tracking-wider">
                <th className="text-left py-4 px-6 font-bold text-slate-600">{t.colNo}</th>
                <th className="text-left py-4 px-6 font-bold text-slate-600">{t.colEmployee || "Employee"}</th>
                <th className="text-left py-4 px-6 font-bold text-slate-600">{t.colCompany}</th>
                <th className="text-left py-4 px-6 font-bold text-slate-600">{t.colContractNum}</th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">{t.lblStartDate || "Start Date"}</th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">{t.lblEndDate || "End Date"}</th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">{t.colStatus}</th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">{t.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((contract: any) => {
                const status = getContractStatus(contract);
                const StatusIcon = status.icon;
                return (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-mono text-sm text-slate-500">{contract.id}</td>
                    <td className="py-4 px-6 font-medium">{contract.employee_name}</td>
                    <td className="py-4 px-6">{contract.company_name}</td>
                    <td className="py-4 px-6 uppercase ">{contract.contract_number}</td>
                    <td className="py-4 px-6 text-center font-mono text-sm">
                      {new Date(contract.startDate || contract.start_date).toLocaleDateString(language === 'th' ? "th-TH" : "en-GB")}
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-sm">
                      {new Date(contract.endDate || contract.end_date).toLocaleDateString(language === 'th' ? "th-TH" : "en-GB")}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                        <StatusIcon size={14} /> {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(Number(contract.id))} className="p-2 hover:bg-red-100 rounded-lg text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredContracts.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">{t.noContracts}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ MODAL FOR CREATING CONTRACT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !saving && setIsModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus size={20} className="text-blue-600"/> {t.addContract}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveContract} className="p-6 space-y-5">
              
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lblEmployee || "Employee *"}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder={t.phSearchEmp}
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setFormData({ ...formData, employee_id: "" });
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm outline-none transition-all ${!formData.employee_id && employeeSearch ? 'border-red-300 ring-4 ring-red-50' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`}
                  />
                </div>
                {employeeSearch && !formData.employee_id && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {filteredEmployees.map(emp => (
                      <div
                        key={emp.id}
                        className="p-3 hover:bg-blue-50 cursor-pointer text-sm font-medium border-b border-slate-50 last:border-0"
                        onClick={() => {
                          setFormData({ ...formData, employee_id: emp.id });
                          setEmployeeSearch(`${emp.employee_code} - ${emp.firstname_th} ${emp.lastname_th}`);
                        }}
                      >
                        <span className="text-slate-400 mr-2">{emp.employee_code}</span> 
                        <span className="text-slate-800">{emp.firstname_th} {emp.lastname_th}</span>
                      </div>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <div className="p-3 text-sm text-slate-400 italic text-center">{t.notFound}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lblCompanyFilter}</label>
                <select 
                  value={formData.company_id} 
                  onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                >
                  <option value="">{t.selCompany}</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name_th}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lblContractNum}</label>
                <input 
                  type="text" 
                  placeholder={t.phContractNum}
                  value={formData.contract_number}
                  onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lblStartDate || "Start Date"}</label>
                  <input 
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.lblEndDate || "End Date"}</label>
                  <input 
                    type="date" 
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">{t.btnCancel || "Cancel"}</button>
                <button type="submit" disabled={saving || !formData.employee_id} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none transition-all">
                  {saving ? <Loader className="animate-spin mx-auto" size={20}/> : (t.btnSave || "Save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
