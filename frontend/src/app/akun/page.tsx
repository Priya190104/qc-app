'use client';

import React, { useState, useEffect } from 'react';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { User, UserRole } from '@/types';
import UserModal from '@/components/modals/UserModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';

/**
 * User (Account) Management Page
 * Manages all user accounts and their permissions
 */
export default function AkunPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<{ id: string; name: string } | null>(null);

  // Fetch users and roles
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersResponse = await apiClient.get<any>('/users');
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
    setDeleteUser({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
    });
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const getRoleBadgeColor = (role: string) => {
    const roleMap: { [key: string]: string } = {
      administrator: 'bg-purple-100 text-purple-800',
      'operator-data-berkas': 'bg-blue-100 text-blue-800',
      'operator-data-pemetaan': 'bg-blue-100 text-blue-800',
      'operator-data-ukur': 'bg-blue-100 text-blue-800',
      'quality-control-officer': 'bg-amber-100 text-amber-800',
    };
    return roleMap[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      administrator: 'Administrator',
      'operator-data-berkas': 'Operator Data Berkas',
      'operator-data-pemetaan': 'Operator Data Pemetaan',
      'operator-data-ukur': 'Operator Data Ukur',
      'quality-control-officer': 'Quality Control Officer',
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-600 mt-1">Kelola hak akses dan permission user</p>
        </div>
        <Button variant="primary" onClick={handleAddUser}>
          + Tambah User
        </Button>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* User Management Section */}
      <div className="bg-gray-900 text-white rounded-lg p-6 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-3xl mr-3">👤</span>
          <h2 className="text-xl font-semibold">Manajemen User</h2>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Email</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Role</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(userList) || userList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Belum ada user
                  </td>
                </tr>
              ) : (
                userList.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      {/* Get first role if available */}
                      {user.roles && user.roles.length > 0 ? (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(
                            user.roles[0].name
                          )}`}
                        >
                          {getRoleLabel(user.roles[0].name)}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit user"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete user"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
