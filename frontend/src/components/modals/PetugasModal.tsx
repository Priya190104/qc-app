import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Petugas } from '@/types';
import { Modal, ModalHeader, ModalBody } from '@/components/ui';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} titleId="petugas-modal-title" maxWidth="md">
      <ModalHeader
        id="petugas-modal-title"
        title={editPetugas ? 'Edit Petugas' : 'Tambah Petugas Baru'}
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <ModalBody scrollable className="space-y-4">
          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm"
            >
              {error}
            </div>
          )}

          {/* Nama & NIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="petugas-nama"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Nama Petugas{' '}
                <span className="text-red-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="petugas-nama"
                type="text"
                autoFocus
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                placeholder="Nama lengkap petugas"
              />
            </div>
            <div>
              <label
                htmlFor="petugas-nip"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                NIP{' '}
                <span className="text-red-500 ml-0.5" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="petugas-nip"
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                placeholder="Nomor Induk Pegawai"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="petugas-isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <div>
              <label
                htmlFor="petugas-isActive"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Petugas Aktif
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                Petugas dapat menerima penugasan jika statusnya aktif
              </p>
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
