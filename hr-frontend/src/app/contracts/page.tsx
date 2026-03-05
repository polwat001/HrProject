"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { contractAPI, employeeAPI, organizationAPI } from "@/services/api";
import {
  Plus,
  Edit2,
  Trash2,
  Loader,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

import type { Contract } from "@/types";

export default function ContractsPage() {
  const { currentCompanyId } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "expiring" | "expired"
  >("all");

  // ================= LOAD ALL DATA =================
  useEffect(() => {
    loadContracts();
  }, [currentCompanyId]);

  const loadContracts = async () => {
    try {
      setLoading(true);

      const [contractRes, empRes, coRes] = await Promise.all([
        contractAPI.getContracts({
          companyId: currentCompanyId || undefined,
        }),
        employeeAPI.getEmployees(),
        organizationAPI.getCompanies(),
      ]);

      const contractsData = contractRes.data;
      const employeesData = empRes.data;
      const companiesData = coRes.data;

      const mappedContracts = contractsData.map((c: any) => {
        const employee = employeesData.find((e: any) => e.id === c.employee_id);

        const company = companiesData.find((co: any) => co.id === c.company_id);

        return {
          ...c,
          employee_name: employee
            ? `${employee.firstname_th} ${employee.lastname_th}`
            : "-",
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

  // ================= CREATE LOOKUP MAP =================
  const employeeMap = useMemo(() => {
    return Object.fromEntries(
      employees.map((e) => [
        String(e.id),
        `${e.firstname_th} ${e.lastname_th}`,
      ]),
    );
  }, [employees]);

  const companyMap = useMemo(() => {
    return Object.fromEntries(companies.map((c) => [String(c.id), c.name_th]));
  }, [companies]);

  // ================= STATUS LOGIC =================
  const getContractStatus = (contract: Contract) => {
    if (contract.status === "expired") {
      return {
        type: "expired",
        label: "Expired",
        icon: AlertTriangle,
        color: "bg-red-100 text-red-700 border-red-300",
      };
    }

    if (contract.status === "expiring_soon") {
      return {
        type: "expiring",
        label: "Expiring Soon",
        icon: AlertTriangle,
        color: "bg-orange-100 text-orange-700 border-orange-300",
      };
    }

    return {
      type: "active",
      label: "Active",
      icon: CheckCircle,
      color: "bg-green-100 text-green-700 border-green-300",
    };
  };

  const filteredContracts = contracts.filter((contract) => {
    if (selectedStatus === "all") return true;
    return getContractStatus(contract).type === selectedStatus;
  });

  const activeCount = contracts.filter(
    (c) => getContractStatus(c).type === "active",
  ).length;

  const expiringCount = contracts.filter(
    (c) => getContractStatus(c).type === "expiring",
  ).length;

  const expiredCount = contracts.filter(
    (c) => getContractStatus(c).type === "expired",
  ).length;

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    if (!confirm("ยืนยันการลบสัญญา?")) return;

    try {
      await contractAPI.updateContract({
        id,
        action: "delete",
      });

      loadContracts();

      loadAllData();
    } catch (error) {
      console.error(error);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader
            className="animate-spin text-blue-600 mx-auto mb-4"
            size={40}
          />
          <p className="text-slate-600 font-medium">
            กำลังโหลดข้อมูลสัญญาจ้าง...
          </p>
        </div>
      </div>
    );
  }

  // ================= UI =================
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            📋 Contract Management
          </h1>
          <p className="text-slate-600 mt-1">
            จัดการสัญญาจ้างและข้อมูลการจ้างงาน
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
          <Plus size={20} /> New Contract
        </button>
      </div>

      {/* Status Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: "all", label: "All", count: contracts.length },
          { id: "active", label: "Active", count: activeCount },
          { id: "expiring", label: "Expiring", count: expiringCount },
          { id: "expired", label: "Expired", count: expiredCount },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedStatus(s.id as any)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedStatus === s.id
                ? "border-blue-600 bg-blue-50"
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <p className="text-sm font-medium text-slate-500 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900">{s.count}</p>
          </button>
        ))}
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left py-4 px-6 font-bold text-slate-600">
                  No.
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-600">
                  Employee
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-600">
                  Company
                </th>
                <th className="text-left py-4 px-6 font-bold text-slate-600">
                  Contract Number
                </th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">
                  Start Date
                </th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">
                  End Date
                </th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">
                  Status
                </th>
                <th className="text-center py-4 px-6 font-bold text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((contract) => {
                const status = getContractStatus(contract);
                const StatusIcon = status.icon;

                return (
                  <tr key={contract.id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-mono text-sm text-slate-500">
                      {contract.id}
                    </td>

                    <td className="py-4 px-6 font-medium">
                     {contract.employee_name}
                    </td>

                    <td className="py-4 px-6">
                      {contract.company_name}
                    </td>

                    <td className="py-4 px-6 uppercase ">
                      {contract.contract_number}
                    </td>

                    <td className="py-4 px-6 text-center font-mono text-sm">
                      {new Date(contract.start_date).toLocaleDateString(
                        "th-TH",
                      )}
                    </td>

                    <td className="py-4 px-6 text-center font-mono text-sm">
                      {new Date(contract.end_date).toLocaleDateString("th-TH")}
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                      >
                        <StatusIcon size={14} /> {status.label}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600">
                          <Edit2 size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(Number(contract.id))}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    ไม่พบข้อมูลสัญญา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
