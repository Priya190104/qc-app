'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Alert, PageHeader } from '@/components/ui';
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

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Health = 'good' | 'warning' | 'stale' | 'failed' | 'none' | null;

function HealthDot({ health }: { health: Health }) {
  if (health === null)
    return <span className="w-3 h-3 rounded-full bg-gray-200 animate-pulse shrink-0" />;
  const colorMap: Record<string, string> = {
    good: 'bg-emerald-500',
    warning: 'bg-amber-500',
    stale: 'bg-orange-500',
    failed: 'bg-red-500',
    none: 'bg-gray-300',
  };
  return (
    <span className="relative flex w-3 h-3 shrink-0">
      {health === 'good' && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
      )}
      <span className={`relative inline-flex rounded-full w-3 h-3 ${colorMap[health]}`} />
    </span>
  );
}

function MetricItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: string;
}) {
  return (
    <div className="px-5 text-center first:pl-0 last:pr-0">
      {value === null ? (
        <div className="h-5 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
      ) : (
        <p className={`text-lg font-semibold leading-none ${color}`}>{value}</p>
      )}
      <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
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

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Actions
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        `Cleanup selesai â€” ${d?.deletedBerkas ?? 0} berkas dihapus, ${d?.deletedBackups ?? 0} backup dihapus`
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

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Helpers
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const isOldBackup = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs > 2 * 365 * 24 * 60 * 60 * 1000;
  };

  // Compute system health from latest backup
  const systemHealth: Health = (() => {
    if (statsLoading) return null;
    if (!stats?.latestBackup) return 'none';
    if (stats.latestBackup.status === 'FAILED') return 'failed';
    const diffDays = (Date.now() - new Date(stats.latestBackup.createdAt).getTime()) / 86400000;
    if (diffDays <= 35) return 'good';
    if (diffDays <= 90) return 'warning';
    return 'stale';
  })();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Backup Data"
        description="Backup otomatis setiap bulan Â· Retensi data 2 tahun"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCleanupConfirm(true)}
              disabled={!!actionLoading}
              isLoading={actionLoading === 'cleanup'}
            >
              Jalankan Cleanup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualBackup}
              disabled={!!actionLoading}
              isLoading={actionLoading === 'backup'}
            >
              {actionLoading === 'backup' ? 'Memproses Backupâ€¦' : 'Backup Manual'}
            </Button>
          </>
        }
      />

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* â”€â”€ System Status Bar â”€â”€ */}
      <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-5">
          {/* Health indicator */}
          <div className="flex items-center gap-3">
            <HealthDot health={systemHealth} />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {systemHealth === null && 'Memuat status sistemâ€¦'}
                {systemHealth === 'good' && 'Sistem Terlindungi'}
                {systemHealth === 'warning' && 'Backup Sudah Lama'}
                {systemHealth === 'stale' && 'Backup Sangat Lama'}
                {systemHealth === 'failed' && 'Backup Terakhir Gagal'}
                {systemHealth === 'none' && 'Belum Ada Backup'}
              </p>
              <p className="text-xs text-gray-500">
                {stats?.latestBackup
                  ? `Backup terakhir: ${formatDate(stats.latestBackup.createdAt)}`
                  : 'Buat backup pertama untuk memulai perlindungan data'}
              </p>
            </div>
          </div>

          {/* Metric strip */}
          <div className="flex items-center divide-x divide-gray-200">
            <MetricItem
              label="Total Backup"
              value={statsLoading ? null : (stats?.totalBackups ?? 0)}
              color="text-gray-900"
            />
            <MetricItem
              label="Berhasil"
              value={statsLoading ? null : (stats?.successBackups ?? 0)}
              color="text-emerald-700"
            />
            <MetricItem
              label="Gagal"
              value={statsLoading ? null : (stats?.failedBackups ?? 0)}
              color={(stats?.failedBackups ?? 0) > 0 ? 'text-red-600' : 'text-gray-400'}
            />
            <MetricItem
              label="Eligible Cleanup"
              value={statsLoading ? null : (stats?.oldBerkasEligibleForDeletion ?? 0)}
              color={
                (stats?.oldBerkasEligibleForDeletion ?? 0) > 0 ? 'text-amber-600' : 'text-gray-400'
              }
            />
          </div>
        </div>
      </div>

      {/* â”€â”€ Latest Backup + Retention Policy â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Latest backup card â€” 2/3 width */}
        <div className="lg:col-span-2">
          {statsLoading ? (
            <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ) : stats?.latestBackup ? (
            <div
              className={`bg-white border rounded-lg p-5 ${
                stats.latestBackup.status === 'SUCCESS' ? 'border-emerald-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        stats.latestBackup.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Backup Terakhir
                    </p>
                  </div>
                  <p className="font-mono text-sm font-medium text-gray-900 truncate">
                    {stats.latestBackup.filename}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>{formatDate(stats.latestBackup.createdAt)}</span>
                    <span>{stats.latestBackup.totalBerkas.toLocaleString('id-ID')} berkas</span>
                    <span>
                      {parseFloat(stats.latestBackup.fileSizeMB) >= 1
                        ? `${stats.latestBackup.fileSizeMB} MB`
                        : `${stats.latestBackup.fileSizeKB} KB`}
                    </span>
                  </div>
                </div>
                {stats.latestBackup.status === 'SUCCESS' && (
                  <button
                    onClick={() => handleDownload(stats.latestBackup!)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Unduh untuk Restore
                  </button>
                )}
              </div>
              {stats.latestBackup.status === 'SUCCESS' && (
                <p className="mt-3 text-xs text-gray-400 border-t border-gray-100 pt-3">
                  Untuk memulihkan data, unduh file backup dan ikuti prosedur restore sistem sesuai
                  panduan teknis.
                </p>
              )}
              {stats.latestBackup.status === 'FAILED' && stats.latestBackup.errorMessage && (
                <p className="mt-3 text-xs text-red-600 border-t border-red-100 pt-3 truncate">
                  {stats.latestBackup.errorMessage}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-gray-200 rounded-lg p-5 text-center">
              <p className="text-sm font-medium text-gray-500">Belum ada backup</p>
              <p className="text-xs text-gray-400 mt-1">
                Klik &ldquo;Backup Manual&rdquo; untuk membuat backup pertama
              </p>
            </div>
          )}
        </div>

        {/* Retention policy â€” 1/3 width */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm">
          <p className="font-semibold text-gray-800 mb-3 text-sm">Kebijakan Retensi Data</p>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="flex gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <span>
                <span className="font-medium text-gray-700">Berkas</span> dihapus otomatis jika
                lebih dari 2 tahun dan berstatus <span className="font-medium">SELESAI</span> atau{' '}
                <span className="font-medium">DITUTUP</span>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <span>
                <span className="font-medium text-gray-700">File backup</span> dihapus otomatis
                setelah lebih dari 2 tahun
              </span>
            </li>
            <li className="flex gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0 mt-1.5" />
              <span>
                <span className="font-medium text-gray-700">Jadwal otomatis:</span>{' '}
                {stats?.nextScheduled ?? 'Tanggal 1 setiap bulan, pukul 02:00'}
              </span>
            </li>
          </ul>
          {(stats?.oldBerkasEligibleForDeletion ?? 0) > 0 && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
              <span className="font-semibold">{stats!.oldBerkasEligibleForDeletion} berkas</span>{' '}
              siap dihapus saat cleanup dijalankan
            </div>
          )}
        </div>
      </div>

      {/* â”€â”€ Backup History Table â”€â”€ */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Riwayat Backup</h2>
            {!loading && pagination && (
              <p className="text-xs text-gray-400 mt-0.5">{pagination.total} backup tersimpan</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-4 animate-pulse">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-64" />
                  <div className="h-3 bg-gray-200 rounded w-36" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-16" />
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className="py-14 text-center">
            <svg
              className="mx-auto w-9 h-9 text-gray-300 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">Belum ada data backup</p>
            <p className="text-xs text-gray-400 mt-1">
              Klik &ldquo;Backup Manual&rdquo; untuk membuat backup sekarang
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th
                      scope="col"
                      className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      Nama File
                    </th>
                    <th
                      scope="col"
                      className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      Tanggal
                    </th>
                    <th
                      scope="col"
                      className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      Berkas
                    </th>
                    <th
                      scope="col"
                      className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      Ukuran
                    </th>
                    <th
                      scope="col"
                      className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right"
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {backups.map((backup) => {
                    const old = isOldBackup(backup.createdAt);
                    return (
                      <tr
                        key={backup.id}
                        className={`transition-colors hover:bg-gray-50/70 ${
                          old ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <td className="px-5 py-3">
                          <div className="min-w-0">
                            <p className="font-mono text-xs font-medium text-gray-900 truncate max-w-xs">
                              {backup.filename}
                            </p>
                            {old && (
                              <p className="text-xs text-amber-600 mt-0.5">
                                Akan dihapus saat cleanup (lebih dari 2 tahun)
                              </p>
                            )}
                            {backup.status === 'FAILED' && backup.errorMessage && (
                              <p className="text-xs text-red-500 mt-0.5 max-w-xs truncate">
                                {backup.errorMessage}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap">
                          {formatDate(backup.createdAt)}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600 tabular-nums">
                          {backup.totalBerkas.toLocaleString('id-ID')}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600 whitespace-nowrap tabular-nums">
                          {parseFloat(backup.fileSizeMB) >= 1
                            ? `${backup.fileSizeMB} MB`
                            : `${backup.fileSizeKB} KB`}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                              backup.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                backup.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                            />
                            {backup.status === 'SUCCESS' ? 'Berhasil' : 'Gagal'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end items-center gap-1">
                            {backup.status === 'SUCCESS' && (
                              <button
                                onClick={() => handleDownload(backup)}
                                className="px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                              >
                                Unduh
                              </button>
                            )}
                            {backup.status === 'SUCCESS' && (
                              <span className="w-px h-3.5 bg-gray-200" aria-hidden="true" />
                            )}
                            <button
                              onClick={() => setShowDeleteConfirm(backup)}
                              disabled={actionLoading === backup.id}
                              className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-40"
                            >
                              {actionLoading === backup.id ? 'Menghapusâ€¦' : 'Hapus'}
                            </button>
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
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-xs text-gray-400">
                  {(pagination.page - 1) * pagination.limit + 1}â€“
                  {Math.min(pagination.page * pagination.limit, pagination.total)} dari{' '}
                  {pagination.total} backup
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-2.5 py-1 text-xs text-gray-500 tabular-nums">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* â”€â”€ Modal: Hapus Backup â”€â”€ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 z-10">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Hapus Backup?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  File <span className="font-mono font-medium">{showDeleteConfirm.filename}</span>{' '}
                  akan dihapus permanen dari server dan tidak dapat dipulihkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(null)}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(showDeleteConfirm)}>
                Hapus Permanen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€ Modal: Jalankan Cleanup â”€â”€ */}
      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCleanupConfirm(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 z-10">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900">Jalankan Cleanup?</h3>
                <div className="text-sm text-gray-600 mt-1 space-y-2">
                  <p>Proses ini akan menghapus secara permanen:</p>
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-1.5" />
                      <span>
                        Berkas lebih dari 2 tahun berstatus <strong>SELESAI</strong> atau{' '}
                        <strong>DITUTUP</strong>
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-1.5" />
                      <span>File backup lebih dari 2 tahun</span>
                    </li>
                  </ul>
                  {(stats?.oldBerkasEligibleForDeletion ?? 0) > 0 && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                      <strong>{stats!.oldBerkasEligibleForDeletion} berkas</strong> akan dihapus
                      dalam proses ini
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="secondary" size="sm" onClick={() => setShowCleanupConfirm(false)}>
                Batal
              </Button>
              <Button variant="danger" size="sm" onClick={handleCleanup}>
                Ya, Jalankan Cleanup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
