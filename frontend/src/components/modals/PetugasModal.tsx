import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Petugas } from '@/types';

interface PetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editPetugas?: Petugas | null;
  defaultDepartemen?: string;
}

export default function PetugasModal({
  isOpen,
  onClose,
  onSuccess,
  editPetugas,
  defaultDepartemen,
}: PetugasModalProps) {
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    departemen: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when editing
  useEffect(() => {
    if (editPetugas) {
      setFormData({
        nama: editPetugas.nama || '',
        nip: editPetugas.nip || '',
        departemen: editPetugas.departemen || '',
        isActive: editPetugas.isActive !== false,
      });
    } else {
      setFormData({
        nama: '',
        nip: '',
        departemen: defaultDepartemen || '',
        isActive: true,
      });
    }
    setError(null);
  }, [editPetugas, defaultDepartemen, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.nama.trim()) {
        throw new Error('Nama petugas harus diisi');
      }
      if (!formData.nip.trim()) {
        throw new Error('NIP harus diisi');
      }

      const url = editPetugas ? `/petugas/${editPetugas.id}` : '/petugas';

      const payload = {
        nama: formData.nama,
        nip: formData.nip,
        departemen: formData.departemen,
        isActive: formData.isActive,
      };

      if (editPetugas) {
        await apiClient.patch(url, payload);
      } else {
        await apiClient.post(url, payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to save petugas';
      setError(message);
      console.error('Error saving petugas:', err);
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
            {editPetugas ? 'Edit Petugas' : 'Tambah Petugas Baru'}
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

          {/* Nama Petugas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Petugas *</label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama petugas"
            />
          </div>

          {/* NIP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIP *</label>
            <input
              type="text"
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan NIP"
            />
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
