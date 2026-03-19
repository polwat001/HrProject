import React from 'react';

export function getStatusBadge(status: string, t: any) {
  switch (status) {
    case "approved": return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black border border-green-200 uppercase">{t?.statusApproved || "APPROVED"}</span>;
    case "rejected": return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-black border border-red-200 uppercase">{t?.statusRejected || "REJECTED"}</span>;
    default: return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black border border-yellow-200 uppercase">{t?.statusPending || "PENDING"}</span>;
  }
}