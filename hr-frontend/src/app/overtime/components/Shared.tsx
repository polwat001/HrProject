import React from 'react';

export function StatusBadge({ status, t }: { status: string, t: any }) {
  const map: any = {
    approved: { label: t?.statusApproved || "อนุมัติแล้ว", color: "bg-green-100 text-green-700 border-green-200" },
    rejected: { label: t?.statusRejected || "ไม่อนุมัติ", color: "bg-red-100 text-red-700 border-red-200" },
    pending: { label: t?.statusPending || "รอตรวจสอบ", color: "bg-orange-100 text-orange-700 border-orange-200" },
  };
  const s = map[status] || { label: status, color: "bg-slate-100 text-slate-600" };
  
  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${s.color}`}>
      {s.label}
    </span>
  );
}