'use client';

import React, { useState, useRef } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';

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

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder:text-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150';

const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5';

const BerkasFilter: React.FC<BerkasFilterProps> = ({ onFilterChange, onReset }) => {
  const [search, setSearch] = useState('');
  const [desa, setDesa] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [tahunBerkas, setTahunBerkas] = useState('');
  const [tanggalDari, setTanggalDari] = useState('');
  const [tanggalSampai, setTanggalSampai] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Count how many non-search filters are active
  const activeFilterCount = [desa, kecamatan, tahunBerkas, tanggalDari, tanggalSampai].filter(
    Boolean
  ).length;

  const buildFilters = (
    overrides: Partial<{
      search: string;
      desa: string;
      kecamatan: string;
      tahunBerkas: string;
      tanggalDari: string;
      tanggalSampai: string;
    }> = {}
  ): BerkasFilterValues => {
    const s = overrides.search ?? search;
    const d = overrides.desa ?? desa;
    const k = overrides.kecamatan ?? kecamatan;
    const t = overrides.tahunBerkas ?? tahunBerkas;
    const td = overrides.tanggalDari ?? tanggalDari;
    const ts = overrides.tanggalSampai ?? tanggalSampai;
    return {
      search: s.trim() || undefined,
      desa: d.trim() || undefined,
      kecamatan: k.trim() || undefined,
      tahunBerkas: t ? parseInt(t) : null,
      tanggalDari: td || undefined,
      tanggalSampai: ts || undefined,
    };
  };

  const handleApplyFilter = () => {
    onFilterChange(buildFilters());
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
    searchRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleApplyFilter();
    if (e.key === 'Escape') {
      setSearch('');
      onFilterChange(buildFilters({ search: '' }));
    }
  };

  const handleFieldKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApplyFilter();
  };

  const clearSearch = () => {
    setSearch('');
    onFilterChange(buildFilters({ search: '' }));
    searchRef.current?.focus();
  };

  const hasAnyFilter = !!(
    search ||
    desa ||
    kecamatan ||
    tahunBerkas ||
    tanggalDari ||
    tanggalSampai
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Primary search row ────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-100">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Cari No. Berkas atau nama pemohon…"
            aria-label="Cari berkas"
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 whitespace-nowrap ${
            showAdvanced || activeFilterCount > 0
              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          aria-expanded={showAdvanced}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-blue-700 text-[10px] font-bold leading-none">
              {activeFilterCount}
            </span>
          )}
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Search button */}
        <button
          type="button"
          onClick={handleApplyFilter}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150 whitespace-nowrap"
        >
          Cari
        </button>
      </div>

      {/* ── Advanced filters panel ────────────────────────────────── */}
      {showAdvanced && (
        <div className="p-3 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label htmlFor="bf-desa" className={labelClass}>
                Desa
              </label>
              <input
                type="text"
                id="bf-desa"
                value={desa}
                onChange={(e) => setDesa(e.target.value)}
                onKeyDown={handleFieldKeyDown}
                placeholder="Nama desa…"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="bf-kecamatan" className={labelClass}>
                Kecamatan
              </label>
              <input
                type="text"
                id="bf-kecamatan"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                onKeyDown={handleFieldKeyDown}
                placeholder="Nama kecamatan…"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="bf-tahun" className={labelClass}>
                Tahun Berkas
              </label>
              <input
                type="number"
                id="bf-tahun"
                value={tahunBerkas}
                onChange={(e) => setTahunBerkas(e.target.value)}
                onKeyDown={handleFieldKeyDown}
                placeholder="Contoh: 2026"
                min="2000"
                max="2100"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="bf-dari" className={labelClass}>
                Tanggal Masuk — Dari
              </label>
              <input
                type="date"
                id="bf-dari"
                value={tanggalDari}
                onChange={(e) => setTanggalDari(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="bf-sampai" className={labelClass}>
                Tanggal Masuk — Sampai
              </label>
              <input
                type="date"
                id="bf-sampai"
                value={tanggalSampai}
                onChange={(e) => setTanggalSampai(e.target.value)}
                min={tanggalDari || undefined}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Filter footer ─────────────────────────────────────────── */}
      {showAdvanced && (
        <div className="flex items-center justify-between px-3 py-2 bg-white">
          {hasAnyFilter ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset semua filter
            </button>
          ) : (
            <span className="text-xs text-gray-400">Belum ada filter aktif</span>
          )}
          <button
            type="button"
            onClick={handleApplyFilter}
            className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-150"
          >
            Terapkan Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default BerkasFilter;
