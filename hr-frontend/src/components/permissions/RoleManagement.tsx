"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Plus } from "lucide-react";
import type { Role } from "@/types";

const modules = ["dashboard", "organization", "employee", "attendance", "leave", "contract", "reports", "permissions"];

interface RoleManagementProps {
  roles: Role[];
}

export default function RoleManagement({ roles }: RoleManagementProps) {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  const checkPermission = (role: Role, moduleName: string) => {
    if (!role || !role.permissions) return false;
    return role.permissions.some(p => p.toLowerCase().includes(moduleName.toLowerCase()));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ฝั่งซ้าย: รายชื่อ Role */}
      <div className="space-y-2">
        {roles.length === 0 ? (
          <p className="text-center py-4 text-slate-500 text-sm">No roles found</p>
        ) : (
          roles.map((r, i) => (
            <Card
              key={r.id}
              className={`cursor-pointer transition-all border-l-4 ${
                i === selectedRoleIndex ? "border-l-primary ring-1 ring-primary/20 bg-primary/5" : "border-l-transparent hover:bg-slate-50"
              }`}
              onClick={() => setSelectedRoleIndex(i)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${i === selectedRoleIndex ? "text-primary" : "text-slate-400"}`} />
                    <span className="font-bold text-sm">{r.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">ID: {r.id}</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">สิทธิ์การใช้งานสำหรับบุคลากรกลุ่ม {r.name}</p>
              </CardContent>
            </Card>
          ))
        )}
        <Button variant="outline" className="w-full gap-1.5 mt-2 border-dashed">
          <Plus className="h-4 w-4" /> New Role
        </Button>
      </div>

      {/* ฝั่งขวา: ตาราง Matrix */}
      <Card className="shadow-sm lg:col-span-2 border-slate-200 p-5">
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">
              Permission Matrix — {roles[selectedRoleIndex]?.name || "Select a role"}
            </CardTitle>
            <Button size="sm" className="gap-2"><Shield className="h-4 w-4" /> Update Permissions</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/50">
                <th className="text-left px-6 py-3 font-semibold text-slate-600">Module</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">View</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Edit</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Approve</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((m) => {
                const hasAccess = roles[selectedRoleIndex] ? checkPermission(roles[selectedRoleIndex], m) : false;
                const isSuperAdmin = roles[selectedRoleIndex]?.name?.includes("Super");

                return (
                  <tr key={m} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 capitalize font-bold text-slate-700">{m}</td>
                    <td className="text-center px-4 py-3.5"><Checkbox checked={hasAccess} /></td>
                    <td className="text-center px-4 py-3.5"><Checkbox checked={hasAccess && m !== "dashboard"} /></td>
                    <td className="text-center px-4 py-3.5">
                      <Checkbox checked={hasAccess && ["attendance", "leave", "contract", "payroll"].includes(m)} />
                    </td>
                    <td className="text-center px-4 py-3.5"><Checkbox checked={isSuperAdmin} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}