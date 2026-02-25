'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { userAPI } from '@/services/api';
import { ShieldCheck, UserCog, Plus, Edit2, Trash2, Loader, Lock, Users, Briefcase } from 'lucide-react';
import type { Role, User } from '@/types';

export default function SettingsPage() {
  const { currentCompanyId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, [currentCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, usersRes] = await Promise.all([
        userAPI.getRoles(),
        userAPI.getUsers(),
      ]);
      setRoles(rolesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    if (roleName.includes('Admin')) {
      return 'from-red-50 to-red-100 border-red-300 text-red-700';
    }
    if (roleName.includes('Manager')) {
      return 'from-blue-50 to-blue-100 border-blue-300 text-blue-700';
    }
    if (roleName.includes('Super')) {
      return 'from-orange-50 to-orange-100 border-orange-300 text-orange-700';
    }
    return 'from-slate-50 to-slate-100 border-slate-300 text-slate-700';
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('Admin')) {
      return '🛡️';
    }
    if (roleName.includes('Manager')) {
      return '👔';
    }
    if (roleName.includes('Super')) {
      return '👑';
    }
    return '📋';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-slate-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">⚙️ System Settings & Permissions</h1>
        <p className="text-slate-600 mt-1">Manage roles, users, and access controls</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'roles'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck size={20} />
            Roles Management
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {roles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 font-semibold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users size={20} />
            Users & Assignments
            <span className="ml-2 px-2 py-1 bg-slate-200 rounded-full text-xs font-bold">
              {users.length}
            </span>
          </button>
        </div>

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Role Definitions</h2>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                <Plus size={20} />
                New Role
              </button>
            </div>

            {roles.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No roles configured</p>
                <p className="text-slate-500 text-sm mt-1">Create your first role to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`border-2 rounded-xl p-6 hover:shadow-md transition-all bg-gradient-to-br ${getRoleColor(role.name)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{getRoleIcon(role.name)}</div>
                        <div>
                          <h3 className="font-bold text-lg">{role.name}</h3>
                          <p className="text-sm opacity-75">Role ID: {role.id}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/50 hover:bg-white rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 bg-white/50 hover:bg-white rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {role.permissions && role.permissions.length > 0 && (
                      <div className="pt-4 border-t border-current/20">
                        <p className="text-xs font-bold mb-2 opacity-75">PERMISSIONS:</p>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.slice(0, 3).map((perm, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-white/70 rounded-full font-medium"
                            >
                              ✓ {perm}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-white/70 rounded-full font-medium">
                              +{role.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">User Assignments</h2>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                <Plus size={20} />
                New User
              </button>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-600 font-medium">No users found</p>
                <p className="text-slate-500 text-sm mt-1">Create user accounts and assign roles</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">User</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Role</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Scope</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.firstName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-slate-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-slate-600">{user.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <Briefcase size={14} />
                            Multi-role
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            <Briefcase size={14} />
                            System
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                              user.is_super_admin
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {user.is_super_admin ? '✓ Super Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button className="p-2 hover:bg-blue-100 rounded transition-colors text-blue-600">
                              <Edit2 size={16} />
                            </button>
                            <button className="p-2 hover:bg-red-100 rounded transition-colors text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permission Matrix Info */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-300 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Lock className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">🔐 Permission System</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• <strong>Super Admin:</strong> Full system access across all companies</li>
              <li>• <strong>Admin:</strong> Administrative access to assigned company</li>
              <li>• <strong>Manager:</strong> Limited access to department/team data</li>
              <li>• <strong>Employee:</strong> Read-only access to own records</li>
              <li>• Permissions are aggregated when a user has multiple roles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
