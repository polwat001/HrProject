"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { userAPI } from "@/services/api";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Shield, Plus, Users, History, Loader, 
  Edit2, Trash2, Lock, Briefcase 
} from "lucide-react";
import type { Role, User } from "@/types";

const modules = ["dashboard", "organization", "employee", "attendance", "leave", "contract", "reports", "permissions"];

const UserPermissions = () => {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // โหลดข้อมูลพร้อมกัน
      const [usersRes, rolesRes] = await Promise.all([
        userAPI.getUsers(currentCompanyId),
        userAPI.getRoles(currentCompanyId)
      ]);
      
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error loading permission data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบว่า Role ปัจจุบันมีสิทธิ์ใน Module นั้นๆ หรือไม่
  const checkPermission = (role: Role, moduleName: string) => {
    if (!role || !role.permissions) return false;
    // ปรับตามโครงสร้าง backend ของคุณ (เช่น ['read:employee', 'write:employee'] หรือแค่ ['employee'])
    return role.permissions.some(p => p.toLowerCase().includes(moduleName.toLowerCase()));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-primary mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900"> System Permissions</h1>
          <p className="text-slate-600 mt-1">จัดการบทบาทผู้ใช้งานและกำหนดสิทธิ์การเข้าถึงโมดูลต่างๆ</p>
        </div>
      </div>

      <Tabs defaultValue="roles">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" /> Role Management
          </TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2">
            <Users className="h-4 w-4" /> User Assignments
          </TabsTrigger>
          <TabsTrigger value="log" className="gap-2">
            <History className="h-4 w-4" /> Transaction Log
          </TabsTrigger>
        </TabsList>

        {/* --- Tab 1: Roles Management --- */}
        <TabsContent value="roles" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        </TabsContent>

        {/* --- Tab 2: User Assignments --- */}
        <TabsContent value="assignments" className="mt-4">
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
                            <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                              {u.firstname_th?.charAt(0) || u.username?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{u.firstname_th ? `${u.firstname_th} ${u.lastname_th}` : u.username}</p>
                              <p className="text-[11px] text-slate-500 italic">@{u.username}</p>
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
                              <span className={`w-2 h-2 rounded-full ${u.user_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
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
        </TabsContent>

        {/* --- Tab 3: Transaction Log --- */}
        <TabsContent value="log" className="mt-4">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-base flex items-center gap-2"><History className="h-4 w-4" /> ประวัติการใช้งานระบบ</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {/* ส่วนนี้สามารถเพิ่ม API getLogs ภายหลังได้ */}
              <div className="p-12 text-center text-slate-400">
                <History className="mx-auto mb-2 opacity-20" size={48} />
                <p>Log data will be connected in next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

     
      
    </div>
  );
};

export default UserPermissions;