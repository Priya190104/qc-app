'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useLayoutStore } from '@/stores/layoutStore';
import { useAuthStore } from '@/stores';
import authService from '@/lib/auth';
import {
  LayoutDashboard,
  FileText,
  Files,
  Clock,
  CheckCircle2,
  UserCheck,
  Users,
  Database,
  BarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  onOpenSurvey?: () => void;
  /** Whether the mobile overlay drawer is open */
  mobileOpen?: boolean;
  /** Called when user requests to close the mobile drawer */
  onMobileClose?: () => void;
}

export default function Sidebar({
  onOpenSurvey,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { user } = useAuthStore();
  const [berkasDropdownOpen, setBerkasDropdownOpen] = useState(false);

  const isAdmin = useMemo(() => {
    const roles = authService.getTokenRoles().map((r) => r.toLowerCase().trim());
    return roles.some((r) => r === 'administrator' || r === 'admin');
  }, []);

  const adminNavItems: NavItem[] = useMemo(
    () =>
      isAdmin
        ? [
            { label: 'Petugas', href: '/petugas', icon: UserCheck },
            { label: 'Manajemen User', href: '/akun', icon: Users },
            { label: 'Backup Data', href: '/backup', icon: Database },
            { label: 'Hasil UMUX', href: '/umux-results', icon: BarChart2 },
          ]
        : [],
    [isAdmin]
  );

  const berkasSubItems = [
    { label: 'Semua Berkas', href: '/berkas/all', icon: Files },
    { label: 'Berkas Proses', href: '/berkas/proses', icon: Clock },
    { label: 'Berkas Selesai', href: '/berkas/selesai', icon: CheckCircle2 },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const isBerkasActive = () => pathname.startsWith('/berkas');
  const isBerkasSubActive = (href: string) => pathname === href || pathname.startsWith(href);

  const userDisplayName = user
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email
    : null;
  const userInitial =
    user?.firstName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? null;
  const userRoleName = user?.roles?.[0]?.name ?? '';
  const roleLabel =
    userRoleName.toLowerCase() === 'administrator' || userRoleName.toLowerCase() === 'admin'
      ? 'Administrator'
      : userRoleName.toLowerCase() === 'petugas'
        ? 'Petugas'
        : userRoleName || null;

  return (
    <aside
      id="sidebar-nav"
      aria-label="Navigasi Utama"
      className={`fixed left-0 top-0 h-screen bg-gray-900 flex flex-col z-40 transition-[width,transform] duration-200 ease-out ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      {/* Brand header */}
      <div
        className={`flex items-center h-16 shrink-0 border-b border-white/[0.06] ${
          sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4'
        }`}
      >
        {sidebarCollapsed ? (
          <Link
            href="/dashboard"
            className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
            aria-label="QC Berkas – Dashboard"
          >
            <FileText className="w-[18px] h-[18px] text-white" aria-hidden="true" />
          </Link>
        ) : (
          <>
            <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white tracking-wide leading-tight truncate">
                  QC BERKAS
                </p>
                <p className="text-[10px] text-gray-500 leading-tight truncate">
                  Kontrol Kualitas Dokumen
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={toggleSidebar}
              className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Tutup sidebar"
              aria-expanded={!sidebarCollapsed}
              aria-controls="sidebar-nav"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 flex flex-col gap-0.5">
        {/* Dashboard */}
        <SidebarLink
          href="/dashboard"
          label="Dashboard"
          icon={LayoutDashboard}
          active={isActive('/dashboard')}
          collapsed={sidebarCollapsed}
        />

        {/* Berkas group with submenu */}
        <div>
          <button
            type="button"
            onClick={() => !sidebarCollapsed && setBerkasDropdownOpen((o) => !o)}
            aria-expanded={!sidebarCollapsed ? berkasDropdownOpen : undefined}
            aria-controls={!sidebarCollapsed ? 'berkas-submenu' : undefined}
            aria-label={sidebarCollapsed ? 'Berkas' : undefined}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors group ${
              isBerkasActive()
                ? 'bg-blue-600/[0.12] text-blue-400'
                : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
            } ${sidebarCollapsed ? 'justify-center' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset`}
          >
            {isBerkasActive() && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full" />
            )}
            <span className="flex items-center gap-3 flex-1 min-w-0">
              <FileText
                aria-hidden="true"
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isBerkasActive() ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
              />
              {!sidebarCollapsed && <span className="truncate">Berkas</span>}
            </span>
            {!sidebarCollapsed && (
              <ChevronDown
                aria-hidden="true"
                className={`w-3.5 h-3.5 text-gray-600 shrink-0 transition-transform duration-150 ${
                  berkasDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Submenu */}
          {!sidebarCollapsed && berkasDropdownOpen && (
            <div
              id="berkas-submenu"
              className="mt-0.5 ml-3.5 pl-3 border-l border-white/[0.07] flex flex-col gap-0.5"
            >
              {berkasSubItems.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12.5px] font-medium transition-colors group ${
                    isBerkasSubActive(sub.href)
                      ? 'text-blue-400 bg-blue-600/[0.10]'
                      : 'text-gray-500 hover:text-gray-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {isBerkasSubActive(sub.href) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-blue-500 rounded-r-full" />
                  )}
                  <sub.icon
                    className={`w-[15px] h-[15px] shrink-0 ${
                      isBerkasSubActive(sub.href)
                        ? 'text-blue-400'
                        : 'text-gray-600 group-hover:text-gray-400'
                    }`}
                  />
                  <span className="truncate">{sub.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Admin items */}
        {adminNavItems.length > 0 && (
          <>
            <div
              className={`${sidebarCollapsed ? 'mx-3 my-2' : 'mx-1 my-2'} border-t border-white/[0.06]`}
            />
            {!sidebarCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold text-gray-600 uppercase tracking-[0.09em]">
                Administrasi
              </p>
            )}
            {adminNavItems.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                collapsed={sidebarCollapsed}
              />
            ))}
          </>
        )}
      </nav>

      {/* Footer: user info + logout */}
      <div className="shrink-0 border-t border-white/[0.06] p-2">
        {/* User chip (expanded only) */}
        {!sidebarCollapsed && userInitial && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 min-w-0">
            <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-semibold text-blue-400">{userInitial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-gray-300 truncate leading-tight">
                {userDisplayName}
              </p>
              {roleLabel && (
                <p className="text-[10px] text-gray-600 leading-tight truncate">{roleLabel}</p>
              )}
            </div>
          </div>
        )}

        {/* Isi Survei UMUX */}
        {onOpenSurvey && (
          <button
            type="button"
            onClick={onOpenSurvey}
            aria-label={sidebarCollapsed ? 'Isi Survei Kepuasan' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-gray-500 hover:text-blue-400 hover:bg-blue-500/[0.08] transition-colors group ${
              sidebarCollapsed ? 'justify-center' : ''
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset`}
          >
            <ClipboardList
              className="w-[18px] h-[18px] shrink-0 transition-colors group-hover:text-blue-400"
              aria-hidden="true"
            />
            {!sidebarCollapsed && <span>Isi Survei Kepuasan</span>}
          </button>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label={sidebarCollapsed ? 'Keluar' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors group ${
            sidebarCollapsed ? 'justify-center' : ''
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset`}
        >
          <LogOut
            className="w-[18px] h-[18px] shrink-0 transition-colors group-hover:text-red-400"
            aria-hidden="true"
          />
          {!sidebarCollapsed && <span>Keluar</span>}
        </button>

        {/* Expand toggle (collapsed state only) */}
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Buka sidebar"
            aria-expanded={false}
            aria-controls="sidebar-nav"
            className="w-full mt-1 flex items-center justify-center py-2 text-gray-700 hover:text-gray-400 hover:bg-white/[0.04] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
}

// ── Reusable nav link ────────────────────────────────────────────────────────

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
}

function SidebarLink({ href, label, icon: Icon, active, collapsed }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-colors group ${
        active
          ? 'bg-blue-600/[0.12] text-blue-400'
          : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
      } ${collapsed ? 'justify-center' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset`}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-500 rounded-r-full"
          aria-hidden="true"
        />
      )}
      <Icon
        aria-hidden="true"
        className={`w-[18px] h-[18px] shrink-0 transition-colors ${
          active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
        }`}
      />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
