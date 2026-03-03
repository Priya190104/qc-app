# Workflow Berkas - Sistem QC Berkas

## Alur Lengkap Proses Berkas

### 1. DIBUAT - Operator Data Berkas

- **Peran**: Operator Data Berkas
- **Aksi**: Menambahkan berkas baru ke sistem
- **Status Awal**: `DIBUAT`
- **Transisi Otomatis ke**: `DI_OPERATOR_DATA_UKUR`

---

### 2. DI_OPERATOR_DATA_UKUR - Operator Data Ukur

- **Peran**: Operator Data Ukur
- **Aksi**: Melakukan pembaruan data berkas terkait pengukuran
- **Data yang Diperbarui**:
  - No STP
  - Tanggal STP
  - Luas Pendaftaran
  - Data pengukuran lainnya
- **Tombol Aksi**: "Lanjutkan ke Petugas Ukur"
- **Transisi ke**: `DI_PETUGAS_UKUR`

---

### 3. DI_PETUGAS_UKUR - Petugas Ukur

- **Peran**: Petugas Ukur
- **Aksi**: Melakukan pembaruan berkas dan validasi bahwa pengukuran telah dilakukan
- **Data yang Diperbarui**:
  - Petugas Ukur (dipilih dari master petugas)
  - PU Lapang (dipilih dari master petugas)
  - No SHAT/NIBEL
  - Luas Hasil Ukur
  - NIB
  - NIBEL
  - Jumlah Bidang
  - No SU
- **Tombol Aksi**: "Validasi Pengukuran Selesai"
- **Transisi ke**: `DI_OPERATOR_DATA_PEMETAAN`

---

### 4. DI_OPERATOR_DATA_PEMETAAN - Operator Data Pemetaan

- **Peran**: Operator Data Pemetaan
- **Aksi**: Melakukan pembaruan data berkas terkait pemetaan
- **Data yang Diperbarui**:
  - Data pemetaan
  - Koordinat
  - File terkait pemetaan
- **Tombol Aksi**: "Lanjutkan ke Petugas Pemetaan"
- **Transisi ke**: `DI_PETUGAS_PEMETAAN`

---

### 5. DI_PETUGAS_PEMETAAN - Petugas Pemetaan

- **Peran**: Petugas Pemetaan
- **Aksi**: Melakukan pemetaan dan validasi bahwa pemetaan telah selesai
- **Tombol Aksi**: "Validasi Pemetaan Selesai"
- **Transisi ke**: `PEMILIHAN_KKS`

---

### 6. PEMILIHAN_KKS - Operator Data Berkas (Kembali)

- **Peran**: Operator Data Berkas
- **Aksi**:
  - Memilih KKS yang akan memeriksa berkas
  - Mencetak tanda terima
- **Data yang Diperbarui**:
  - KKS (dipilih dari user dengan role KKS)
  - Status berkas
- **Tombol Aksi**: "Kirim ke KKS"
- **Transisi ke**: `DI_KKS`

---

### 7. DI_KKS - KKS (Koordinator Kelompok Substansi)

- **Peran**: KKS
- **Aksi**: Pemeriksaan berkas
- **Pilihan Aksi**:
  - **ACC**: Berkas disetujui → Status: `DI_KEPALA_SEKSI`
  - **REVISI**: Berkas perlu diperbaiki → Pilih tujuan revisi:
    - Kembali ke Operator Data Ukur → Status: `DI_OPERATOR_DATA_UKUR`
    - Kembali ke Petugas Ukur → Status: `DI_PETUGAS_UKUR`
    - Kembali ke Operator Data Pemetaan → Status: `DI_OPERATOR_DATA_PEMETAAN`
    - Kembali ke Petugas Pemetaan → Status: `DI_PETUGAS_PEMETAAN`
- **Data Revisi**:
  - Alasan revisi (wajib jika revisi)
  - Tujuan revisi

---

### 8. DI_KEPALA_SEKSI - Kepala Seksi

