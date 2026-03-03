'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores';

interface Catatan {
  id: string;
  teks: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

interface BerkasCatatanTabProps {
  berkasId: string;
  initialDeskripsi?: string;
}

export default function BerkasCatatanTab({ berkasId, initialDeskripsi }: BerkasCatatanTabProps) {
  const currentUser = useAuthStore((s) => s.user);
  const [catatanList, setCatatanList] = useState<Catatan[]>([]);
  const [teks, setTeks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialDeskripsi) {
      setCatatanList([]);
      return;
    }
    try {
      const parsed = JSON.parse(initialDeskripsi);
      if (Array.isArray(parsed)) {
        setCatatanList(parsed);
      } else {
        setCatatanList([]);
      }
    } catch {
      setCatatanList([]);
    }
  }, [initialDeskripsi]);

  const saveToDatabase = async (list: Catatan[]) => {
    setSaving(true);
    setSaveError(null);
    try {
      await apiClient.patch(`/berkas/${berkasId}`, {
        deskripsi: JSON.stringify(list),
      });
    } catch (err: any) {
      setSaveError(err.response?.data?.message || 'Gagal menyimpan catatan');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleTambah = async () => {
    if (!teks.trim() || submitting) return;
    setSubmitting(true);
    const newCatatan: Catatan = {
      id: Date.now().toString(),
      teks: teks.trim(),
      createdAt: new Date().toISOString(),
      authorId: currentUser?.id ?? '',
      authorName: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
        : 'Tidak diketahui',
    };
    const updated = [newCatatan, ...catatanList];
    try {
      await saveToDatabase(updated);
      setCatatanList(updated);
      setTeks('');
    } catch {
      // saveError already set
    } finally {
      setSubmitting(false);
    }
  };

  const handleHapus = async (id: string) => {
    const updated = catatanList.filter((c) => c.id !== id);
    try {
      await saveToDatabase(updated);
      setCatatanList(updated);
      setDeleteId(null);
    } catch {
      // saveError already set
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Error simpan */}
      {saveError && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {saveError}
        </div>
      )}

      {/* Status menyimpan */}
      {saving && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-600">
          <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Menyimpan ke database...
        </div>
      )}

      {/* Form Tambah Catatan */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Tambah Catatan Baru
        </h3>
        <textarea
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Tulis catatan untuk berkas ini..."
          rows={3}
          className="w-full px-4 py-3 text-sm border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none bg-white placeholder-gray-400 text-gray-800"
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleTambah}
            disabled={!teks.trim() || submitting || saving}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {submitting ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </div>
      </div>

      {/* Daftar Catatan */}
      {catatanList.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-7 h-7 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm font-medium">Belum ada catatan</p>
          <p className="text-gray-400 text-xs mt-1">Tambahkan catatan pertama untuk berkas ini</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 font-medium">{catatanList.length} catatan</p>
          {catatanList.map((catatan) => {
            const isOwner = currentUser?.id === catatan.authorId;
            const initials = catatan.authorName
              ? catatan.authorName
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
              : '?';
            return (
              <div
                key={catatan.id}
                className="group relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Author */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold leading-none">
                          {initials}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        {catatan.authorName || 'Tidak diketahui'}
                      </span>
                      {isOwner && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                          Anda
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {catatan.teks}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <svg
                        className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs text-gray-400">{formatDate(catatan.createdAt)}</span>
                    </div>
                  </div>

                  {/* Hapus button — hanya tampil untuk pemilik catatan */}
                  {isOwner && (
                    <>
                      {deleteId === catatan.id ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-xs text-red-600 font-medium">Hapus?</span>
                          <button
                            onClick={() => handleHapus(catatan.id)}
                            disabled={saving}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Ya
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            disabled={saving}
                            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(catatan.id)}
                          disabled={saving}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 disabled:cursor-not-allowed"
                          title="Hapus catatan"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
