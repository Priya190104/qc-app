'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';

interface BackupLog {
  id: string;
  filename: string;
  fileSizeBytes: string;
  fileSizeKB: string;
  fileSizeMB: string;
  totalBerkas: number;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  createdAt: string;
}

interface BackupStats {
  totalBackups: number;
  successBackups: number;
  failedBackups: number;
  latestBackup: BackupLog | null;
  nextScheduled: string;
  oldBerkasEligibleForDeletion: number;
  retentionPolicy: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BackupPage() {
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<BackupLog | null>(null);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await apiClient.get<any>('/backup/stats');
      setStats(res.data?.data ?? res.data);
    } catch {
      // stats gagal fetch tidak perlu alert, handled oleh loading state
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchBackups = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>(`/backup?page=${p}&limit=15`);
      const payload = res.data?.data ?? res.data;
      setBackups(payload?.data ?? []);
      setPagination(payload?.pagination ?? null);
    } catch {
      showAlert('error', 'Gagal memuat daftar backup');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBackups(page);
  }, [fetchStats, fetchBackups, page]);

  // ────────────────────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────────────────────

  const handleManualBackup = async () => {
    setActionLoading('backup');
    try {
      const res = await apiClient.post<any>('/backup', {});
      const d = res.data?.data ?? res.data;
      showAlert(
        'success',
        `Backup berhasil: ${d?.filename ?? ''} (${d?.fileSizeKB ?? '?'} KB, ${d?.totalBerkas ?? '?'} berkas)`
      );
      await Promise.all([fetchStats(), fetchBackups(1)]);
      setPage(1);
    } catch (e: any) {
      showAlert('error', e?.response?.data?.message ?? 'Backup manual gagal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCleanup = async () => {
    setShowCleanupConfirm(false);
    setActionLoading('cleanup');
    try {
      const res = await apiClient.post<any>('/backup/cleanup', {});
      const d = res.data?.data ?? res.data;
      showAlert(
        'success',
        `Cleanup selesai — ${d?.deletedBerkas ?? 0} berkas dihapus, ${d?.deletedBackups ?? 0} backup dihapus`
      );
      await Promise.all([fetchStats(), fetchBackups(1)]);
      setPage(1);
    } catch (e: any) {
      showAlert('error', e?.response?.data?.message ?? 'Cleanup gagal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = async (backup: BackupLog) => {
    try {
      const response = await apiClient.get(`/backup/${backup.id}/download`, {
        responseType: 'blob',
      } as any);
      const url = URL.createObjectURL(new Blob([response.data as any]));
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showAlert('error', 'Gagal mengunduh file backup');
    }
  };

  const handleDelete = async (backup: BackupLog) => {
    setShowDeleteConfirm(null);
    setActionLoading(backup.id);
    try {
      await apiClient.delete(`/backup/${backup.id}`);
      showAlert('success', `Backup "${backup.filename}" berhasil dihapus`);
      await Promise.all([fetchStats(), fetchBackups(page)]);
    } catch {
      showAlert('error', 'Gagal menghapus backup');
    } finally {
      setActionLoading(null);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const isOldBackup = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs > 2 * 365 * 24 * 60 * 60 * 1000;
  };

  // ────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup Data</h1>
          <p className="text-gray-600 mt-1">Backup otomatis setiap bulan • Retensi data 2 tahun</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCleanupConfirm(true)}
            disabled={!!actionLoading}
            isLoading={actionLoading === 'cleanup'}
          >
            🗑️ Jalankan Cleanup
          </Button>
          <Button
            variant="primary"
            onClick={handleManualBackup}
            disabled={!!actionLoading}
            isLoading={actionLoading === 'backup'}
          >
            💾 Backup Manual
          </Button>
        </div>
      </div>

      {/* Alert */}
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Backup',
            value: statsLoading ? '...' : String(stats?.totalBackups ?? 0),
            icon: '🗄️',
            color: 'text-blue-600',
          },
          {
            label: 'Berhasil',
            value: statsLoading ? '...' : String(stats?.successBackups ?? 0),
            icon: '✅',
            color: 'text-green-600',
          },
          {
            label: 'Gagal',
            value: statsLoading ? '...' : String(stats?.failedBackups ?? 0),
            icon: '❌',
            color: 'text-red-600',
          },
          {
            label: 'Berkas Eligible Cleanup',
            value: statsLoading ? '...' : String(stats?.oldBerkasEligibleForDeletion ?? 0),
            icon: '📋',
            color: 'text-amber-600',
          },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Kebijakan */}
      <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 text-sm text-blue-800 space-y-1">
        <p className="font-semibold text-blue-900">ℹ️ Kebijakan Retensi Data</p>
        <p>
          • <span className="font-medium">Berkas dihapus otomatis</span> jika sudah lebih dari 2
          tahun sejak <span className="font-medium">tanggal berkas ditambahkan</span> ke sistem
          (kolom <code className="bg-blue-100 px-1 rounded">createdAt</code>), dan statusnya{' '}
          <span className="font-medium">SELESAI atau DITUTUP</span>. Berkas yang masih dalam proses
          tidak akan dihapus.
        </p>
        <p>
          • <span className="font-medium">File backup dihapus otomatis</span> jika sudah lebih dari
          2 tahun sejak tanggal backup dibuat.
        </p>
        <p>
          • <span className="font-medium">Jadwal otomatis:</span>{' '}
          {stats?.nextScheduled ?? 'Tanggal 1 setiap bulan, pukul 02:00'}
        </p>
      </div>

      {/* Backup terbaru */}
      {stats?.latestBackup && (
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
          <p className="font-semibold text-gray-900 mb-2">📦 Backup Terakhir</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>📄 {stats.latestBackup.filename}</span>
            <span>📅 {formatDate(stats.latestBackup.createdAt)}</span>
            <span>📋 {stats.latestBackup.totalBerkas} berkas</span>
          </div>
        </div>
      )}

      {/* Tabel Daftar Backup */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Backup</h2>
          <p className="text-sm text-gray-600">Daftar semua backup yang telah dibuat</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-2">⌛</div>
              <p>Memuat data...</p>
            </div>
          </div>
        ) : backups.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">🗄️</div>
              <p className="font-medium">Belum ada data backup.</p>
              <p className="text-sm mt-1">
                Klik &ldquo;Backup Manual&rdquo; untuk membuat backup sekarang.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 font-semibold">Nama File</th>
                    <th className="px-6 py-3 font-semibold">Tanggal Backup</th>
                    <th className="px-6 py-3 font-semibold">Jumlah Berkas</th>
                    <th className="px-6 py-3 font-semibold">Ukuran</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backups.map((backup) => {
                    const old = isOldBackup(backup.createdAt);
                    return (
                      <tr
                        key={backup.id}
                        className={`hover:bg-gray-50 transition-colors ${old ? 'opacity-60' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">📄</span>
                            <div>
                              <p className="font-medium text-gray-900 break-all">
                                {backup.filename}
                              </p>
                              {old && (
                                <p className="text-xs text-red-500">
                                  ⚠️ Akan dihapus saat cleanup ({'>'} 2 tahun)
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {formatDate(backup.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{backup.totalBerkas}</td>
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {parseFloat(backup.fileSizeMB) >= 1
                            ? `${backup.fileSizeMB} MB`
                            : `${backup.fileSizeKB} KB`}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              backup.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {backup.status === 'SUCCESS' ? '✅ Berhasil' : '❌ Gagal'}
                          </span>
                          {backup.status === 'FAILED' && backup.errorMessage && (
                            <p className="text-xs text-red-500 mt-1 max-w-xs truncate">
                              {backup.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {backup.status === 'SUCCESS' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(backup)}
                              >
                                ⬇️ Unduh
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(backup)}
                              disabled={actionLoading === backup.id}
                              isLoading={actionLoading === backup.id}
                            >
                              🗑️ Hapus
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1}–
                  {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
                  {pagination.total} backup
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Sebelumnya
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-600 self-center">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Berikutnya →
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Backup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 z-10">
            <h3 className="text-lg font-bold text-gray-900">Hapus Backup?</h3>
            <p className="text-sm text-gray-600">
              File <span className="font-medium">{showDeleteConfirm.filename}</span> akan dihapus
              secara permanen dari server dan tidak dapat dipulihkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(null)}>
                Batal
              </Button>
              <Button variant="danger" onClick={() => handleDelete(showDeleteConfirm)}>
                Ya, Hapus
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Cleanup */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCleanupConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 z-10">
            <h3 className="text-lg font-bold text-gray-900">Jalankan Cleanup?</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>Proses ini akan:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>
                  Menghapus berkas yang dibuat{' '}
                  <span className="font-medium">lebih dari 2 tahun lalu</span> dengan status{' '}
                  <span className="font-medium">SELESAI atau DITUTUP</span>
                </li>
                <li>
                  Menghapus file backup yang dibuat{' '}
                  <span className="font-medium">lebih dari 2 tahun lalu</span>
                </li>
              </ul>
              {(stats?.oldBerkasEligibleForDeletion ?? 0) > 0 && (
                <p className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                  ⚠️ Saat ini terdapat{' '}
                  <span className="font-bold">{stats?.oldBerkasEligibleForDeletion}</span> berkas
                  yang akan dihapus.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCleanupConfirm(false)}>
                Batal
              </Button>
              <Button variant="danger" onClick={handleCleanup}>
                Ya, Jalankan Cleanup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
