"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Briefcase, Edit2, Trash2 } from "lucide-react";
import type { User } from "@/types";

interface UserAssignmentsProps {
  users: User[];
}

export default function UserAssignments({ users }: UserAssignmentsProps) {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" /> User Accounts ({users.length})
        </CardTitle>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add User</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50/30">
                <th className="text-left px-6 py-4 font-semibold text-slate-600">User</th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600">Role</th>
                <th className="text-left px-4 py-4 font-semibold text-slate-600">Scope/Status</th>
                <th className="text-center px-4 py-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold">
                        {u.firstname_th?.charAt(0) || u.username?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.firstname_th ? `${u.firstname_th} ${u.lastname_th}` : u.username}</p>
                        <p className="text-[11px] text-slate-500 ">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100 gap-1.5">
                      <Briefcase size={12} /> {u.role_name || "Employee"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-xl ${u.user_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-[11px] font-medium capitalize">{u.user_status}</span>
                      </div>
                      {u.is_super_admin && <span className="text-[10px] text-blue-600 font-bold">✓ Global Access</span>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600"><Edit2 size={14} /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}