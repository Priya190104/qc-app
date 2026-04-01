'use client';

import React, { useState, useEffect } from 'react';
import { Button, Alert } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { Petugas } from '@/types';
import PetugasModal from '@/components/modals/PetugasModal';
import DeletePetugasModal from '@/components/modals/DeletePetugasModal';

/**
 * Petugas (Staff) Management Page
 * Manages staff members organized by department
 */
export default function PetugasPage() {
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showPetugasModal, setShowPetugasModal] = useState(false);
  const [editingPetugas, setEditingPetugas] = useState<Petugas | null>(null);
  const [selectedDepartemen, setSelectedDepartemen] = useState<string>('');
  const [deletePetugas, setDeletePetugas] = useState<{ id: string; nama: string } | null>(null);

  // Fetch data
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
    setDeletePetugas({
      id: petugas.id,
      nama: petugas.nama,
    });
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  // Group petugas by departemen
  const groupedPetugas = petugasList.reduce(
    (acc, petugas) => {
      const dept = petugas.departemen || 'Umum';
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(petugas);
      return acc;
    },
    {} as Record<string, Petugas[]>
  );

  // Define departemen categories with order and display name
  const categories = [
    { key: 'Operator Data Berkas', label: 'Operator Data Berkas', icon: '📋' },
    { key: 'Operator Data Ukur', label: 'Operator Data Ukur', icon: '📏' },
    { key: 'Operator Data Pemetaan', label: 'Operator Data Pemetaan', icon: '🗺️' },
    { key: 'Operator Pemeriksaan', label: 'Operator Pemeriksaan', icon: '🔍' },
    { key: 'Petugas Ukur', label: 'Petugas Ukur', icon: '✓📏' },
    { key: 'Petugas Pemetaan', label: 'Petugas Pemetaan', icon: '✓🗺️' },
    { key: 'KKS', label: 'KKS', icon: '🎯' },
    { key: 'Kepala Seksi', label: 'Kepala Seksi', icon: '👔' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⌛</div>
          <p className="text-gray-600">Loading petugas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Petugas</h1>
          <p className="text-gray-600 mt-1">Kelola daftar petugas di semua subbagian</p>
        </div>
      </div>

      {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

      {/* Petugas by Category */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryPetugas = groupedPetugas[category.key] || [];
          return (
            <div key={category.key} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Category Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{category.label}</h2>
                    <p className="text-sm text-gray-600">{categoryPetugas.length} petugas</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleAddPetugas(category.key)}
                  className="text-sm"
                >
                  + Tambah
                </Button>
              </div>

              {/* Category Content */}
              {categoryPetugas.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <p>Belum ada petugas di bagian ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold text-gray-700">Nama</th>
                        <th className="text-left px-6 py-4 font-semibold text-gray-700">NIP</th>
                        <th className="text-center px-6 py-4 font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryPetugas.map((petugas) => (
                        <tr
                          key={petugas.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-900 font-medium">{petugas.nama}</td>
                          <td className="px-6 py-4 text-gray-600">{petugas.nip}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-3">
                              <button
                                onClick={() => handleEditPetugas(petugas)}
                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                title="Edit petugas"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeletePetugas(petugas)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete petugas"
                              >
                                <svg
                                  className="w-5 h-5"
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
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
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
