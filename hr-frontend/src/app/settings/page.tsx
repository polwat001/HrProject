"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { userAPI } from "@/services/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, History, Loader } from "lucide-react";
import type { Role, User } from "@/types";

// นำเข้า Submenus ที่เราแยกไว้
import RoleManagement from "@/components/permissions/RoleManagement";
import UserAssignments from "@/components/permissions/UserAssignments";
import TransactionLog from "@/components/permissions/TransactionLog";

export default function UserPermissionsPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    setLoading(true);
    try {
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

        <TabsContent value="roles" className="mt-4">
          <RoleManagement roles={roles} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-4">
          <UserAssignments users={users} />
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <TransactionLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}