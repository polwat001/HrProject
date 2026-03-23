"use client";

import TransactionLog from "@/components/permissions/TransactionLog";

export default function LogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Transaction Log</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">ประวัติการเข้าใช้งานและแก้ไขข้อมูลในระบบ</p>
      </div>
      <TransactionLog />
    </div>
  );
}