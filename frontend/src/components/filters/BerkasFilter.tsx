'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';

interface BerkasFilterProps {
  onFilterChange: (filters: BerkasFilterValues) => void;
  onReset?: () => void;
}

export interface BerkasFilterValues {
  search?: string;
  desa?: string;
  kecamatan?: string;
  tahunBerkas?: number | null;
  tanggalDari?: string;
  tanggalSampai?: string;
}

const BerkasFilter: React.FC<BerkasFilterProps> = ({ onFilterChange, onReset }) => {
  const [search, setSearch] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [tahunBerkas, setTahunBerkas] = useState('');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');

  const handleApplyFilter = () => {
    const filters: BerkasFilterValues = {
      search: search.trim() || undefined,
      desa: desa.trim() || undefined,
      kecamatan: kecamatan.trim() || undefined,
      tahunBerkas: tahunBerkas ? parseInt(tahunBerkas) : null,
      tanggalDari: tanggalDari || undefined,
      tanggalSampai: tanggalSampai || undefined,
    };
    onFilterChange(filters);
  };

  const handleReset = () => {
    setSearch('');
    setDesa('');
    setKecamatan('');
    setTahunBerkas('');
    setTanggalDari('');
    setTanggalSampai('');
    onFilterChange({});
    if (onReset) onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyFilter();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900">🔍 Filter Berkas</h3>
        <Button onClick={handleReset} variant="outline" className="text-xs px-3 py-1.5">
          Reset Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Row 1: Search & Desa */}
        <div>
          <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1.5">
            No. Berkas / Nama Pemohon
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Cari berkas atau nama..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="desa" className="block text-xs font-medium text-gray-700 mb-1.5">
            Desa
          </label>
          <input
            type="text"
            id="desa"
            value={desa}
            onChange={(e) => setDesa(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nama desa..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Row 2: Kecamatan & Tahun */}
        <div>
          <label htmlFor="kecamatan" className="block text-xs font-medium text-gray-700 mb-1.5">
            Kecamatan
          </label>
          <input
            type="text"
            id="kecamatan"
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nama kecamatan..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="tahunBerkas" className="block text-xs font-medium text-gray-700 mb-1.5">
            Tahun Berkas
          </label>
          <input
            type="number"
            id="tahunBerkas"
            value={tahunBerkas}
            onChange={(e) => setTahunBerkas(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tahun (contoh: 2026)"
            min="2000"
            max="2100"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Row 3: Tanggal Masuk Range */}
        <div>
          <label htmlFor="tanggalDari" className="block text-xs font-medium text-gray-700 mb-1.5">
            Tanggal Masuk (Dari)
          </label>
          <input
            type="date"
            id="tanggalDari"
            value={tanggalDari}
            onChange={(e) => setTanggalDari(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="tanggalSampai" className="block text-xs font-medium text-gray-700 mb-1.5">
            Tanggal Masuk (Sampai)
          </label>
          <input
            type="date"
            id="tanggalSampai"
            value={tanggalSampai}
            onChange={(e) => setTanggalSampai(e.target.value)}
            min={tanggalDari || undefined}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="mt-3 flex justify-end">
        <Button
          onClick={handleApplyFilter}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-sm"
        >
          Terapkan Filter
        </Button>
      </div>
    </div>
  );
};

export default BerkasFilter;
