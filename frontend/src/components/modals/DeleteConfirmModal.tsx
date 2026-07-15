import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui';

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="delete-user-title"
      descriptionId="delete-user-desc"
      maxWidth="sm"
    >
      <ModalHeader
        id="delete-user-title"
        title="Hapus User"
        onClose={onClose}
        icon={
          <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-red-600" aria-hidden="true" />
          </span>
        }
      />

      <ModalBody id="delete-user-desc" className="space-y-3">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-lg text-sm"
          >
            {error}
          </div>
        )}
        <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus user berikut?</p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
          <p className="text-sm font-semibold text-gray-900">{userName}</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Tindakan ini tidak dapat dibatalkan. Semua data terkait user ini akan dihapus.
        </p>
      </ModalBody>

      <ModalFooter className="justify-between">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
        >
          {loading && (
            <span
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
          )}
          {loading ? 'Menghapus...' : 'Hapus'}
        </button>
      </ModalFooter>
    </Modal>
  );
}
