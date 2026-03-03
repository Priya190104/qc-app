import React, { useState } from 'react';
import { apiClient } from '@/lib/api';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userName: string;
  userId: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  userName,
  userId,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/users/${userId}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to delete user';
      setError(message);
      console.error('Error deleting user:', err);
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
        {/* Icon & Title */}
        <div className="p-6 text-center border-b border-gray-200">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Hapus User?</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <p className="text-gray-600 text-sm mb-2">
            Apakah Anda yakin ingin menghapus user berikut?
          </p>
          <p className="text-gray-900 font-semibold text-lg">{userName}</p>

          <p className="text-gray-500 text-xs mt-4">
            Tindakan ini tidak dapat dibatalkan. Semua data terkait user ini akan dihapus.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}
