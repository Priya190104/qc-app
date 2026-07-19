'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Pencil, Trash2, ChevronDown, ChevronUp, Users, X } from 'lucide-react';
import { Button, Alert, PageHeader } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { useCacheInvalidation } from '@/hooks/useQueryHooks';
import { Petugas } from '@/types';
import PetugasModal from '@/components/modals/PetugasModal';
import DeletePetugasModal from '@/components/modals/DeletePetugasModal';

const ITEMS_PER_PAGE = 10;

const CATEGORIES = [
  { key: 'Operator Data Berkas', label: 'Operator Data Berkas' },
  { key: 'Operator Data Ukur', label: 'Operator Data Ukur' },
  { key: 'Operator Data Pemetaan', label: 'Operator Data Pemetaan' },
  { key: 'Operator Pemeriksaan', label: 'Operator Pemeriksaan' },
  { key: 'Petugas Ukur', label: 'Petugas Ukur' },
  { key: 'Petugas Pemetaan', label: 'Petugas Pemetaan' },
  { key: 'KKS', label: 'KKS' },
  { key: 'Kepala Seksi', label: 'Kepala Seksi' },
];

// ─── Avatar initials ────────────────────────────────────────────────────────
function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0 select-none">
      {initials}
    </span>
  );
}

// ─── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="px-5 py-3 w-10">
        <div className="h-3 w-5 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="h-3.5 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="h-3.5 w-32 bg-gray-200 rounded animate-pulse" />
      </td>
      <td className="px-5 py-3">
        <div className="flex justify-end gap-2">
          <div className="h-7 w-14 bg-gray-200 rounded-md animate-pulse" />
          <div className="h-7 w-14 bg-gray-200 rounded-md animate-pulse" />
        </div>
      </td>
    </tr>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
              <div>
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-1.5" />
              </div>
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <table className="w-full">
            <tbody>
              {[1, 2, 3].map((j) => (
                <SkeletonRow key={j} />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// ─── Category empty state ────────────────────────────────────────────────────
function CategoryEmpty({
  hasSearch,
  searchQuery,
  onAdd,
}: {
  hasSearch: boolean;
  searchQuery: string;
  onAdd: () => void;
}) {
  return (
    <div className="py-10 text-center">
      <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 mb-3">
        {hasSearch ? (
          <Search className="w-5 h-5 text-gray-400" />
        ) : (
          <Users className="w-5 h-5 text-gray-400" />
        )}
      </span>
      {hasSearch ? (
        <>
          <p className="text-sm font-medium text-gray-700">
            Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;
          </p>
          <p className="text-xs text-gray-500 mt-1">Coba kata kunci lain</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">Belum ada petugas</p>
          <p className="text-xs text-gray-500 mt-1">Tambahkan petugas pertama untuk bagian ini</p>
          <button
            onClick={onAdd}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <Plus className="w-4 h-4" />
            Tambah petugas
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function PetugasPage() {
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { invalidatePetugas } = useCacheInvalidation();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({});

  // Modal states
  const [showPetugasModal, setShowPetugasModal] = useState(false);
  const [editingPetugas, setEditingPetugas] = useState<Petugas | null>(null);
  const [selectedDepartemen, setSelectedDepartemen] = useState<string>('');
  const [deletePetugas, setDeletePetugas] = useState<{ id: string; nama: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch petugas - gunakan limit besar agar semua petugas tampil (tidak terpotong pagination)
      const petugasResponse = await apiClient.get<any>('/petugas?limit=1000');
      let petugasData: Petugas[] = [];
      if (petugasResponse.data?.data?.data) {
        petugasData = Array.isArray(petugasResponse.data.data.data)
          ? petugasResponse.data.data.data
          : [];
      } else if (petugasResponse.data?.data) {
        petugasData = Array.isArray(petugasResponse.data.data) ? petugasResponse.data.data : [];
      }
      setPetugasList(petugasData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPetugas = (departemen: string) => {
    setEditingPetugas(null);
    setSelectedDepartemen(departemen);
    setShowPetugasModal(true);
  };

  const handleEditPetugas = (petugas: Petugas) => {
    setEditingPetugas(petugas);
    setShowPetugasModal(true);
  };

  const handleDeletePetugas = (petugas: Petugas) => {
    setDeletePetugas({ id: petugas.id, nama: petugas.nama });
  };

  const handleModalSuccess = () => {
    fetchData();
    // Invalidate the React Query petugas cache so dropdowns in workflow pages
    // immediately receive the updated list without requiring a page refresh.
    invalidatePetugas();
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Group petugas by departemen
  const groupedPetugas = useMemo(
    () =>
      petugasList.reduce(
        (acc, p) => {
          const dept = p.departemen || 'Umum';
          if (!acc[dept]) acc[dept] = [];
          acc[dept].push(p);
          return acc;
        },
        {} as Record<string, Petugas[]>
      ),
    [petugasList]
  );

  const applySearch = (list: Petugas[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter((p) => p.nama.toLowerCase().includes(q) || p.nip.toLowerCase().includes(q));
  };

  const visibleCategories =
    activeFilter === 'all' ? CATEGORIES : CATEGORIES.filter((c) => c.key === activeFilter);

  const handleFilterChange = (key: string) => {
    setActiveFilter(key);
    setCategoryPages({});
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCategoryPages({});
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Daftar Petugas" description="Kelola daftar petugas di semua subbagian" />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Petugas"
        description="Kelola daftar petugas di semua subbagian"
        actions={
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="w-4 h-4" aria-hidden="true" />
            <strong className="text-gray-700 font-semibold">{petugasList.length}</strong> petugas
            terdaftar
          </span>
        }
      />

      {error && <Alert type="error" title="Error" message={error} />}

      {/* ── Toolbar: search + department filters ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Cari nama atau NIP petugas…"
            aria-label="Cari petugas"
            className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors duration-150"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department filter chips */}
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter subbagian">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua subbagian
          </button>
          {CATEGORIES.map((cat) => {
            const count = (groupedPetugas[cat.key] ?? []).length;
            const isActive = activeFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => handleFilterChange(cat.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {searchQuery && (
          <p className="text-xs text-gray-500" role="status" aria-live="polite">
            Menampilkan hasil pencarian untuk{' '}
            <strong className="text-gray-700">&ldquo;{searchQuery}&rdquo;</strong>
          </p>
        )}
      </div>

      {/* ── Category sections ── */}
      <div className="space-y-4">
        {visibleCategories.map((category) => {
          const allItems = groupedPetugas[category.key] ?? [];
          const filtered = applySearch(allItems);
          const isCollapsed = collapsedSections.has(category.key);
          const currentPage = categoryPages[category.key] ?? 1;
          const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
          const pageItems = filtered.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
          );
          const startRow = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
          const endRow = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

          return (
            <section
              key={category.key}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              aria-label={category.label}
            >
              {/* Section header */}
              <div className="px-5 py-4 flex items-center gap-3">
                {/* Collapse toggle */}
                <button
                  onClick={() => toggleSection(category.key)}
                  aria-expanded={!isCollapsed}
                  aria-controls={`section-${category.key}`}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50">
                    <Users className="w-4 h-4 text-blue-600" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm font-semibold text-gray-900 truncate">
                        {category.label}
                      </h2>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                          allItems.length > 0
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {searchQuery ? `${filtered.length} / ${allItems.length}` : allItems.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {allItems.length === 0
                        ? 'Belum ada petugas'
                        : `${allItems.length} petugas terdaftar`}
                    </p>
                  </div>
                  <span className="flex-shrink-0 text-gray-400 ml-auto mr-2" aria-hidden="true">
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </span>
                </button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPetugas(category.key)}
                  className="flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  Tambah
                </Button>
              </div>

              {/* Collapsible body */}
              {!isCollapsed && (
                <div id={`section-${category.key}`}>
                  {filtered.length === 0 ? (
                    <div className="border-t border-gray-100">
                      <CategoryEmpty
                        hasSearch={!!searchQuery}
                        searchQuery={searchQuery}
                        onAdd={() => handleAddPetugas(category.key)}
                      />
                    </div>
                  ) : (
                    <>
                      {/* Table */}
                      <div className="border-t border-gray-100 overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th
                                scope="col"
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-10"
                              >
                                #
                              </th>
                              <th
                                scope="col"
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                              >
                                Nama
                              </th>
                              <th
                                scope="col"
                                className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                              >
                                NIP
                              </th>
                              <th
                                scope="col"
                                className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide"
                              >
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {pageItems.map((petugas, idx) => {
                              const rowNumber = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                              return (
                                <tr
                                  key={petugas.id}
                                  className="hover:bg-gray-50/80 transition-colors duration-100"
                                >
                                  <td className="px-5 py-3 text-xs text-gray-400 font-mono tabular-nums">
                                    {rowNumber}
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                      <Avatar name={petugas.nama} />
                                      <span className="text-sm font-medium text-gray-900">
                                        {petugas.nama}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3">
                                    <span className="text-sm text-gray-600 font-mono tabular-nums">
                                      {petugas.nip}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => handleEditPetugas(petugas)}
                                        title={`Edit ${petugas.nama}`}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                      >
                                        <Pencil
                                          className="w-3.5 h-3.5 flex-shrink-0"
                                          aria-hidden="true"
                                        />
                                        <span className="hidden sm:inline">Edit</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeletePetugas(petugas)}
                                        title={`Hapus ${petugas.nama}`}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                                      >
                                        <Trash2
                                          className="w-3.5 h-3.5 flex-shrink-0"
                                          aria-hidden="true"
                                        />
                                        <span className="hidden sm:inline">Hapus</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Per-category pagination */}
                      {totalPages > 1 && (
                        <div className="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
                          <span>
                            Menampilkan{' '}
                            <span className="font-semibold text-gray-700 tabular-nums">
                              {startRow}–{endRow}
                            </span>{' '}
                            dari{' '}
                            <span className="font-semibold text-gray-700 tabular-nums">
                              {filtered.length}
                            </span>{' '}
                            petugas
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={currentPage === 1}
                              onClick={() =>
                                setCategoryPages((prev) => ({
                                  ...prev,
                                  [category.key]: currentPage - 1,
                                }))
                              }
                              className="px-2.5 py-1 rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              ← Sebelumnya
                            </button>
                            <span className="px-2 font-semibold text-gray-700 tabular-nums">
                              {currentPage} / {totalPages}
                            </span>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={() =>
                                setCategoryPages((prev) => ({
                                  ...prev,
                                  [category.key]: currentPage + 1,
                                }))
                              }
                              className="px-2.5 py-1 rounded-md font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            >
                              Berikutnya →
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* ── Modals ── */}
      <PetugasModal
        isOpen={showPetugasModal}
        onClose={() => setShowPetugasModal(false)}
        onSuccess={handleModalSuccess}
        editPetugas={editingPetugas}
        defaultDepartemen={selectedDepartemen}
      />

      {deletePetugas && (
        <DeletePetugasModal
          isOpen={!!deletePetugas}
          onClose={() => setDeletePetugas(null)}
          onSuccess={handleModalSuccess}
          petugasName={deletePetugas.nama}
          petugasId={deletePetugas.id}
        />
      )}
    </div>
  );
}
