'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button, Alert, PageHeader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { User, UserRole } from '@/types';
import UserModal from '@/components/modals/UserModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

// ─── Role configuration ──────────────────────────────────────────────────────

const ROLE_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  administrator: {
    label: 'Administrator',
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    dot: 'bg-violet-500',
  },
  'operator-data-berkas': {
    label: 'Op. Data Berkas',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    dot: 'bg-blue-500',
  },
  'operator-data-pemetaan': {
    label: 'Op. Data Pemetaan',
    badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
    dot: 'bg-cyan-500',
  },
  'operator-data-ukur': {
    label: 'Op. Data Ukur',
    badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
  },
  'petugas-ukur': {
    label: 'Petugas Ukur',
    badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    dot: 'bg-indigo-500',
  },
  'petugas-pemetaan': {
    label: 'Petugas Pemetaan',
    badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
    dot: 'bg-teal-500',
  },
  kks: {
    label: 'KKS',
    badge: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
    dot: 'bg-purple-500',
  },
  'kepala-seksi': {
    label: 'Kepala Seksi',
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
  },
  'quality-control-officer': {
    label: 'Quality Control',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
  },
};

const DEFAULT_ROLE_CFG = {
  label: 'User',
  badge: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  dot: 'bg-gray-400',
};

function getRoleCfg(name: string) {
  return ROLE_CONFIG[name] ?? DEFAULT_ROLE_CFG;
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  'bg-blue-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-600',
  'bg-orange-500',
  'bg-teal-500',
];

function avatarColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

