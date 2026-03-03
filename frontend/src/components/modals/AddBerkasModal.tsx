'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { apiClient } from '@/lib/api';

interface AddBerkasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface KecamatanOption {
  id: string;
  nama: string;
}

interface DesaOption {
  id: string;
  nama: string;
  kecamatanId: string;
}

interface ProsedurOption {
  id: string;
  nama: string;
}

// Dummy data - dapat diganti dengan API call
const kecamatanData: KecamatanOption[] = [
  { id: '1', nama: 'Kecamatan A' },
  { id: '2', nama: 'Kecamatan B' },
  { id: '3', nama: 'Kecamatan C' },
];

const desaData: DesaOption[] = [
  { id: '1', nama: 'Desa Merah Baru', kecamatanId: '1' },
  { id: '2', nama: 'Desa Sungai Bertam', kecamatanId: '1' },
  { id: '3', nama: 'Desa Kalimantan', kecamatanId: '2' },
  { id: '4', nama: 'Desa Sumatra', kecamatanId: '2' },
  { id: '5', nama: 'Desa Jawa', kecamatanId: '3' },
  { id: '6', nama: 'Desa Sulawesi', kecamatanId: '3' },
];

const prosedurData: ProsedurOption[] = [
  { id: '1', nama: 'Pendaftaran Hak Milik' },
  { id: '2', nama: 'Pendaftaran Hak Guna Usaha' },
  { id: '3', nama: 'Pendaftaran Hak Pakai' },
];

