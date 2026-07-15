'use client';

import React from 'react';
import { Eye, Lock, FileSearch } from 'lucide-react';
import { getStatusConfig } from '@/lib/constants/status';
import { formatDate } from '@/lib/utils';

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
  disableActionsForStatus?: string[];
}

// ── Skeleton loading state ───────────────────────────────────────────────────

const SkeletonRow = ({ index }: { index: number }) => (
  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
    {[5, 12, 18, 10, 18, 16, 9, 12].map((w, i) => (
      <td key={i} className="px-3 py-3">
        <div
          className="h-3.5 rounded-md bg-gray-200 animate-pulse"
          style={{ width: `${w * 4}px`, maxWidth: '100%' }}
        />
      </td>
    ))}
  </tr>
);

// ── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <tr>
    <td colSpan={8}>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <FileSearch className="w-7 h-7 text-gray-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">Tidak ada berkas ditemukan</p>
        <p className="text-xs text-gray-500 max-w-xs">
          Coba ubah filter pencarian atau periksa kembali kriteria yang digunakan.
        </p>
      </div>
    </td>
  </tr>
);

const MobileEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
      <FileSearch className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700 mb-1">Tidak ada berkas ditemukan</p>
    <p className="text-xs text-gray-500 max-w-xs">
      Coba ubah filter pencarian atau periksa kembali kriteria yang digunakan.
    </p>
  </div>
);

// ── Main component ───────────────────────────────────────────────────────────

const BerkasTable: React.FC<BerkasTableProps> = ({
  data,
  isLoading = false,
  onView,
  onClose,
  showActions = { view: true, close: false },
  disableActionsForStatus = [],
}) => {
  const ActionButtons = ({ berkas }: { berkas: Berkas }) => (
    <div className="flex items-center gap-1.5">
      {showActions.view && (
        <button
          onClick={() => onView?.(berkas.id)}
          title="Lihat Detail"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150"
        >
          <Eye className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Detail</span>
        </button>
      )}
      {showActions.close && !disableActionsForStatus.includes(berkas.status) && (
        <button
          onClick={() => onClose?.(berkas.id)}
          title="Tutup Berkas"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-colors duration-150"
        >
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Tutup</span>
        </button>
      )}
    </div>
  );

  const StatusBadgeCell = ({ berkas }: { berkas: Berkas }) => {
    const cfg = getStatusConfig(berkas.status);
    return (
      <div className="flex flex-col gap-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${cfg.badge}`}
        >
          {cfg.label}
        </span>
        {berkas.isClosed && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-600 ring-1 ring-gray-200">
            <Lock className="w-2.5 h-2.5" />
            Ditutup
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Mobile card view ─────────────────────────────────────────── */}
      <div className="block md:hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`p-4 ${i % 2 === 1 ? 'bg-gray-50/60' : ''}`}>
                <div className="flex justify-between mb-3">
                  <div className="h-3.5 w-28 rounded-md bg-gray-200 animate-pulse" />
                  <div className="h-5 w-16 rounded-md bg-gray-200 animate-pulse" />
                </div>
                <div className="space-y-2">
                  {[80, 60, 72, 64].map((w, j) => (
                    <div
                      key={j}
                      className="h-3 rounded-md bg-gray-200 animate-pulse"
                      style={{ width: `${w}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <MobileEmptyState />
        ) : (
          <div className="divide-y divide-gray-100">
            {data.map((berkas, index) => (
              <div
                key={berkas.id}
                className={`p-4 transition-colors duration-100 hover:bg-blue-50/50 ${
                  index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-semibold text-gray-400 tabular-nums shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-gray-900 truncate" title={berkas.nomor}>
                      {berkas.nomor}
                    </span>
                  </div>
                  <div className="shrink-0">
                    <StatusBadgeCell berkas={berkas} />
                  </div>
                </div>
                <dl className="space-y-1 mb-3">
                  {[
                    { label: 'Pemohon', value: berkas.namaPemohon },
                    { label: 'Tgl. Masuk', value: formatDate(berkas.tanggalBerkas) },
                    { label: 'Kegiatan', value: berkas.kegiatan },
                    {
                      label: 'Lokasi',
                      value:
                        berkas.desa && berkas.kecamatan
                          ? `${berkas.desa}, ${berkas.kecamatan}`
                          : berkas.desa || berkas.kecamatan,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex gap-2 text-xs">
                      <dt className="font-medium text-gray-500 shrink-0 w-[88px]">{label}</dt>
                      <dd className="text-gray-700 truncate">{value || '—'}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex justify-end">
                  <ActionButtons berkas={berkas} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop table view ───────────────────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[5%]">
                No.
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[12%]">
                No. Berkas
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[18%]">
                Nama Pemohon
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[10%]">
                Tgl. Masuk
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[18%]">
                Kegiatan
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[15%]">
                Lokasi
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[10%]">
                Status
              </th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-[12%]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} index={i} />)
            ) : data.length === 0 ? (
              <EmptyState />
            ) : (
              data.map((berkas, index) => (
                <tr
                  key={berkas.id}
                  className={`transition-colors duration-100 hover:bg-blue-50/50 ${
                    index % 2 === 1 ? 'bg-gray-50/40' : 'bg-white'
                  }`}
                >
                  <td className="px-3 py-3 text-xs tabular-nums font-medium text-gray-400 whitespace-nowrap">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className="text-xs font-semibold text-gray-900 truncate block max-w-[130px]"
                      title={berkas.nomor}
                    >
                      {berkas.nomor}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="text-xs text-gray-800 truncate block max-w-[180px]"
                      title={berkas.namaPemohon || '—'}
                    >
                      {berkas.namaPemohon || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-600 whitespace-nowrap tabular-nums">
                    {formatDate(berkas.tanggalBerkas)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="text-xs text-gray-700 truncate block max-w-[180px]"
                      title={berkas.kegiatan || '—'}
                    >
                      {berkas.kegiatan || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="block text-xs font-medium text-gray-800 truncate"
                      title={berkas.desa || '—'}
                    >
                      {berkas.desa || '—'}
                    </span>
                    <span
                      className="block text-[11px] text-gray-500 truncate"
                      title={berkas.kecamatan || '—'}
                    >
                      {berkas.kecamatan || '—'}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <StatusBadgeCell berkas={berkas} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <ActionButtons berkas={berkas} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BerkasTable;
