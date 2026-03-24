"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import UserAssignments from "@/components/permissions/UserAssignments";

export default function UsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = () => {
      const mockUsers = [
        { 
          id: 1, 
          username: "superadmin", 
          firstname_th: "ผู้ดูแลระบบ", 
          lastname_th: "", 
          role_name: "Super Admin", 
          user_status: "active", 
          email: "admin@gmail.com" 
        },
        { 
          id: 2, 
          username: "nadech", 
          firstname_th: "สมชาย", 
          lastname_th: "มั่นคง", 
          role_name: "Employee", 
          user_status: "active", 
          email: "somchai@gmail.com" 
        },
      ];
      
      setUsers(mockUsers);
      setLoading(false);
    };

    const timer = setTimeout(loadUsers, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <UserAssignments users={users} />
    </div>
  );
}