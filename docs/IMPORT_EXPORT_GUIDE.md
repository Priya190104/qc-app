# Fitur Import/Export Berkas

## Ringkasan

Fitur ini memungkinkan pengguna untuk:

1. **Mengunduh (Export)** data berkas dalam format Excel (.xlsx)
2. **Mengunggah (Import)** data berkas dari file Excel atau CSV secara bulk

## Teknologi

### Backend

- **Library**: `xlsx` - untuk membaca dan menulis file Excel
- **Framework**: NestJS dengan Prisma ORM
- **Endpoint**:
  - `GET /berkas/import-export/export` - Export berkas
  - `POST /berkas/import-export/import` - Import berkas

### Frontend

- **Framework**: Next.js 14
- **Component**: `BerkasImportExport.tsx` - UI untuk import/export

## Fitur Export

### Endpoint

```
GET /berkas/import-export/export?ids=id1,id2,id3
```

### Parameter

- `ids` (optional): Comma-separated list of berkas IDs untuk export tertentu
  - Jika tidak diberikan, semua berkas akan diexport

### Response

- File Excel dengan format:
  - No., No. Berkas, Nama Pemohon, Tanggal Masuk, Tahun Berkas
  - Kegiatan, Desa, Kecamatan, Nama Prosedur, Luas Pendaftaran
  - DI 302, DI 305, KKS, Status, Deskripsi, Pembuat, Tanggal Dibuat

### Contoh Kolom Excel

| No. | No. Berkas | Nama Pemohon | Tanggal Masuk | Kegiatan    | Desa       | Kecamatan | Status  |
| --- | ---------- | ------------ | ------------- | ----------- | ---------- | --------- | ------- |
| 1   | 001/2024   | Budi Santoso | 01/01/2024    | Pendaftaran | Merah Baru | Kec. A    | SELESAI |

## Fitur Import

### Endpoint

```
POST /berkas/import-export/import
Content-Type: multipart/form-data
```

### Parameter

- `file` (required): File Excel atau CSV

### Format File

**Kolom Wajib:**

- `No. Berkas` - Nomor referensi berkas (unik)
- `Nama Pemohon` - Nama pemohon

**Kolom Optional:**

- `Tanggal Masuk` - Format: DD/MM/YYYY
- `Tahun Berkas` - Tahun
- `Kegiatan` - Jenis kegiatan
- `Desa` - Nama desa
- `Kecamatan` - Nama kecamatan
- `Nama Prosedur` - Jenis prosedur
- `Luas Pendaftaran` - Dalam satuan tertentu
- `DI 302`, `DI 305`, `KKS` - Field tambahan
- `Status` - Status berkas (PROSES, SELESAI, DITUTUP)
- `Deskripsi` - Keterangan berkas
- `Tanggal Dibuat` - Format: DD/MM/YYYY

### Response Success

```json
{
  "success": true,
  "message": "5 berkas berhasil diimport",
  "data": {
    "imported": 5,
    "total": 6,
    "errors": ["Baris 2: No. Berkas 002/2024 sudah ada di database"]
  }
}
```

### Response Error

```json
{
  "success": false,
  "message": "Import gagal: File Excel kosong atau format tidak valid"
}
```

## Validasi Data Import

1. **No. Berkas** (Wajib)
   - Tidak boleh kosong
   - Harus unik (tidak boleh duplikat dengan existing)

2. **Nama Pemohon** (Wajib)
   - Tidak boleh kosong

3. **Tanggal Masuk** (Optional)
   - Format: DD/MM/YYYY atau ISO date
   - Akan diabaikan jika format tidak valid

4. **Tahun Berkas** (Optional)
   - Harus angka di antara 1900-2100

5. **Luas Pendaftaran** (Optional)
   - Harus angka positif

6. **Status** (Optional)
   - Valid nilai: PROSES, SELESAI, DITUTUP
   - Default: PROSES

## Penggunaan UI

### Mengunduh (Export)

1. Klik tombol "📥 Unduh Excel"
2. File Excel otomatis ter-download
3. Pesan success muncul jika berhasil

### Mengunggah (Import)

1. Klik tombol "📤 Unggah Excel"
2. Pilih file Excel atau CSV
3. File di-upload dan diproses otomatis
4. Pesan success/error muncul
5. List berkas otomatis refresh jika berhasil

## Struktur File

### Backend

```
backend/src/modules/berkas/
├── services/
│   ├── berkas.service.ts (existing)
│   └── berkas-import-export.service.ts (NEW)
├── controllers/
│   ├── berkas.controller.ts (existing)
│   └── berkas-import-export.controller.ts (NEW)
└── berkas.module.ts (updated)
```

### Frontend

```
frontend/src/
├── components/
│   └── modals/
│       ├── AddBerkasModal.tsx (existing)
│       └── BerkasImportExport.tsx (NEW)
└── app/berkas/
    └── all/
        └── page.tsx (updated)
```

## Database Changes

### Removed Fields

Kolom berikut dihapus dari tabel Berkas (tidak relevan dengan fitur ini):

- `filePath` - Path file dokumen
- `fileSize` - Ukuran file dokumen
- `fileType` - Tipe file dokumen

### Migration

- `migration_lock.toml`
- `20260211000001_remove_file_fields/migration.sql`
- `20260211000000_update_berkas_status_values/migration.sql`

## Use Cases

### Scenario 1: Manager mengunduh laporan

1. Manager masuk ke halaman "Semua Berkas"
2. Klik "📥 Unduh Excel" untuk export semua data
3. File diunduh dan dapat dibuka di Excel untuk analisis

### Scenario 2: Operator bulk import data

1. Operator memiliki file Excel dengan 100 berkas baru
2. Masuk ke halaman "Semua Berkas"
3. Klik "📤 Unggah Excel" dan pilih file
4. Sistem memvalidasi dan insert data ke database
5. Jika ada error, ditampilkan berapa row yang gagal

### Scenario 3: Backup dan restore

1. Export semua berkas ke Excel (backup)
2. Jika diperlukan restore, import file Excel tersebut

## Performance

- **Export**: O(n) where n = jumlah berkas yang di-export
- **Import**: O(n) where n = jumlah row di file
- **File size**: ~50KB per 1000 rows (untuk format .xlsx)
- **Limit**: Max 50MB per file (dari env config)

## Error Handling

### Export Errors

- Berkas tidak ditemukan
- Akses denied (authentication/authorization)
- Server error

### Import Errors

- File format tidak valid
- Kolom wajib kosong
- Data duplicate (No. Berkas sudah ada)
- Data validation error
- Partial success dengan error report per row

## Future Enhancement

1. **Template Download** - Download template kosong untuk import
2. **Advanced Mapping** - Mapping kolom custom dari Excel
3. **Scheduled Export** - Jadwal automatic export to cloud
4. **Selective Sync** - Pilih fields apa saja yang di-export/import
