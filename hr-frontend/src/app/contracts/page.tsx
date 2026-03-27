"use client";

import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { translations } from "@/locales/translations";
import {
  Plus, Edit2, Trash2, Loader, AlertTriangle, CheckCircle, Recycle, X, Search, Filter, Briefcase, BadgeCheck, Download, Upload,
  Share, CalendarRange, Info, ChevronLeft, ChevronRight
} from "lucide-react";

import { CONTRACT_TYPES, MOCK_COMPANIES, MOCK_EMPLOYEES, MOCK_CONTRACTS } from "@/mocks/contractData";

const MOCK_DEPARTMENTS = [
  { id: 1, name: "แผนกพัฒนาซอฟต์แวร์ (IT)" },
  { id: 2, name: "แผนกทรัพยากรบุคคล (HR)" },
  { id: 3, name: "แผนกการเงิน (Finance)" }
];

const MOCK_POSITIONS = [
  { id: 1, name: "Software Engineer", dept_id: 1 },
  { id: 2, name: "HR Manager", dept_id: 2 },
  { id: 3, name: "Accountant", dept_id: 3 }
];

const EMPTY_FORM = {
  employee_code: "",
  firstname_th: "",
  lastname_th: "",
  department_id: "",
  position_id: "",
  contract_number: "",
  contract_type: "permanent", 
  start_date: "",
  end_date: "",
  status: "active",
  base_salary: "",
  evaluation_date: "",
  agency_name: "",
  university: "",
  allowance: "",
  address: "",
  task_count: "", 
  task_amount: "" 
};

const INFO_DATA = [
  { src: "/employee.png", title: "1. พนักงานประจำ" },
  { src: "/pro.png", title: "2. ทดลองงาน" },
  { src: "/outsource.webp", title: "3. สัญญาชั่วคราว / Outsource" },
  { src: "/intern.webp", title: "4. นักศึกษาฝึกงาน" }
];