function UserAvatar({ user }: { user: User }) {
  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-white text-xs font-semibold select-none ${avatarColor(user.id)}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-200 rounded animate-pulse w-36" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-48" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-28" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16" />
          </td>
          <td className="px-4 py-3 text-right">
            <div className="h-5 bg-gray-200 rounded animate-pulse w-20 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AkunPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);

  // Search / filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersResponse = await apiClient.get<any>('/users?limit=1000');
      console.log('Users Response:', usersResponse.data);
      let userData: User[] = [];
      if (usersResponse.data?.data?.data) {
        userData = Array.isArray(usersResponse.data.data.data) ? usersResponse.data.data.data : [];
      } else if (usersResponse.data?.data) {
        userData = Array.isArray(usersResponse.data.data) ? usersResponse.data.data : [];
      } else if (Array.isArray(usersResponse.data)) {
        userData = usersResponse.data;
      }
      console.log('Processed Users Data:', userData);
      setUserList(userData);

      // Fetch roles - get all roles (both active and inactive)
      const rolesResponse = await apiClient.get<any>('/roles?isActive=true');
      console.log('Roles Response:', rolesResponse.data);
      let roleData: UserRole[] = [];
      if (rolesResponse.data?.data?.data) {
        roleData = Array.isArray(rolesResponse.data.data.data) ? rolesResponse.data.data.data : [];
      } else if (rolesResponse.data?.data) {
        roleData = Array.isArray(rolesResponse.data.data) ? rolesResponse.data.data : [];
      } else if (Array.isArray(rolesResponse.data)) {
        roleData = rolesResponse.data;
      }
      console.log('Processed Roles Data:', roleData);
      setRoles(roleData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
      console.error('Error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUser({ id: user.id, name: `${user.firstName} ${user.lastName}` });
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  // ── Derived stats ──
  const stats = useMemo(() => {
    const total = userList.length;
    const active = userList.filter((u) => u.isActive).length;
    return { total, active, inactive: total - active };
  }, [userList]);

  // ── Filtered list ──
  const filteredUsers = useMemo(() => {
    return userList.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchSearch =
        !search ||
        fullName.includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = !roleFilter || (user.roles ?? []).some((r) => r.name === roleFilter);
      const matchStatus =
        !statusFilter || (statusFilter === 'active' ? user.isActive : !user.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [userList, search, roleFilter, statusFilter]);

  const hasActiveFilters = !!(search || roleFilter || statusFilter);

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Manajemen Akun"
        description="Kelola akun pengguna, role, dan hak akses sistem"
        actions={
          <Button variant="primary" size="sm" onClick={handleAddUser}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah User
          </Button>
        }
      />

      {error && <Alert type="error" title="Error" message={error} />}

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatChip label="Total Pengguna" value={stats.total} scheme="blue" loading={loading} />
        <StatChip label="Akun Aktif" value={stats.active} scheme="green" loading={loading} />
        <StatChip label="Tidak Aktif" value={stats.inactive} scheme="red" loading={loading} />
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Cari nama atau email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Semua Role</option>
          {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="py-2 px-3 text-sm text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Hapus filter
          </button>
        )}
      </div>

      {/* ── Table / card list ── */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Pengguna
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <TableSkeleton />
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-14 text-center">
                    <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden divide-y divide-gray-100">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 space-y-2.5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center">
              <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
              />
            ))
          )}
        </div>

        {/* Footer count */}
        {!loading && filteredUsers.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50 text-xs text-gray-400 text-right">
            {filteredUsers.length} dari {userList.length} pengguna
          </div>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSuccess={handleModalSuccess}
        editUser={editingUser}
        roles={roles}
      />

      {deleteUser && (
        <DeleteConfirmModal
          isOpen={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          onSuccess={handleModalSuccess}
          userName={deleteUser.name}
          userId={deleteUser.id}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  scheme,
  loading,
}: {
  label: string;
  value: number;
  scheme: 'blue' | 'green' | 'red';
  loading: boolean;
}) {
  const schemeMap = {
    blue: { wrap: 'bg-blue-50 border-blue-100', num: 'text-blue-700' },
    green: { wrap: 'bg-emerald-50 border-emerald-100', num: 'text-emerald-700' },
    red: { wrap: 'bg-red-50 border-red-100', num: 'text-red-600' },
  };
  const s = schemeMap[scheme];
  return (
    <div className={`border rounded-lg px-4 py-3 ${s.wrap}`}>
      {loading ? (
        <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mb-1" />
      ) : (
        <p className={`text-2xl font-semibold leading-none mb-1 ${s.num}`}>{value}</p>
      )}
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = getRoleCfg(role.name);
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isActive ? 'bg-emerald-500' : 'bg-gray-400'
        }`}
      />
      {isActive ? 'Aktif' : 'Tidak Aktif'}
    </span>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 text-gray-400">
      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      <p className="text-sm font-medium text-gray-500">
        {hasFilters ? 'Tidak ada pengguna yang cocok dengan filter' : 'Belum ada pengguna'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="text-sm text-blue-600 hover:underline">
          Hapus filter
        </button>
      )}
    </div>
  );
}

function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  return (
    <tr
      className={`group transition-colors hover:bg-gray-50/70 ${
        !user.isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Pengguna */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="font-medium text-gray-900 truncate text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3">
        {user.roles && user.roles.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <RoleBadge key={role.id} role={role} />
            ))}
          </div>
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${DEFAULT_ROLE_CFG.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${DEFAULT_ROLE_CFG.dot}`} />
            {DEFAULT_ROLE_CFG.label}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <ActiveBadge isActive={user.isActive} />
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onEdit(user)}
            className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Edit
          </button>
          <span className="w-px h-3.5 bg-gray-200" aria-hidden="true" />
          <button
            onClick={() => onDelete(user)}
            className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Hapus
          </button>
        </div>
      </td>
    </tr>
  );
}

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}) {
  return (
    <div className={`p-4 ${!user.isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <ActiveBadge isActive={user.isActive} />
      </div>

      {/* Role badges */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {user.roles && user.roles.length > 0 ? (
          user.roles.map((role) => <RoleBadge key={role.id} role={role} />)
        ) : (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${DEFAULT_ROLE_CFG.badge}`}
          >
            {DEFAULT_ROLE_CFG.label}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onEdit(user)}
          className="flex-1 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(user)}
          className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
