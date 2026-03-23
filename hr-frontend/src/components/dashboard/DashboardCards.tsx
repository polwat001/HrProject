import React from "react";
import { Card } from "@/components/ui/card";

export function AdminStatCard({ title, value, icon: Icon, color, highlightValue = false }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
      <div>
        <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-3xl font-black ${highlightValue ? "text-red-600" : "text-slate-900"}`}>{value}</h3>
      </div>
      <div className={`p-4 rounded-3xl ${colorMap[color]} group-hover:scale-110 transition-transform`}>
        <Icon size={32} />
      </div>
    </div>
  );
}

export function SelfServiceSummaryCard({ icon: Icon, label, value, color, isMono }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 text-emerald-600",
    teal: "bg-teal-50 text-teal-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card className="rounded-xl border border-slate-100 shadow-sm p-6 flex items-center gap-5 hover:shadow-md transition-all">
      <div className={`p-4 rounded-2xl ${colors[color]}`}><Icon size={28} /></div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black text-slate-900 mt-1 ${isMono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </Card>
  );
}