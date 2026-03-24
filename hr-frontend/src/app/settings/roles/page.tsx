"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import RoleManagement from "@/components/permissions/RoleManagement";

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    const loadRoles = () => {
      const mockRoles = [
        { id: 1, name: "Super Admin", permissions: ["dashboard", "user", "role"] },
        { id: 2, name: "HR Manager", permissions: ["dashboard", "employee", "leave"] },
        { id: 3, name: "HR Staff", permissions: ["dashboard", "attendance"] },
        { id: 4, name: "Employee", permissions: ["dashboard"] }
      ];
      
      setRoles(mockRoles);
      setLoading(false);
    };

    const timer = setTimeout(loadRoles, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <RoleManagement roles={roles} />
    </div>
  );
}