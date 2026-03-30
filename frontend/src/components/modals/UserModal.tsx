import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { User, UserRole } from '@/types';

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
    roleId: '',
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
        roleId: editUser.roles?.[0]?.id || '',
        isActive: editUser.isActive,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        roleId: '',
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
      if (formData.roleId === '') {
        throw new Error('Role harus dipilih');
      }

      const url = editUser ? `/users/${editUser.id}` : '/users';

      // Prepare payload - exclude empty password on edit
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        roleIds: [formData.roleId],
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {editUser ? 'Edit User' : 'Tambah User Baru'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Nama Depan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Depan *</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John"
            />
          </div>

          {/* Nama Belakang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Belakang *</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email {editUser && '(Read-only)'}*
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editUser}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="john@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editUser && '(Kosongkan jika tidak ingin ubah)'}*
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={editUser ? 'Leave blank to keep current' : 'Minimum 8 characters'}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="08123456789"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Pilih Role --</option>
              {roles.length === 0 ? (
                <option disabled>Tidak ada role tersedia</option>
              ) : (
                roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Aktif</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