export default function AddBerkasModal({ isOpen, onClose, onSuccess }: AddBerkasModalProps) {
  const [formData, setFormData] = useState({
    kegiatan: '',
    tanggalBerkas: '',
    noBerkas: '',
    tahunBerkas: new Date().getFullYear().toString(),
    namaPemohon: '',
    kecamatan: '',
    desa: '',
    namaProsedur: '',
    luasPendaftaran: '',
    di302: '',
    di305: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredDesa, setFilteredDesa] = useState<DesaOption[]>([]);

  // Update filtered desa when kecamatan changes
  useEffect(() => {
    if (formData.kecamatan) {
      const filtered = desaData.filter((d) => d.kecamatanId === formData.kecamatan);
      setFilteredDesa(filtered);
      setFormData((prev) => ({
        ...prev,
        desa: '', // Reset desa when kecamatan changes
      }));
    } else {
      setFilteredDesa([]);
    }
  }, [formData.kecamatan]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: string
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.kegiatan.trim()) {
        throw new Error('Kegiatan harus diisi');
      }
      if (!formData.tanggalBerkas) {
        throw new Error('Tanggal berkas harus diisi');
      }
      if (!formData.noBerkas.trim()) {
        throw new Error('No. Berkas harus diisi');
      }
      if (!formData.tahunBerkas) {
        throw new Error('Tahun berkas harus diisi');
      }
      if (!formData.namaPemohon.trim()) {
        throw new Error('Nama pemohon harus diisi');
      }
      if (!formData.kecamatan) {
        throw new Error('Kecamatan harus dipilih');
      }
      if (!formData.desa) {
        throw new Error('Desa/Kelurahan harus dipilih');
      }
      if (!formData.namaProsedur) {
        throw new Error('Nama prosedur harus dipilih');
      }
      if (!formData.luasPendaftaran) {
        throw new Error('Luas pendaftaran harus diisi');
      }
      if (!formData.di302.trim()) {
        throw new Error('DI.302 harus diisi');
      }
      if (!formData.di305.trim()) {
        throw new Error('DI.305 harus diisi');
      }

      // Submit to API
      const payload = {
        nomor: `${formData.noBerkas}/${formData.tahunBerkas}`,
        kegiatan: formData.kegiatan,
        tanggalBerkas: formData.tanggalBerkas,
        tahunBerkas: parseInt(formData.tahunBerkas),
        namaPemohon: formData.namaPemohon,
        kecamatan:
          kecamatanData.find((k) => k.id === formData.kecamatan)?.nama || formData.kecamatan,
        desa: desaData.find((d) => d.id === formData.desa)?.nama || formData.desa,
        namaProsedur:
          prosedurData.find((p) => p.id === formData.namaProsedur)?.nama || formData.namaProsedur,
        luasPendaftaran: parseInt(formData.luasPendaftaran),
        di302: formData.di302,
        di305: formData.di305,
        // status tidak perlu dikirim karena backend sudah set default DIBUAT
      };

      console.log('📤 Sending data to API:', payload);
      const response = await apiClient.post('/berkas', payload);
      console.log('✅ Response from API:', response.data);

      if (response.status === 201 || response.status === 200) {
        // Reset form
        setFormData({
          kegiatan: '',
          tanggalBerkas: '',
          noBerkas: '',
          tahunBerkas: new Date().getFullYear().toString(),
          namaPemohon: '',
          kecamatan: '',
          desa: '',
          namaProsedur: '',
          luasPendaftaran: '',
          di302: '',
          di305: '',
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Gagal menambah berkas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Tambah Berkas Baru</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <Alert type="error" title="Error" message={error} />}

          <div className="grid grid-cols-2 gap-4">
            {/* Kegiatan */}
            <Input
              label="Kegiatan"
              type="text"
              value={formData.kegiatan}
              onChange={(e) => handleInputChange(e, 'kegiatan')}
              placeholder="Masukkan kegiatan"
              required
            />

            {/* Tanggal Berkas */}
            <Input
              label="Tanggal Berkas"
              type="date"
              value={formData.tanggalBerkas}
              onChange={(e) => handleInputChange(e, 'tanggalBerkas')}
              required
            />

            {/* No. Berkas */}
            <Input
              label="No. Berkas"
              type="text"
              value={formData.noBerkas}
              onChange={(e) => handleInputChange(e, 'noBerkas')}
              placeholder="Masukkan nomor berkas"
              required
            />

            {/* Tahun Berkas */}
            <Input
              label="Tahun Berkas"
              type="number"
              value={formData.tahunBerkas}
              onChange={(e) => handleInputChange(e, 'tahunBerkas')}
              required
            />

            {/* Nama Pemohon */}
            <Input
              label="Nama Pemohon"
              type="text"
              value={formData.namaPemohon}
              onChange={(e) => handleInputChange(e, 'namaPemohon')}
              placeholder="Masukkan nama pemohon"
              required
            />

            {/* Kecamatan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.kecamatan}
                onChange={(e) => handleInputChange(e, 'kecamatan')}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Kecamatan --</option>
                {kecamatanData.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Desa/Kelurahan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Desa/Kelurahan <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.desa}
                onChange={(e) => handleInputChange(e, 'desa')}
                disabled={!formData.kecamatan}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                required
              >
                <option value="">-- Pilih Desa/Kelurahan --</option>
                {filteredDesa.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Prosedur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Prosedur <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.namaProsedur}
                onChange={(e) => handleInputChange(e, 'namaProsedur')}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Pilih Prosedur --</option>
                {prosedurData.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Luas Pendaftaran */}
            <Input
              label="Luas Pendaftaran (m²)"
              type="number"
              value={formData.luasPendaftaran}
              onChange={(e) => handleInputChange(e, 'luasPendaftaran')}
              placeholder="Masukkan luas (m²)"
              required
            />

            {/* DI.302 */}
            <Input
              label="DI.302"
              type="text"
              value={formData.di302}
              onChange={(e) => handleInputChange(e, 'di302')}
              placeholder="Masukkan DI.302"
              required
            />

            {/* DI.305 */}
            <Input
              label="DI.305"
              type="text"
              value={formData.di305}
              onChange={(e) => handleInputChange(e, 'di305')}
              placeholder="Masukkan DI.305"
              required
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Simpan Berkas'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
