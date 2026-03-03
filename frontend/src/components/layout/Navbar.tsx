'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useLayoutStore } from '@/stores/layoutStore';
import authService from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const [berkasDropdownOpen, setBerkasDropdownOpen] = useState(false);

  const isAdmin = useMemo(() => {
    const roles = authService.getTokenRoles().map((r) => r.toLowerCase().trim());
    return roles.some((r) => r === 'administrator' || r === 'admin');
  }, []);

  const navItems: NavItem[] = useMemo(
    () =>
      isAdmin
        ? [
            { label: 'Petugas', href: '/petugas', icon: '👤' },
            { label: 'Manajemen User', href: '/akun', icon: '👥' },
            { label: 'Backup Data', href: '/backup', icon: '🗄️' },
          ]
        : [],
    [isAdmin]
  );

  const berkasSubItems = [
    { label: 'Semua Berkas', href: '/berkas/all', icon: '📋' },
    { label: 'Berkas Proses', href: '/berkas/proses', icon: '⏱️' },
    { label: 'Berkas Selesai', href: '/berkas/selesai', icon: '✅' },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isBerkasActive = () => {
    return pathname.startsWith('/berkas');
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!sidebarCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl">📋</div>
            <div>
              <div className="text-sm font-bold">QC BERKAS</div>
              <div className="text-xs text-gray-400">Control</div>
            </div>
          </Link>
        )}
        <button
          onClick={() => toggleSidebar()}
          className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {sidebarCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-2 py-6 space-y-2">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard') ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
          title={sidebarCollapsed ? 'Dashboard' : ''}
        >
          <span className="text-xl flex-shrink-0">📊</span>
          {!sidebarCollapsed && <span className="text-sm font-medium">Dashboard</span>}
        </Link>

        {/* Berkas with Dropdown */}
        <div>
          <button
            onClick={() => setBerkasDropdownOpen(!berkasDropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              isBerkasActive() ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? 'Berkas' : ''}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl flex-shrink-0">📄</span>
              {!sidebarCollapsed && <span className="text-sm font-medium">Berkas</span>}
            </div>
            {!sidebarCollapsed && (
              <span
                className={`text-xs transition-transform ${berkasDropdownOpen ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            )}
          </button>

          {/* Berkas Submenu */}
          {berkasDropdownOpen && !sidebarCollapsed && (
            <div className="mt-1 ml-2 space-y-1 border-l border-gray-700 pl-2">
              {berkasSubItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                    pathname === subItem.href || pathname.startsWith(subItem.href)
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                  }`}
                >
                  <span className="text-lg">{subItem.icon}</span>
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Other Nav Items */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive(item.href) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
            }`}
            title={sidebarCollapsed ? item.label : ''}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer - Logout */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          title={sidebarCollapsed ? 'Logout' : ''}
        >
          <span className="text-xl flex-shrink-0">🚪</span>
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
