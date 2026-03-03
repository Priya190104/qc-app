import React, { useState } from 'react';
import { apiClient } from '@/lib/api';

interface DeletePetugasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  petugasName: string;
  petugasId: string;
}

export default function DeletePetugasModal({
  isOpen,
  onClose,
  onSuccess,
  petugasName,
  petugasId,
}: DeletePetugasModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/petugas/${petugasId}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to delete petugas';
      setError(message);
      console.error('Error deleting petugas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <h2 className="text-lg font-semibold text-red-900">Hapus Petugas</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <p className="text-gray-700 mb-2">Apakah Anda yakin ingin menghapus petugas:</p>
            <p className="text-lg font-semibold text-gray-900">{petugasName}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">⚠️ Perhatian:</span> Petugas tidak dapat dihapus jika
              masih memiliki dokumen aktif (belum di-archive).
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
