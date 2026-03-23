"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function TransactionLog() {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50/50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4" /> ประวัติการใช้งานระบบ
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-12 text-center text-slate-400">
          <History className="mx-auto mb-2 opacity-20" size={48} />
          <p>Log data will be connected in next update</p>
        </div>
      </CardContent>
    </Card>
  );
}