- **Peran**: Kepala Seksi
- **Aksi**: Pemeriksaan final berkas
- **Pilihan Aksi**:
  - **ACC**: Berkas disetujui → Status: `SELESAI`
  - **REVISI**: Berkas perlu diperbaiki → Pilih tujuan revisi:
    - Kembali ke Operator Data Ukur → Status: `DI_OPERATOR_DATA_UKUR`
    - Kembali ke Petugas Ukur → Status: `DI_PETUGAS_UKUR`
    - Kembali ke Operator Data Pemetaan → Status: `DI_OPERATOR_DATA_PEMETAAN`
    - Kembali ke Petugas Pemetaan → Status: `DI_PETUGAS_PEMETAAN`
    - Kembali ke KKS → Status: `DI_KKS`
- **Data Revisi**:
  - Alasan revisi (wajib jika revisi)
  - Tujuan revisi

---

### 9. SELESAI

- **Status Akhir**: Berkas telah selesai diproses
- **Tidak ada aksi lebih lanjut**

---

## Status Berkas

```typescript
enum BerkasStatus {
  DIBUAT = "DIBUAT", // Berkas baru dibuat
  DI_OPERATOR_DATA_UKUR = "DI_OPERATOR_DATA_UKUR", // Di operator data ukur
  DI_PETUGAS_UKUR = "DI_PETUGAS_UKUR", // Di petugas ukur
  DI_OPERATOR_DATA_PEMETAAN = "DI_OPERATOR_DATA_PEMETAAN", // Di operator data pemetaan
  DI_PETUGAS_PEMETAAN = "DI_PETUGAS_PEMETAAN", // Di petugas pemetaan
  PEMILIHAN_KKS = "PEMILIHAN_KKS", // Kembali ke operator berkas untuk pilih KKS
  DI_KKS = "DI_KKS", // Di KKS untuk pemeriksaan
  DI_KEPALA_SEKSI = "DI_KEPALA_SEKSI", // Di Kepala Seksi untuk pemeriksaanfinal
  SELESAI = "SELESAI", // Berkas selesai
  DITUTUP = "DITUTUP", // Berkas ditutup (cancelled)
}
```

## Diagram Alur

```
┌─────────────────────────────────────────────────────────────────┐
│  1. DIBUAT (Operator Data Berkas)                               │
│     - Input data berkas baru                                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ Auto
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. DI_OPERATOR_DATA_UKUR (Operator Data Ukur)                  │◄─┐
│     - Update data ukur                                           │  │
└────────────────────────────┬────────────────────────────────────┘  │
                             │                                        │
                             ▼                                        │
┌─────────────────────────────────────────────────────────────────┐  │
│  3. DI_PETUGAS_UKUR (Petugas Ukur)                              │◄─┤
│     - Validasi pengukuran                                        │  │
└────────────────────────────┬────────────────────────────────────┘  │
                             │                                        │
                             ▼                                        │
┌─────────────────────────────────────────────────────────────────┐  │
│  4. DI_OPERATOR_DATA_PEMETAAN (Operator Data Pemetaan)          │◄─┤
│     - Update data pemetaan                                       │  │
└────────────────────────────┬────────────────────────────────────┘  │
                             │                                        │
                             ▼                                        │
┌─────────────────────────────────────────────────────────────────┐  │
│  5. DI_PETUGAS_PEMETAAN (Petugas Pemetaan)                      │◄─┤
│     - Validasi pemetaan                                          │  │
└────────────────────────────┬────────────────────────────────────┘  │
                             │                                        │
                             ▼                                        │
┌─────────────────────────────────────────────────────────────────┐  │
│  6. PEMILIHAN_KKS (Operator Data Berkas)                        │  │
│     - Pilih KKS & cetak tanda terima                            │  │
└────────────────────────────┬────────────────────────────────────┘  │
                             │                                        │
                             ▼                                        │
┌─────────────────────────────────────────────────────────────────┐  │
│  7. DI_KKS (KKS)                                                 │◄─┤
│     - Pemeriksaan berkas                                         │  │
│     - [ACC] → Lanjut   [REVISI] → Kembali ke tahap sebelumnya  │──┘
└────────────────────────────┬────────────────────────────────────┘
                             │ ACC
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. DI_KEPALA_SEKSI (Kepala Seksi)                              │
│     - Pemeriksaan final                                          │
│     - [ACC] → Selesai   [REVISI] → Kembali ke tahap sebelumnya │──┐
└────────────────────────────┬────────────────────────────────────┘  │
                             │ ACC                                   │
                             ▼                                        │
┌─────────────────────────────────────────────────────────────────┐  │
│  9. SELESAI                                                      │  │
└─────────────────────────────────────────────────────────────────┘  │
                                                                      │
           REVISI: Kembali ke tahap yang ditentukan ◄────────────────┘
```

