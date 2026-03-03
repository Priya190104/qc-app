# 🧪 TESTING CHECKLIST - MODUL PETUGAS

## ✅ FEATURE TESTING

### 1. Tambah Petugas

- [ ] Tombol "Tambah Petugas" membuka modal
- [ ] Modal form kosong saat tambah baru
- [ ] Field yang required: nama, NIP, jabatan, departemen, user
- [ ] Field opsional: phoneNumber, email, status
- [ ] Validasi frontend:
  - [ ] Nama harus diisi
  - [ ] NIP harus diisi
  - [ ] Jabatan harus diisi
  - [ ] Departemen harus diisi
  - [ ] User harus dipilih
- [ ] Submit form ke endpoint POST /api/petugas
- [ ] Response sukses menampilkan notifikasi
- [ ] Data otomatis refresh di tabel tanpa reload halaman
- [ ] Modal tertutup setelah sukses
- [ ] Error handling: tampilkan error message jika user sudah memiliki petugas profile

### 2. Edit Petugas

- [ ] Tombol edit (icon pensil) muncul di setiap row
- [ ] Klik edit membuka modal dengan data terisi otomatis
- [ ] Field nama terupdate
- [ ] Field NIP bisa diedit
- [ ] Field jabatan terupdate
- [ ] Field departemen terupdate
- [ ] Field phoneNumber terupdate
- [ ] Field email terupdate
- [ ] Field status (aktif/nonaktif) terupdate
- [ ] User field TIDAK muncul di form edit (read-only karena one-to-one relationship)
- [ ] Submit form ke endpoint PATCH /api/petugas/:id
- [ ] Validasi NIP duplikasi saat update:
  - [ ] Jika NIP diubah ke NIP yang sudah ada → error "NIP already exists"
  - [ ] Jika NIP tetap sama → tidak ada error
- [ ] Response sukses menampilkan notifikasi
- [ ] Data otomatis refresh tanpa reload halaman
- [ ] Modal tertutup setelah sukses

### 3. View Details / Lihat Detail

- [ ] Tombol view (icon mata) muncul di setiap row
- [ ] Klik membuka modal dengan informasi lengkap
- [ ] Modal menampilkan:
  - [ ] Nama
  - [ ] NIP
  - [ ] Jabatan
  - [ ] Departemen
  - [ ] Email
  - [ ] Nomor Telepon
  - [ ] Status (Aktif/Tidak Aktif)
- [ ] Data fresh (ambil dari API by ID)
- [ ] Modal punya tombol "Tutup"

### 4. Hapus Petugas

- [ ] Tombol delete (icon trash) muncul di setiap row
- [ ] Klik delete membuka confirmation modal
- [ ] Modal menampilkan:
  - [ ] Peringatan "Apakah Anda yakin ingin menghapus petugas: [nama]"
  - [ ] Warning box: "Petugas tidak dapat dihapus jika masih memiliki dokumen aktif"
- [ ] Button "Batal" menutup modal tanpa aksi
- [ ] Button "Hapus" melakukan DELETE ke endpoint /api/petugas/:id
- [ ] Validasi backend: tidak bisa hapus jika masih ada berkas dengan status != 'archived'
  - [ ] Expected error: "Cannot delete petugas with active berkas"
- [ ] Jika sukses hapus:
  - [ ] Tampilkan notifikasi sukses
  - [ ] Data otomatis refresh
  - [ ] Petugas hilang dari tabel
  - [ ] Modal tertutup
- [ ] Jika error saat hapus:
  - [ ] Tampilkan error message
  - [ ] Data tidak berubah
  - [ ] Tetap di modal konfirmasi

### 5. NIP Editability & Validation

- [ ] NIP bisa diedit di modal edit
- [ ] Unique constraint di database (schema.prisma)
- [ ] Validasi duplikasi saat CREATE:
  - [ ] POST /api/petugas dengan NIP yang sudah ada → error
- [ ] Validasi duplikasi saat UPDATE:
  - [ ] PATCH /api/petugas/:id dengan NIP yang sudah ada (dari petugas lain) → error
  - [ ] PATCH dengan NIP yang sama (dari petugas itu sendiri) → success
- [ ] Error message jelas: "NIP already exists"

### 6. Table Display & Rendering

- [ ] Kolom: Nama, NIP, Jabatan, Departemen, Status, Aksi
- [ ] Data sorted by createdAt desc (terbaru duluan)
- [ ] Status badge:
  - [ ] Hijau "Aktif" untuk isActive = true
  - [ ] Merah "Tidak Aktif" untuk isActive = false
- [ ] Hover effect di row
- [ ] Icons muncul rapi di kolom aksi
- [ ] Pesan "Belum ada petugas" jika list kosong
- [ ] Loading spinner saat fetch data

### 7. User Selection (Modal Tambah)

- [ ] Dropdown user muncul dengan daftar lengkap
- [ ] Format: "FirstName LastName (email)"
- [ ] User yang dipilih tersimpan di userId field
- [ ] Validasi: minimal harus 1 user dipilih
- [ ] User yang sudah punya petugas profile bisa tetap dipilih (validasi di backend)

## 🔄 INTEGRATION TESTING

### API Endpoints

- [ ] POST /api/petugas → create petugas
- [ ] GET /api/petugas → list petugas dengan pagination
- [ ] GET /api/petugas/:id → get detail petugas
- [ ] PATCH /api/petugas/:id → update petugas
- [ ] DELETE /api/petugas/:id → delete petugas

### Request/Response Format

