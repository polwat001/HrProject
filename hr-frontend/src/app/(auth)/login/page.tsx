'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Lock, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { authAPI } from '@/services/api';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAvailableCompanies, setCurrentCompanyId, setToken } = useAppStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authAPI.login(username, password);
      
      const { token, user, availableCompanies } = response.data;

      // Store token
      localStorage.setItem('hr_token', token);

      // Update store
      setUser(user);
      setAvailableCompanies(availableCompanies || []);
      setToken(token);
      
      // Set default company
      if (user.is_super_admin) {
        setCurrentCompanyId(null); // null means "All Companies" for super admin
      } else if (availableCompanies?.length > 0) {
        setCurrentCompanyId(availableCompanies[0].company_id);
      }

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <Building2 size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          HR Group System
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ลงชื่อเข้าใช้ระบบบริหารจัดการทรัพยากรบุคคล
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10">
          
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้ (Username)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="เช่น nadech"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">รหัสผ่าน (Password)</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  จดจำการเข้าสู่ระบบ
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </form>

          {/* ข้อมูล Mock สำหรับ Demo */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Demo Accounts:</h4>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>Super Admin: <code className="bg-gray-100 px-1 rounded">superadmin</code> / 123456</li>
              <li>HR HQ: <code className="bg-gray-100 px-1 rounded">hr_hq</code> / 123456</li>
              <li>Staff (Factory): <code className="bg-gray-100 px-1 rounded">nadech</code> / 123456</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}