## Aturan Transisi Status

### Transisi Normal (Forward Flow)

1. `DIBUAT` → `DI_OPERATOR_DATA_UKUR` (otomatis setelah berkas dibuat)
2. `DI_OPERATOR_DATA_UKUR` → `DI_PETUGAS_UKUR` (setelah operator selesai update)
3. `DI_PETUGAS_UKUR` → `DI_OPERATOR_DATA_PEMETAAN` (setelah validasi pengukuran)
4. `DI_OPERATOR_DATA_PEMETAAN` → `DI_PETUGAS_PEMETAAN` (setelah operator selesai update)
5. `DI_PETUGAS_PEMETAAN` → `PEMILIHAN_KKS` (setelah validasi pemetaan)
6. `PEMILIHAN_KKS` → `DI_KKS` (setelah KKS dipilih)
7. `DI_KKS` → `DI_KEPALA_SEKSI` (jika ACC)
8. `DI_KEPALA_SEKSI` → `SELESAI` (jika ACC)

### Transisi Revisi (Backward Flow)

KKS dapat mengembalikan berkas ke:

- `DI_OPERATOR_DATA_UKUR`
- `DI_PETUGAS_UKUR`
- `DI_OPERATOR_DATA_PEMETAAN`
- `DI_PETUGAS_PEMETAAN`

Kepala Seksi dapat mengembalikan berkas ke:

- `DI_OPERATOR_DATA_UKUR`
- `DI_PETUGAS_UKUR`
- `DI_OPERATOR_DATA_PEMETAAN`
- `DI_PETUGAS_PEMETAAN`
- `DI_KKS`

## Role Permissions

### Operator Data Berkas

- Dapat melihat berkas dengan status: `DIBUAT`, `PEMILIHAN_KKS`
- Dapat membuat berkas baru
- Dapat memilih KKS pada status `PEMILIHAN_KKS`

### Operator Data Ukur

- Dapat melihat berkas dengan status: `DI_OPERATOR_DATA_UKUR`
- Dapat mengupdate data ukur
- Dapat melanjutkan ke Petugas Ukur

### Petugas Ukur

- Dapat melihat berkas dengan status: `DI_PETUGAS_UKUR`
- Dapat mengupdate dan validasi data ukur
- Dapat melanjutkan ke Operator Data Pemetaan

### Operator Data Pemetaan

- Dapat melihat berkas dengan status: `DI_OPERATOR_DATA_PEMETAAN`
- Dapat mengupdate data pemetaan
- Dapat melanjutkan ke Petugas Pemetaan

### Petugas Pemetaan

- Dapat melihat berkas dengan status: `DI_PETUGAS_PEMETAAN`
- Dapat validasi pemetaan
- Dapat melanjutkan ke Pemilihan KKS

### KKS

- Dapat melihat berkas dengan status: `DI_KKS`
- Dapat ACC atau Revisi berkas
- Jika revisi, dapat memilih tujuan revisi

### Kepala Seksi

- Dapat melihat berkas dengan status: `DI_KEPALA_SEKSI`
- Dapat ACC atau Revisi berkas
- Jika revisi, dapat memilih tujuan revisi

## Field Tambahan pada Tabel Berkas

```prisma
model Berkas {
  // ... existing fields ...

  // Workflow tracking
  currentStatus       BerkasStatus
  revisionCount       Int             @default(0)
  lastRevisionReason  String?
  lastRevisionFrom    BerkasStatus?   // Status sebelum revisi terakhir
  kksId               String?         @db.Uuid  // KKS yang assigned
  kks                 User?           @relation("berkasKKS", fields: [kksId], references: [id])

  @@index([currentStatus])
  @@index([kksId])
}
```