- [ ] All responses mengikuti standard API response format:
  ```json
  {
    "statusCode": 200,
    "message": "Success",
    "data": {...}
  }
  ```
- [ ] Error response:
  ```json
  {
    "statusCode": 400/500,
    "message": "Error message",
    "error": "Details"
  }
  ```

### Database

- [ ] User-Petugas relationship one-to-one
- [ ] NIP adalah unique constraint
- [ ] Petugas-Berkas relationship one-to-many
- [ ] onDelete cascade untuk UserRole
- [ ] onDelete SetNull untuk Berkas.petugasId
- [ ] onDelete Restrict untuk Petugas.userId

## 🐛 ERROR HANDLING TEST

### Frontend Errors

- [ ] Validasi field kosong → error message muncul di modal
- [ ] NIP duplikasi saat create → error dari backend ditampilkan
- [ ] NIP duplikasi saat update → error dari backend ditampilkan
- [ ] User sudah punya petugas → error dari backend ditampilkan
- [ ] Network error → try again option
- [ ] API timeout → error message

### Backend Errors

- [ ] CreatePetugasDto validation (semua required fields)
- [ ] UpdatePetugasDto validation (opsional tapi format harus valid)
- [ ] NIP uniqueness check di create
- [ ] NIP uniqueness check di update
- [ ] User already has petugas check
- [ ] Petugas not found (saat get/edit/delete)
- [ ] Cannot delete with active berkas check

## 🎨 UI/UX TESTING

### Modal Behavior

- [ ] Modal bisa ditutup dengan tombol X (header)
- [ ] Modal bisa ditutup dengan tombol "Batal"
- [ ] Modal bisa ditutup dengan click outside (kalau menggunakan backdrop)
- [ ] Error message hilang saat form di-reset
- [ ] Loading state: tombol disabled dan show "Menyimpan..."
- [ ] Confirmation modal punya styling yang berbeda (merah untuk delete)

### Responsive Design

- [ ] Table responsive di mobile (consider overflow-x or card view)
- [ ] Modal responsive di mobile
- [ ] Input fields responsive
- [ ] Button size OK di mobile

### Data Consistency

- [ ] Setelah tambah → data muncul di tabel
- [ ] Setelah edit → data di tabel terupdate
- [ ] Setelah hapus → data hilang dari tabel
- [ ] Tidak ada duplikat data di tabel
- [ ] Data tidak kacau saat ada multiple tabs

## 📊 PERFORMANCE TEST

- [ ] GET /api/petugas dengan list banyak (pagination works)
- [ ] Load time reasonable (<2 detik)
- [ ] Tidak ada memory leak di modal (test open-close-open-close)
- [ ] Console tidak ada warning/error

## 🎯 MANUAL TEST FLOW

### Flow 1: Create Petugas (Happy Path)

```
1. Buka halaman Petugas
2. Klik "Tambah Petugas"
3. Isi form:
   - Nama: "Budi Santoso"
   - NIP: "198505101"
   - Jabatan: "Operator QC"
   - Departemen: "Quality Control"
   - User: Pilih user yang belum punya petugas
   - Phone: "081234567890"
   - Email: "budi@example.com"
   - Status: ✓ Aktif
4. Klik "Simpan"
5. ✅ Expected: Notifikasi sukses, modal tertutup, data muncul di tabel
```

### Flow 2: Edit Petugas

```
1. Di tabel, cari petugas yang baru dibuat
2. Klik icon edit
3. Ubah:
   - Nama: "Budi Santoso Wijaya"
   - NIP: "198505102" (ubah NIP)
   - Jabatan: "Senior QC Officer"
4. Klik "Simpan"
5. ✅ Expected: Notifikasi sukses, data di tabel terupdate
```

### Flow 3: View Details

```
1. Di tabel, klik icon mata (view)
2. ✅ Expected: Modal terbuka dengan semua data
3. Klik "Tutup"
4. ✅ Expected: Modal tertutup
```

### Flow 4: Delete Petugas (Without Active Berkas)

```
1. Di tabel, klik icon delete
2. ✅ Expected: Confirmation modal muncul
3. Klik "Hapus"
4. ✅ Expected: Notifikasi sukses, petugas hilang dari tabel
```

### Flow 5: Delete Petugas (With Active Berkas) - Negative Test

```
1. Petugas yang masih punya berkas aktif
2. Klik delete
3. Klik "Hapus"
4. ✅ Expected: Error message "Cannot delete petugas with active berkas"
5. Petugas tetap ada di tabel
```

### Flow 6: NIP Duplikasi - Negative Test

```
1. Create 2 petugas dengan NIP yang sama
2. ✅ Expected: Error "NIP already exists"
3. Saat edit petugas, ubah NIP ke NIP milik petugas lain
4. ✅ Expected: Error "NIP already exists"
```

## ✨ FINAL CHECKLIST

Semua test harus PASS sebelum production:

- [ ] Semua feature test PASS
- [ ] Semua integration test PASS
- [ ] Semua error handling test PASS
- [ ] Semua UI/UX test PASS
- [ ] Performance test OK
- [ ] Semua manual flow sukses
- [ ] Console tidak ada error/warning
- [ ] No reload halaman saat add/edit/delete
- [ ] Notifikasi tampil (sukses/error)
- [ ] Database data konsisten dengan UI

---

**Status**: 🔄 READY FOR TESTING
**Last Updated**: 29 January 2026
**Tested By**: [Nama Tester]
**Test Environment**: localhost:3000 (Frontend) + localhost:3001/api (Backend)
