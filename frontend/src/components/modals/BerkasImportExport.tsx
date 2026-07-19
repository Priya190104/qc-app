'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { BerkasFilterValues } from '@/components/filters/BerkasFilter';

interface BerkasImportExportProps {
  selectedIds?: string[];
  currentFilters?: BerkasFilterValues;
  onExportSuccess?: () => void;
}

export default function BerkasImportExport({
  selectedIds = [],
  currentFilters = {},
  onExportSuccess,
}: BerkasImportExportProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.desa ||
    currentFilters.kecamatan ||
    currentFilters.tahunBerkas ||
    currentFilters.tanggalDari ||
    currentFilters.tanggalSampai;

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      setSuccess(null);

      const params = new URLSearchParams();
      if (selectedIds.length > 0) params.append('ids', selectedIds.join(','));
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.desa) params.append('desa', currentFilters.desa);
      if (currentFilters.kecamatan) params.append('kecamatan', currentFilters.kecamatan);
      if (currentFilters.tahunBerkas)
        params.append('tahunBerkas', currentFilters.tahunBerkas.toString());
      if (currentFilters.tanggalDari) params.append('tanggalDari', currentFilters.tanggalDari);
      if (currentFilters.tanggalSampai)
        params.append('tanggalSampai', currentFilters.tanggalSampai);
      const query = params.toString() ? `?${params.toString()}` : '';

      // Use 'arraybuffer' — more reliable than 'blob' for binary data across
      // browsers and preserved correctly when the interceptor retries on 401.
      const response = await apiClient.get(`/berkas/import-export/export${query}`, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data as ArrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateSuffix =
        currentFilters.tanggalDari && currentFilters.tanggalSampai
          ? `_${currentFilters.tanggalDari}_sd_${currentFilters.tanggalSampai}`
          : currentFilters.tanggalDari
            ? `_dari_${currentFilters.tanggalDari}`
            : currentFilters.tanggalSampai
              ? `_sd_${currentFilters.tanggalSampai}`
              : '';
      a.download = `Data_Berkas${dateSuffix}_${new Date().getTime()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      // Delay cleanup so the browser has time to start reading the blob
      // before the URL is revoked — prevents intermittent corrupt downloads.
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 200);

      setSuccess(
        hasActiveFilters ? 'Berkas sesuai filter berhasil diunduh' : 'Semua berkas berhasil diunduh'
      );
      onExportSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Export gagal');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {error && <Alert type="error" title="Error" message={error} />}
      {success && <Alert type="success" title="Success" message={success} />}

      <div className="flex gap-2">
        {/* Export Button */}
        <div className="relative">
          <Button
            onClick={handleExport}
            disabled={exporting}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap gap-1.5"
          >
            {exporting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Download size={15} strokeWidth={2.2} />
            )}
            {exporting ? 'Mengunduh...' : 'Unduh Excel'}
          </Button>
          {hasActiveFilters && (
            <span
              className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-white"
              title="Filter aktif — hanya data yang difilter yang akan diunduh"
            />
          )}
        </div>
      </div>
    </>
  );
}
