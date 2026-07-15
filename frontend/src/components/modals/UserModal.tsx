import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User, UserRole } from '@/types';
import { Modal, ModalHeader, ModalBody } from '@/components/ui';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editUser?: User | null;
  roles: UserRole[];
}

export default function UserModal({ isOpen, onClose, onSuccess, editUser, roles }: UserModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleIds: [] as string[],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editUser) {
      setFormData({
        firstName: editUser.firstName || '',
        lastName: editUser.lastName || '',
        email: editUser.email || '',
        password: '',
        phoneNumber: editUser.phoneNumber || '',
        roleIds: editUser.roles?.map((r) => r.id) ?? [],
        isActive: editUser.isActive,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleIds: [],
        isActive: true,
      });
    }
    setError(null);
  }, [editUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.firstName.trim()) {
        throw new Error('Nama depan harus diisi');
      }
      if (!formData.lastName.trim()) {
        throw new Error('Nama belakang harus diisi');
      }
      if (!formData.email.trim()) {
        throw new Error('Email harus diisi');
      }
      if (!editUser && !formData.password) {
        throw new Error('Password harus diisi untuk user baru');
      }
      if (!editUser && formData.password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }
      if (formData.roleIds.length === 0) {
        throw new Error('Minimal satu role harus dipilih');
      }

      const url = editUser ? `/users/${editUser.id}` : '/users';

      // Prepare payload - exclude empty password on edit
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roleIds: formData.roleIds,
      };

      // Only include isActive for PATCH (edit) requests
      if (editUser) {
        payload.isActive = formData.isActive;
      }

      if (!editUser || formData.password) {
        payload.password = formData.password;
        if (!editUser) {
          payload.email = formData.email;
        }
      }

      if (editUser) {
        await apiClient.patch(url, payload);
      } else {
        await apiClient.post(url, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to save user';
      setError(message);
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="user-modal-title" maxWidth="md">
      <ModalHeader
        id="user-modal-title"
        title={editUser ? 'Edit User' : 'Tambah User Baru'}
        onClose={onClose}
      />

      {/* Body */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody scrollable className="space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm"
            >
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user-firstName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nama Depan{' '}
                <span className="text-red-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="user-firstName"
                type="text"
                autoFocus
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                placeholder="Nama depan"
              />
            </div>
            <div>
              <label
                htmlFor="user-lastName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nama Belakang{' '}
                <span className="text-red-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="user-lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                placeholder="Nama belakang"
              />
            </div>
          </div>

          {/* Email & Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="user-email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
                {editUser ? (
                  <span className="text-gray-400 font-normal text-xs ml-1">
                    (tidak dapat diubah)
                  </span>
                ) : (
                  <span className="text-red-500 ml-0.5" aria-hidden="true">
                    *
                  </span>
                )}
              </label>
              <input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editUser}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                placeholder="nama@contoh.com"
              />
            </div>
            <div>
              <label
                htmlFor="user-phone"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nomor Telepon
              </label>
              <input
                id="user-phone"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="user-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
              {!editUser && (
                <span className="text-red-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            <input
              id="user-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              placeholder={editUser ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 8 karakter'}
            />
            {!editUser && <p className="mt-1 text-xs text-gray-500">Minimal 8 karakter.</p>}
          </div>

          {/* Role */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Role{' '}
              <span className="text-red-500 ml-0.5" aria-hidden="true">
                *
              </span>
              <span className="text-xs text-gray-400 font-normal ml-1.5">
                Pilih satu atau lebih
              </span>
            </p>
            {roles.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                Tidak ada role tersedia
              </p>
            ) : (
              <div
                className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-40 overflow-y-auto"
                role="group"
                aria-label="Pilih role"
              >
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={role.id}
                      checked={formData.roleIds.includes(role.id)}
                      onChange={(e) => {
                        const id = e.target.value;
                        setFormData({
                          ...formData,
                          roleIds: e.target.checked
                            ? [...formData.roleIds, id]
                            : formData.roleIds.filter((r) => r !== id),
                        });
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="user-isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <div>
              <label
                htmlFor="user-isActive"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Akun Aktif
              </label>
              <p className="text-xs text-gray-500 mt-0.5">User dapat login jika statusnya aktif</p>
            </div>
          </div>
        </ModalBody>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {loading && (
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                aria-hidden="true"
              />
            )}
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
