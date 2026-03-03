'use client';

import React, { useState } from 'react';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { BerkasFilterValues } from '@/components/filters/BerkasFilter';

interface ImportExportResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

interface BerkasImportExportProps {
  selectedIds?: string[];
  currentFilters?: BerkasFilterValues;
  onImportSuccess?: () => void;
  onExportSuccess?: () => void;
}

export default function BerkasImportExport({
  selectedIds = [],
  currentFilters = {},
  onImportSuccess,
  onExportSuccess,
}: BerkasImportExportProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
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

      const response = await apiClient.get(`/berkas/import-export/export${query}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data as any], {
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
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ImportExportResponse>(
        '/berkas/import-export/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data?.success) {
        setSuccess(
          response.data?.message || 'Import berhasil. Data berkas telah ditambahkan ke sistem.'
        );
        onImportSuccess?.();

        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Import gagal';
      setError(errorMsg);
    } finally {
      setImporting(false);
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
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {exporting ? '⏳ Mengunduh...' : '📥 Unduh Excel'}
          </Button>
          {hasActiveFilters && (
            <span
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-400 rounded-full border-2 border-white"
              title="Filter aktif — hanya data yang difilter yang akan diunduh"
            />
          )}
        </div>

        {/* Import Button */}
        <div className="relative">
          <input
            id="file-import"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
          />
          <label htmlFor="file-import">
            <Button
              disabled={importing}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('file-import')?.click();
              }}
            >
              {importing ? '⏳ Mengupload...' : '📤 Unggah Excel'}
            </Button>
          </label>
        </div>
      </div>
    </>
  );
}
