'use client';

import React from 'react';

interface Berkas {
  id: string;
  nomor: string;
  namaPemohon?: string;
  tanggalBerkas?: string;
  kegiatan?: string;
  desa?: string;
  kecamatan?: string;
  status: string;
  isClosed?: boolean;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface BerkasTableProps {
  data: Berkas[];
  isLoading?: boolean;
  onView?: (id: string) => void;
  onClose?: (id: string) => void;
  showActions?: {
    view?: boolean;
    close?: boolean;
  };
  disableActionsForStatus?: string[]; // Disable close for specific statuses
}

const BerkasTable: React.FC<BerkasTableProps> = ({
  data,
  isLoading = false,
  onView,
  onClose,
  showActions = {
    view: true,
    close: false,
  },
  disableActionsForStatus = [],
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return 'bg-green-100 text-green-800';
      case 'PROSES':
        return 'bg-blue-100 text-blue-800';
      case 'DITUTUP':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SELESAI':
        return 'Selesai';
      case 'PROSES':
        return 'Proses';
      case 'DITUTUP':
        return 'Ditutup';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading berkas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '5%' }}
            >
              No.
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '11%' }}
            >
              No. Berkas
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '16%' }}
            >
              Nama Pemohon
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '11%' }}
            >
              Tanggal Masuk
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '16%' }}
            >
              Kegiatan
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '16%' }}
            >
              Desa, Kecamatan
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '10%' }}
            >
              Status
            </th>
            <th
              className="px-3 py-2 text-left text-xs font-bold text-gray-800 uppercase tracking-wider"
              style={{ width: '15%' }}
            >
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500 font-medium">
                Tidak ada berkas ditemukan
              </td>
            </tr>
          ) : (
            data.map((berkas, index) => (
              <tr key={berkas.id} className="hover:bg-blue-50 transition-colors duration-150">
                <td
                  className="px-3 py-2.5 whitespace-nowrap text-xs font-semibold text-gray-900"
                  style={{ width: '5%' }}
                >
                  {index + 1}
                </td>
                <td
                  className="px-3 py-2.5 text-xs font-medium text-gray-900"
                  style={{ width: '11%' }}
                >
                  <div className="truncate" title={berkas.nomor}>
                    {berkas.nomor}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-700" style={{ width: '16%' }}>
                  <div className="truncate" title={berkas.namaPemohon || '-'}>
                    {berkas.namaPemohon || '-'}
                  </div>
                </td>
                <td
                  className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap"
                  style={{ width: '11%' }}
                >
                  {formatDate(berkas.tanggalBerkas)}
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-700" style={{ width: '16%' }}>
                  <div className="truncate" title={berkas.kegiatan || '-'}>
                    {berkas.kegiatan || '-'}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-700" style={{ width: '16%' }}>
                  <div
                    className="truncate"
                    title={`${berkas.desa || '-'}, ${berkas.kecamatan || '-'}`}
                  >
                    <span className="block font-medium text-xs">{berkas.desa || '-'}</span>
                    <span className="block text-[10px] text-gray-500">
                      {berkas.kecamatan || '-'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ width: '10%' }}>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(
                        berkas.status
                      )}`}
                    >
                      {getStatusLabel(berkas.status)}
                    </span>
                    {berkas.isClosed && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        🔒 Ditutup
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 whitespace-nowrap" style={{ width: '15%' }}>
                  <div className="flex gap-1">
                    {showActions.view && (
                      <button
                        onClick={() => onView?.(berkas.id)}
                        title="Lihat Detail"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    )}
                    {showActions.close && !disableActionsForStatus.includes(berkas.status) && (
                      <button
                        onClick={() => onClose?.(berkas.id)}
                        title="Tutup Berkas"
                        className="p-1.5 rounded-lg text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BerkasTable;
