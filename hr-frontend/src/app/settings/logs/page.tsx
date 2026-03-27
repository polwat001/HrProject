"use client";

import TransactionLog from "@/components/permissions/TransactionLog";

export default function LogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">บันทึกการแก้ไข</h1>
      </div>
      <TransactionLog />
    </div>
  );
}