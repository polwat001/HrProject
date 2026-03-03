"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  Clock,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  User,
  Bell,
  HelpCircle,
  Sparkles,
  Wallet,
  UserCircle,
  Shield,
} from "lucide-react";
import { authAPI } from "@/services/api";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const {
    currentCompanyId,
    setCurrentCompanyId,
    availableCompanies,
    user,
    logout,
  } = useAppStore();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Organization", path: "/organization", icon: Building2 },
    { name: "Employees", path: "/employees", icon: Users },
    { name: "Attendance & OT", path: "/attendance", icon: Clock },
    { name: "Leaves", path: "/leaves", icon: Calendar },
    { name: "Contracts", path: "/contracts", icon: FileText },
    { name: "Payroll", path: "/payroll", icon: Wallet },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "User & Permissions", path: "/settings", icon: Shield },
    { name: "Self-Service", path: "/self-service", icon: UserCircle },
  ];

  if (pathname === "/login") return <>{children}</>;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("hr_token");
    logout();
    router.push("/login");
  };

  const showCompanySwitcher =
    user?.is_super_admin || availableCompanies.length > 1;

  const getPageTitle = () => {
    const path = pathname.split("/")[1];
    const titleMap: Record<string, string> = {
      dashboard: "Dashboard",
      organization: "Organization Structure",
      employees: "Employee Management",
      attendance: "Attendance & OT",
      leaves: "Leave Management",
      contracts: "Contract Management",
      payroll: "Payroll System",
      reports: "Reports Center",
      settings: "System Settings",
      self_service: "Employee Self-Service",
    };
    return titleMap[path] || "HR System";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl border-r border-slate-700 overflow-hidden`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-blue-300/20">
            HR
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider">GROUP</span>
              <span className="text-xs text-slate-400 font-medium">
                HR System
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                }`}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon
                  size={20}
                  className={`flex-shrink-0 ${isActive ? "text-white" : "text-slate-300"}`}
                />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-white">
                      {item.name}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-4 py-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-400 font-semibold px-2 mb-3">
            Connected Systems
          </p>
          <div className="text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>API Server: Online</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 space-y-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700/70 w-full px-4 py-3 rounded-lg transition-all duration-200"
            title="Logout"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-slate-900">
                {getPageTitle()}
              </h2>
              <p className="text-xs text-slate-500">
                {currentCompanyId === null
                  ? "🌐 All Companies (Consolidated)"
                  : "🏢 Company View"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Company Switcher */}
            {showCompanySwitcher && (
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                <span className="text-sm text-slate-700 font-medium">
                  Company:
                </span>
                <select
                  value={currentCompanyId ?? "all"}
                  onChange={(e) =>
                    setCurrentCompanyId(
                      e.target.value === "all"
                        ? null
                        : parseInt(e.target.value),
                    )
                  }
                  className="border-0 bg-transparent px-2 py-1 rounded outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-semibold text-slate-900"
                >
                  {user?.is_super_admin && (
                    <option value="all">🌐 All Companies</option>
                  )}
                  {availableCompanies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      🏢 {c.name_th}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900 relative group">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                <div className="absolute right-0 top-full mt-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
                  <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    No notifications
                  </div>
                </div>
              </button>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900">
                <HelpCircle size={20} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-slate-200"></div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-slate-900 ">
                    {user?.username}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.is_super_admin ? "👑 Super Admin" : "👤 User"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 text-slate-600 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  {/* Profile Header */}
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-600">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-600" />
                      <span className="text-xs font-bold text-blue-600">
                        {user?.is_super_admin ? "SUPER ADMIN" : "REGULAR USER"}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                      <User size={16} />
                      Edit Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                      <Settings size={16} />
                      Preferences
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-slate-200">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
