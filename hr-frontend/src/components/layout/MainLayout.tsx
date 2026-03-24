"use client";

import React, { useState, useEffect } from "react";
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
  Shield,
  Circle,
  ClockPlus,
  CalendarClock,
  Trees,
  Palmtree, // ✅ เพิ่ม Import Icon สำหรับ Shift
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
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const {
    currentCompanyId,
    setCurrentCompanyId,
    availableCompanies,
    user,
    logout,
    language,
    setLanguage,
  } = useAppStore();

  const roleId = user ? Number(user.role_id || user.is_super_admin) : 4; 
  const isAdminOrHR = roleId === 1 || roleId === 2 || roleId === 3;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    ...(isAdminOrHR
      ? [
          {
            name: "Organization",
            path: "/organization",
            icon: Building2,
            subItems: [
              { name: "Division", path: "/organization/division" },
              { name: "Section", path: "/organization/section" },
              { name: "Department", path: "/organization/department" },
              { name: "Level", path: "/organization/level" },
              { name: "Position", path: "/organization/position" },
            ],
          },
          {
            name: "Employees",
            path: "/employees",
            icon: Users,
          },
        ]
      : []),

    { name: "Attendance Logs", path: "/attendance", icon: Clock },
    { name: "Shift Management", path: "/shift", icon: CalendarClock }, 
    { name: "OT Management", path: "/overtime", icon: ClockPlus },
    { name: "Leaves Management", path: "/leaves", icon: Calendar },

    ...(isAdminOrHR
      ? [
        { name: "Holidays", path: "/holiday", icon: Palmtree },
          { name: "Contracts Management", path: "/contracts", icon: FileText },
          { name: "Payroll Management", path: "/payroll", icon: Wallet },
          { name: "Reports", path: "/reports", icon: BarChart3 },
          
          { 
            name: "User & Permissions", 
            path: "/settings", 
            icon: Shield,
            subItems: [
              { name: "Role Management", path: "/settings/roles" },
              { name: "User Assignments", path: "/settings/users" },
              { name: "Transaction Log", path: "/settings/logs" },
            ]
          },
        ]
      : []),
  ];

  const toggleSubmenu = (path: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  useEffect(() => {
    if (!pathname) return;

    menuItems.forEach((item) => {
      if (item.subItems && pathname.startsWith(item.path)) {
        setOpenSubmenus((prev) => ({ ...prev, [item.path]: true }));
      }
    });
  }, [pathname]);

  if (pathname === "/login") return <>{children}</>;

  const handleLogout = async () => {
    try {
      if (typeof authAPI.logout === 'function') {
        await authAPI.logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("hr_token");
    logout();
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl border-r border-slate-700 overflow-hidden z-20`}
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isActive =
              pathname === item.path ||
              (hasSubItems && pathname?.startsWith(item.path));
            const isSubOpen = openSubmenus[item.path];

            return (
              <div key={item.path} className="flex flex-col">
                {hasSubItems ? (
                  <button
                    onClick={() => toggleSubmenu(item.path)}
                    className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 ${isActive ? "text-blue-400" : "text-slate-300"}`}
                    />
                    {sidebarOpen && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left text-white">
                          {item.name}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 text-slate-400 ${isSubOpen ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
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
                      <span className="text-sm font-medium flex-1 text-white">
                        {item.name}
                      </span>
                    )}
                  </Link>
                )}

                {/* Submenu */}
                {hasSubItems && isSubOpen && sidebarOpen && (
                  <div className="mt-1 space-y-1 pl-11 pr-2">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = pathname === subItem.path;
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                            isSubActive
                              ? "bg-blue-600/10 font-medium"
                              : "hover:bg-slate-700/30"
                          }`}
                        >
                          <Circle
                            size={8}
                            className={
                              isSubActive
                                ? "text-blue-400 fill-blue-400"
                                : "text-slate-500 group-hover:text-blue-300"
                            }
                          />
                          <span 
                            className={
                              isSubActive 
                                ? "text-white" 
                                : "text-white group-hover:text-white"
                            }
                          >
                            {subItem.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-4 py-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 space-y-2">
            <span>
              Copyright @ 2025 Webpark. <br></br> All rights reserved.
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl shadow-inner border border-slate-200">
              <button
                onClick={() => setLanguage("th")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${
                  language === "th"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                TH
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-widest uppercase transition-all ${
                  language === "en"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                EN
              </button>
            </div>

            <div className="h-8 w-px bg-slate-200"></div>

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

            <div className="h-8 w-px bg-slate-200"></div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-lg transition-colors group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg">
                  {user?.firstName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    "U"}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-900 ">
                    {user?.username || "Guest"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user?.is_super_admin ? " Super Admin" : " User"}
                  </p>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 text-slate-600 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg">
                        {user?.firstName?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          "U"}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900">
                          {user?.firstName || user?.username} {user?.lastName}
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

                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                      <User size={16} /> Edit Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2">
                      <Settings size={16} /> Preferences
                    </button>
                  </div>

                  <div className="border-t border-slate-200">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50/50">{children}</main>
      </div>
    </div>
  );
}