export default function ContractsPage() {
  const { currentCompanyId, language } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<any[]>([]);

  // Search & Filter
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [filters, setFilters] = useState({
    status: "all", division: "all", section: "all", department: "all", position: "all", level: "all",
    expiry_start: "", expiry_end: ""
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expiryOption, setExpiryOption] = useState<string>("custom");

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const t = translations[language as keyof typeof translations] || translations['en'];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const mappedContracts = MOCK_CONTRACTS.map((c, index) => {
        const employee = MOCK_EMPLOYEES.find((e) => e.id === c.employee_id);
        if (currentCompanyId && c.company_id !== currentCompanyId) return null;

        // 🔴 ปรับ Mock Data ให้มี ID แผนกและตำแหน่งที่ตรงกับ Dropdown เสมอ จะได้ดึงไปแสดงตอน Edit ได้
        const defaultDept = MOCK_DEPARTMENTS[index % MOCK_DEPARTMENTS.length];
        const defaultPos = MOCK_POSITIONS.find(p => p.dept_id === defaultDept.id) || MOCK_POSITIONS[0];

        return {
          ...c,
          employee_name: employee ? `${employee.firstname_th} ${employee.lastname_th}` : "-",
          employee_code: employee?.employee_code || "",
          department_id: c.department_id || defaultDept.id,
          department_name: c.department_name || defaultDept.name,
          position_id: c.position_id || defaultPos.id,
          position_name: c.position_name || defaultPos.name,
        };
      }).filter(Boolean);

      setContracts(mappedContracts as any[]);
      setLoading(false);
    }, 500);
  }, [currentCompanyId]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("✅ ส่งออกข้อมูลสัญญาจ้างสำเร็จ! (Demo)\nระบบได้ดาวน์โหลดไฟล์ contracts_export.csv แล้ว");
    }, 1200);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      alert(` นำเข้าข้อมูลจากไฟล์ ${file.name} สำเร็จ! (Demo)`);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }, 1500);
  };

  const getContractStatus = (status: string) => {
    if (status === "terminated") return { type: "terminated", label: t.contractTerminated || "Terminated", icon: AlertTriangle, color: "bg-red-100 text-red-700 border-red-300" };
    if (status === "expiring") return { type: "expiring", label: t.contractExpiring || "Expiring Soon", icon: AlertTriangle, color: "bg-orange-100 text-[#F5A10A] border-orange-300" };
    if (status === "expired") return { type: "expired", label: t.contractExpired || "Expired", icon: AlertTriangle, color: "bg-red-100 text-red-500 border-red-300" };
    if (status === "renewed") return { type: "renewed", label: t.contractRenewed || "Renewed", icon: Recycle, color: "bg-blue-100 text-blue-700 border-blue-300" };
    return { type: "active", label: t.contractActive || "Active", icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-300" };
  };

  const getContractTypeBadge = (typeValue: string) => {
    let displayValue = typeValue;
    if(typeValue === 'permanent') displayValue = 'employment';
    if(typeValue === 'probation') displayValue = 'employment';
    if(typeValue === 'temporary') displayValue = 'contractor';
    if(typeValue === 'intern') displayValue = 'internship';

    const typeDef = CONTRACT_TYPES.find((t) => t.value === displayValue) || CONTRACT_TYPES[0];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${typeDef.color}`}>
        {typeValue === 'permanent' ? 'พนักงานประจำ' : typeValue === 'probation' ? 'ทดลองงาน' : typeValue === 'temporary' ? 'สัญญาชั่วคราว' : typeValue === 'intern' ? 'ฝึกงาน' : typeDef.label.split(" (")[0]}
      </span>
    );
  };

  const filteredContracts = contracts.filter((contract: any) => {
    const matchesSearch = searchQuery === "" || 
      `${contract.employee_name} ${contract.employee_code} ${contract.department_name} ${contract.position_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filters.status === "all" || contract.status === filters.status;

    let matchesExpiry = true;
    if (filters.expiry_start || filters.expiry_end) {
      if (!contract.end_date) {
        matchesExpiry = false;
      } else {
        const contractEndDate = new Date(contract.end_date);
        if (filters.expiry_start) {
          matchesExpiry = matchesExpiry && contractEndDate >= new Date(filters.expiry_start);
        }
        if (filters.expiry_end) {
          matchesExpiry = matchesExpiry && contractEndDate <= new Date(filters.expiry_end);
        }
      }
    }

    return matchesSearch && matchesStatus && matchesExpiry;
  });

  const handleClearFilters = () => {
    setFilters({ status: "all", division: "all", section: "all", department: "all", position: "all", level: "all", expiry_start: "", expiry_end: "" });
    setSearchQuery("");
  };

  const calculateEndDate = (startDate: string, duration: string) => {
    if (!startDate || duration === "custom") return;
    const start = new Date(startDate);
    const end = new Date(start);

    if (duration === "1m") end.setMonth(end.getMonth() + 1);
    else if (duration === "3m") end.setMonth(end.getMonth() + 3);
    else if (duration === "6m") end.setMonth(end.getMonth() + 6);
    else if (duration === "1y") end.setFullYear(end.getFullYear() + 1);
    
    end.setDate(end.getDate() - 1); 

    setFormData(prev => ({ ...prev, end_date: end.toISOString().split('T')[0] }));
  };

  const handleEdit = (contract: any) => {
    const names = (contract.employee_name || "").split(" ");
    const fName = names[0] || "";
    const lName = names.slice(1).join(" ") || "";

    // 🔴 ใช้ department_id และ position_id เพื่อให้ไปเลือกตรงกับ <select> ทันที
    setFormData({
      employee_code: contract.employee_code || "",
      firstname_th: fName,
      lastname_th: lName,
      department_id: contract.department_id ? contract.department_id.toString() : "",
      position_id: contract.position_id ? contract.position_id.toString() : "",
      contract_number: contract.contract_number || "",
      contract_type: contract.contract_type || "permanent",
      start_date: contract.start_date || "",
      end_date: contract.end_date || "",
      status: contract.status || "active",
      base_salary: contract.base_salary || "",
      evaluation_date: contract.evaluation_date || "",
      agency_name: contract.agency_name || "",
      university: contract.university || "",
      allowance: contract.allowance || "",
      address: contract.address || "",
      task_count: contract.task_count || "",
      task_amount: contract.task_amount || ""
    });

    if (contract.contract_type === "permanent") {
      setExpiryOption("none");
    } else {
      setExpiryOption("custom");
    }

    setEditingId(contract.id);
    setIsModalOpen(true);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employee_code || !formData.firstname_th || !formData.lastname_th || !formData.contract_number || !formData.start_date) {
      alert(t.errFormIncomplete || "กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      const selectedDept = MOCK_DEPARTMENTS.find(d => d.id === Number(formData.department_id));
      const selectedPos = MOCK_POSITIONS.find(p => p.id === Number(formData.position_id));

      const contractData = {
        company_id: currentCompanyId || 1, 
        contract_number: formData.contract_number.toUpperCase(),
        contract_type: formData.contract_type, 
        start_date: formData.start_date,
        end_date: formData.contract_type === 'permanent' ? "" : formData.end_date,
        status: formData.status,
        employee_name: `${formData.firstname_th} ${formData.lastname_th}`,
        employee_code: formData.employee_code,
        department_id: selectedDept?.id || "",
        department_name: selectedDept?.name || "-",
        position_id: selectedPos?.id || "",
        position_name: selectedPos?.name || "-",
        base_salary: formData.base_salary,
        evaluation_date: formData.evaluation_date,
        agency_name: formData.agency_name,
        university: formData.university,
        allowance: formData.allowance,
        address: formData.address,
        task_count: formData.task_count,
        task_amount: formData.task_amount,
      };

      if (editingId) {
        setContracts(contracts.map(c => c.id === editingId ? { ...c, ...contractData, id: editingId } : c));
      } else {
        const newContract = {
          ...contractData,
          id: Math.floor(Math.random() * 10000),
          employee_id: Math.floor(Math.random() * 10000), 
        };
        setContracts([newContract, ...contracts]);
      }

      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setExpiryOption("custom"); 
      setSaving(false);
    }, 400);
  };

  const handleDelete = (id: number) => {
    if (!confirm(t.confirmDeleteContract || "ยืนยันการลบสัญญาฉบับนี้?")) return;
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const handleCloseModal = () => {
    if (!saving) {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
  };

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
      
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{t.titleContract || "Contracts Management"}</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm mt-1">จัดการข้อมูลสัญญาจ้างพนักงาน</p>
        </div>
        
        <div className="flex flex-wrap items-start gap-3 w-full xl:w-auto">
          
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".csv, .xlsx, .xls" />
          <button onClick={handleExport} disabled={isExporting} className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl shadow-sm hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50">
            {isExporting ? <Loader className="animate-spin" size={16} /> : <Share size={16} />} ส่งออก
          </button>

          <div className="flex flex-col items-center xl:items-end gap-1.5 flex-1 xl:flex-none w-full xl:w-auto">
            <button 
              onClick={() => {
                setFormData(EMPTY_FORM);
                setEditingId(null);
                setExpiryOption("none");
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all font-black text-xs sm:text-sm uppercase tracking-widest"
            >
              <Plus size={18} /> {t.btnNewContract || "Add Contract"}
            </button>
            <button onClick={() => { setCurrentImageIndex(0); setShowInfoModal(true); }} className="text-[10px] mt-2 mr-2 text-slate-400 hover:text-blue-600 flex items-center gap-1 font-bold tracking-widest uppercase transition-colors">
              <Info size={12} /> คำแนะนำการสร้างสัญญา
            </button>
          </div>
        </div>
      </div>

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
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <Filter size={16} /> {t.btnFilters || "Filters"}
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">{t.filterCriteria || "Filter Criteria"}</h3>
              <button onClick={handleClearFilters} className="text-[10px] uppercase font-black tracking-widest text-red-500 hover:text-red-700 transition-colors">
                {t.clearAllFilters || "Clear All"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblStatus || "Status"}</label>
                <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="all">{t.allStatuses || "All Statuses"}</option>
                  <option value="active">{t.contractActive || "Active"}</option>
                  <option value="renewed">{t.contractRenewed || "Renewed"}</option>
                  <option value="expiring">{t.contractExpiring || "Expiring Soon"}</option>
                  <option value="expired">{t.contractExpired || "Expired"}</option>
                  <option value="terminated">{t.contractTerminated || "Terminated"}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblDepartment || "Department"}</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="all">{t.allDepartments || "All Departments"}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.lblPosition || "Position"}</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                  <option value="all">{t.allPositions || "All Positions"}</option>
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">วันที่หมดอายุสัญญา (Expiry Date Range)</label>
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.expiry_start} onChange={(e) => setFilters({ ...filters, expiry_start: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                  <span className="text-slate-400 font-bold">-</span>
                  <input type="date" value={filters.expiry_end} onChange={(e) => setFilters({ ...filters, expiry_end: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-base tracking-widest text-slate-500 ">
                <th className="text-left py-5 px-6">{t.colEmployee || "Employee"}</th>
                <th className="text-left py-5 px-6">แผนก</th>
                <th className="text-left py-5 px-6">ตำแหน่ง</th>
                <th className="text-center py-5 px-6">ประเภทสัญญา</th>
                <th className="text-center py-5 px-6">{t.lblStartDate || "Start Date"}</th>
                <th className="text-center py-5 px-6">{t.lblEndDate || "End Date"}</th>
                <th className="text-center py-5 px-6">{t.colStatus || "Status"}</th>
                <th className="text-center py-5 px-6">{t.colAction || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 ">
              {filteredContracts.map((contract: any) => {
                const status = getContractStatus(contract.status);
                const StatusIcon = status.icon;
                return (
                  <tr key={contract.id} className=" transition-colors ">
                    <td className="py-4 px-6 border-t border-slate-300">
                      <p className="font-black text-slate-900 text-base leading-tight">{contract.employee_name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-0.5">{contract.employee_code}</p>
                    </td>
                    <td className="py-4 px-6 border-t border-slate-300">
                      <p className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl">
                       {contract.department_name}
                      </p>
                    </td>
                    <td className="py-4 px-6 border-t border-slate-300">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                       {contract.position_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center border-t border-slate-300">
                      {getContractTypeBadge(contract.contract_type)}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-sm text-slate-600 border-t border-slate-300">
                      {new Date(contract.start_date).toLocaleDateString(language === 'th' ? "th-TH" : "en-GB")}
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-sm text-slate-600 border-t border-slate-300">
                      {contract.end_date ? new Date(contract.end_date).toLocaleDateString(language === 'th' ? "th-TH" : "en-GB") : (
                        <span className="text-slate-400 italic font-medium text-xs">ไม่มีวันหมดอายุ</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center border-t border-slate-300">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                        <StatusIcon size={14} /> {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center border-t border-slate-300">
                      <div className="flex items-center justify-center gap-2 ">
                        <button onClick={() => handleEdit(contract)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"><Edit2 size={16} /></button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter ">
                {editingId ? <Edit2 size={24} className="text-blue-600"/> : <Plus size={24} className="text-blue-600"/>}
                {editingId ? "แก้ไขสัญญาจ้าง" : "สร้างสัญญาจ้างใหม่"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm transition-all"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveContract} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสพนักงาน <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="เช่น EMP-001"
                    value={formData.employee_code}
                    onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อจริง <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="ชื่อพนักงาน..."
                    value={formData.firstname_th}
                    onChange={(e) => setFormData({ ...formData, firstname_th: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">นามสกุล <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="นามสกุลพนักงาน..."
                    value={formData.lastname_th}
                    onChange={(e) => setFormData({ ...formData, lastname_th: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">แผนก (Department) <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.department_id} 
                    onChange={(e) => setFormData({...formData, department_id: e.target.value, position_id: ""})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">เลือกแผนก...</option>
                    {MOCK_DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ตำแหน่ง (Position) <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.position_id} 
                    onChange={(e) => setFormData({...formData, position_id: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="">เลือกตำแหน่ง...</option>
                    {MOCK_POSITIONS.filter(p => !formData.department_id || p.dept_id === Number(formData.department_id)).map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ประเภทสัญญา <span className="text-red-500">*</span></label>
                  <select 
                    value={formData.contract_type} 
                    onChange={(e) => setFormData({...formData, contract_type: e.target.value, end_date: "", evaluation_date: "", base_salary: "", address: "", agency_name: "", university: "", allowance: "", task_count: "", task_amount: ""})}
                    className="w-full px-4 py-3 bg-blue-50 border-none rounded-xl text-sm font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="permanent">พนักงานประจำ</option>
                    <option value="probation">ทดลองงาน</option>
                    <option value="temporary">สัญญาชั่วคราว / Outsource</option>
                    <option value="intern">นักศึกษาฝึกงาน</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เลขที่สัญญา <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="เช่น CTR-2026-001"
                    value={formData.contract_number}
                    onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              <div className="p-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันที่เริ่มงาน (Start Date) <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                  />
                </div>

                {formData.contract_type === "permanent" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เงินเดือน / ค่าจ้าง (Base Salary)</label>
                      <input 
                        type="number" 
                        placeholder="ระบุจำนวนเงิน..."
                        value={formData.base_salary}
                        onChange={(e) => setFormData({...formData, base_salary: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                      <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1"><CalendarRange size={12}/> สัญญาประเภทนี้ไม่มีวันหมดอายุ</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ที่อยู่ตามทะเบียนบ้าน / ปัจจุบัน</label>
                      <textarea 
                        rows={3}
                        placeholder="บ้านเลขที่, ซอย, ถนน, ตำบล/แขวง, อำเภอ/เขต, จังหวัด, รหัสไปรษณีย์..."
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
                      />
                    </div>
                  </div>
                )}

                {formData.contract_type === "probation" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">วันประเมินผล (Eval. Date) <span className="text-red-500">*</span></label>
                      <input 
                        type="date" 
                        value={formData.evaluation_date}
                        onChange={(e) => setFormData({...formData, evaluation_date: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เงินเดือนช่วงทดลองงาน</label>
                      <input 
                        type="number" 
                        placeholder="ระบุจำนวนเงิน..."
                        value={formData.base_salary}
                        onChange={(e) => setFormData({...formData, base_salary: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {formData.contract_type === "temporary" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                        <span>วันที่สิ้นสุดสัญญา (End Date) <span className="text-red-500">*</span></span>
                      </label>
                      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 mb-2">
                        <button type="button" onClick={() => { setExpiryOption("1m"); calculateEndDate(formData.start_date, "1m"); }} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${expiryOption === '1m' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>1 เดือน</button>
                        <button type="button" onClick={() => { setExpiryOption("3m"); calculateEndDate(formData.start_date, "3m"); }} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${expiryOption === '3m' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>3 เดือน</button>
                        <button type="button" onClick={() => { setExpiryOption("6m"); calculateEndDate(formData.start_date, "6m"); }} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${expiryOption === '6m' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>6 เดือน</button>
                        <button type="button" onClick={() => { setExpiryOption("1y"); calculateEndDate(formData.start_date, "1y"); }} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${expiryOption === '1y' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>1 ปี</button>
                        <button type="button" onClick={() => { setExpiryOption("custom"); setFormData({...formData, end_date: ""}); }} className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${expiryOption === 'custom' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>กำหนดเอง</button>
                      </div>
                      <input 
                        type="date" 
                        value={formData.end_date}
                        onChange={(e) => {
                          setExpiryOption("custom");
                          setFormData({...formData, end_date: e.target.value});
                        }}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">บริษัทต้นสังกัด / Vendor</label>
                      <input 
                        type="text" 
                        placeholder="ระบุชื่อบริษัท Outsource (ถ้ามี)..."
                        value={formData.agency_name}
                        onChange={(e) => setFormData({...formData, agency_name: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนงาน (Task Count)</label>
                        <input 
                          type="number" 
                          placeholder="ระบุจำนวนงาน..."
                          value={formData.task_count}
                          onChange={(e) => setFormData({...formData, task_count: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">จำนวนเงิน (Total Amount)</label>
                        <input 
                          type="number" 
                          placeholder="ระบุจำนวนเงิน..."
                          value={formData.task_amount}
                          onChange={(e) => setFormData({...formData, task_amount: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.contract_type === "intern" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สิ้นสุดการฝึกงาน <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          value={formData.end_date}
                          onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">เบี้ยเลี้ยง (บาท/วัน)</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={formData.allowance}
                          onChange={(e) => setFormData({...formData, allowance: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">สถาบันการศึกษา</label>
                      <input 
                        type="text" 
                        placeholder="ชื่อมหาวิทยาลัย / คณะ..."
                        value={formData.university}
                        onChange={(e) => setFormData({...formData, university: e.target.value})}
                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50 mt-6">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3.5 text-slate-400 font-black tracking-widest uppercase text-[10px] hover:bg-slate-100 rounded-xl transition-all">ยกเลิก</button>
                <button type="submit" disabled={saving || !formData.employee_code || !formData.firstname_th || !formData.lastname_th} className="flex-1 py-3.5 bg-blue-600 text-white font-black tracking-widest uppercase text-[10px] rounded-xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:bg-slate-200 disabled:shadow-none disabled:hover:scale-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-2">
                  {saving ? <Loader className="animate-spin" size={16}/> : (editingId ? "บันทึกการแก้ไข" : "บันทึกข้อมูล")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Information */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowInfoModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-0 animate-in zoom-in-95 duration-200 flex flex-col h-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white rounded-t-2xl shrink-0">
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Info className="text-blue-600" size={20} />
                คำแนะนำการสร้างสัญญา
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex flex-wrap gap-2">
                {INFO_DATA.map((info, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      currentImageIndex === idx
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                        : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      currentImageIndex === idx ? "bg-white/20" : "bg-slate-200 text-slate-600"
                    }`}>
                      {idx + 1}
                    </span>
                    {info.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 flex-1 overflow-y-auto">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex justify-center bg-slate-50 rounded-lg p-2 h-full min-h-[400px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={INFO_DATA[currentImageIndex].src} 
                    alt={INFO_DATA[currentImageIndex].title}
                    className="w-full h-auto object-contain rounded border border-slate-100 max-h-[60vh]"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-white rounded-b-2xl flex justify-end shrink-0">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-6 py-2.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                ปิด (Close)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}