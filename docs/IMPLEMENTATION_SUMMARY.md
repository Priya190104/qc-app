# Implementasi Workflow Berkas - Summary

## Perubahan yang Telah Dilakukan

Sistem QC Berkas telah diperbarui dengan alur workflow yang jelas dan terstruktur. Berikut adalah ringkasan perubahan:

### 1. Database Schema ✅

**File**: `backend/prisma/schema.prisma`

- **Update enum `BerkasStatus`** dengan 10 status yang jelas:
  - `DIBUAT` - Berkas baru dibuat
  - `DI_OPERATOR_DATA_UKUR` - Di operator data ukur
  - `DI_PETUGAS_UKUR` - Di petugas ukur
  - `DI_OPERATOR_DATA_PEMETAAN` - Di operator data pemetaan
  - `DI_PETUGAS_PEMETAAN` - Di petugas pemetaan
  - `PEMILIHAN_KKS` - Pemilihan KKS
  - `DI_KKS` - Di KKS
  - `DI_KEPALA_SEKSI` - Di kepala seksi
  - `SELESAI` - Selesai
  - `DITUTUP` - Ditutup

- **Field baru pada model `Berkas`**:
  - `kksId` - ID user KKS yang assigned
  - `revisionCount` - Jumlah revisi
  - `lastRevisionReason` - Alasan revisi terakhir
  - `lastRevisionFrom` - Status sebelum revisi terakhir
  - Relasi `kksUser` ke model `User`

### 2. Backend Implementation ✅

#### Constants & Utilities

**File**: `backend/src/common/constants/berkas-status.ts`

- Enum `BerkasStatus` updated
- `BERKAS_STATUS_LABELS` untuk label Indonesia
- `STATUS_TRANSITIONS` - valid status transitions
- `REVISION_TARGETS` - target revisi untuk KKS dan Kepala Seksi
- Helper function `isValidTransition()`

#### DTOs

**File**: `backend/src/modules/berkas/dto/workflow.dto.ts`

- `TransitionBerkasDto` - transisi status
- `AssignKKSDto` - assign KKS
- `ApproveBerkasDto` - approval (ACC)
- `ReviseBerkasDto` - revisi dengan target selection
- `UpdateDataUkurDto` - update data ukur
- `ValidatePengukuranDto` - validasi pengukuran
- `UpdateDataPemetaanDto` - update data pemetaan
- `ValidatePemetaanDto` - validasi pemetaan

#### Service Layer

**File**: `backend/src/modules/berkas/services/berkas-workflow.service.ts`

Methods implementasi untuk setiap role:

- `getBerkasByStatus()` - Get berkas by status
- `updateDataUkur()` & `lanjutkanKePetugasUkur()` - Operator Data Ukur
- `validatePengukuran()` - Petugas Ukur
- `updateDataPemetaan()` & `lanjutkanKePetugasPemetaan()` - Operator Data Pemetaan
- `validatePemetaan()` - Petugas Pemetaan
- `assignKKS()` - Operator Data Berkas (assignment KKS)
- `approveByKKS()` & `reviseByKKS()` - KKS
- `approveByKepalaSeksi()` & `reviseByKepalaSeksi()` - Kepala Seksi
- `getBerkasHistory()` - Get workflow history

#### Controller

**File**: `backend/src/modules/berkas/controllers/berkas-workflow.controller.ts`

API Endpoints:

- `GET /berkas/workflow/status/:status` - Get berkas by status
- `PUT /berkas/workflow/:id/operator-ukur/update` - Update data ukur
- `POST /berkas/workflow/:id/operator-ukur/lanjutkan` - Lanjut ke Petugas Ukur
- `POST /berkas/workflow/:id/petugas-ukur/validate` - Validasi pengukuran
- `PUT /berkas/workflow/:id/operator-pemetaan/update` - Update data pemetaan
- `POST /berkas/workflow/:id/operator-pemetaan/lanjutkan` - Lanjut ke Petugas Pemetaan
- `POST /berkas/workflow/:id/petugas-pemetaan/validate` - Validasi pemetaan
- `POST /berkas/workflow/:id/assign-kks` - Assign KKS
- `POST /berkas/workflow/:id/kks/approve` - KKS ACC
- `POST /berkas/workflow/:id/kks/revise` - KKS Revisi
- `POST /berkas/workflow/:id/kepala-seksi/approve` - Kepala Seksi ACC
- `POST /berkas/workflow/:id/kepala-seksi/revise` - Kepala Seksi Revisi
- `GET /berkas/workflow/:id/history` - Get history

#### Module Update

**File**: `backend/src/modules/berkas/berkas.module.ts`

- Import `BerkasWorkflowService` dan `BerkasWorkflowController`
- Register di module providers dan controllers

#### Auto-Transition on Create

**File**: `backend/src/modules/berkas/services/berkas.service.ts`

- Berkas yang baru dibuat otomatis transition ke `DI_OPERATOR_DATA_UKUR`
- History record dibuat otomatis

### 3. Frontend Implementation ✅

#### Types

**File**: `frontend/src/types/index.ts`

- `BerkasStatus` enum
- `BerkasStatusLabels` untuk label Indonesia
- `Berkas` interface dengan field workflow baru
- `BerkasHistory` interface
- `CreateBerkasRequest` & `UpdateBerkasRequest`
- DTOs untuk workflow operations

#### API Client

**File**: `frontend/src/lib/workflow-api.ts`

Functions untuk setiap workflow operation:

- `getBerkasByStatus()` - Get berkas by status
- `getBerkasHistory()` - Get history
- Operator Data Ukur: `updateDataUkur()`, `lanjutkanKePetugasUkur()`
- Petugas Ukur: `validatePengukuran()`
- Operator Data Pemetaan: `updateDataPemetaan()`, `lanjutkanKePetugasPemetaan()`
- Petugas Pemetaan: `validatePemetaan()`
- Operator Data Berkas: `assignKKS()`
- KKS: `approveByKKS()`, `reviseByKKS()`
- Kepala Seksi: `approveByKepalaSeksi()`, `reviseByKepalaSeksi()`
- Helper functions: `getKKSRevisionTargets()`, `getKepalaSeksiRevisionTargets()`, `isRevisionStatus()`, `getStatusBadgeColor()`

#### Utilities

**File**: `frontend/src/lib/utils.ts`

- `formatDate()`, `formatDateTime()`, `formatNumber()`, `formatCurrency()`
- Various helper functions

### 4. Documentation ✅

#### Workflow Documentation

**File**: `docs/WORKFLOW_BERKAS.md`

- Detailed workflow description untuk setiap tahap
- Status transitions diagram
- Role permissions
- Field requirements per stage

#### Migration Guide

**File**: `docs/MIGRATION_WORKFLOW.md`

- Step-by-step migration guide
- Data migration strategy
- Testing checklist

## Langkah Selanjutnya

### 1. Database Migration

```bash
cd backend
npx prisma migrate dev --name update_workflow_status
npx prisma generate
```

### 2. Update Data Existing (Manual)

Jika ada data berkas existing, update statusnya:

```sql
UPDATE "Berkas"
SET status = 'DI_OPERATOR_DATA_UKUR'
WHERE status = 'PROSES';
```

### 3. Restart Backend

```bash
cd backend
npm run start:dev
```

### 4. Create Frontend Pages

Anda perlu membuat/update halaman untuk setiap role:

#### a. Operator Data Ukur ⏳

**Path**: `frontend/src/app/berkas/proses/operator-data-ukur/page.tsx`

- List berkas dengan status `DI_OPERATOR_DATA_UKUR`
- Form untuk update data ukur
- Tombol "Lanjutkan ke Petugas Ukur"
- Indikator berkas revisi

#### b. Petugas Ukur ⏳

**Path**: `frontend/src/app/berkas/proses/petugas-ukur/page.tsx`

- List berkas dengan status `DI_PETUGAS_UKUR`
- Form untuk validasi pengukuran dengan field:
  - Pilih Petugas Ukur (dropdown dari master petugas)
  - Pilih PU Lapang (optional)
  - No SHAT/NIBEL, Luas Hasil Ukur, NIB, NIBEL, Jumlah Bidang, No SU
- Tombol "Validasi Selesai" → auto transition ke `DI_OPERATOR_DATA_PEMETAAN`

#### c. Operator Data Pemetaan ⏳

**Path**: `frontend/src/app/berkas/proses/operator-data-pemetaan/page.tsx`

- List berkas dengan status `DI_OPERATOR_DATA_PEMETAAN`
- Form untuk update data pemetaan (DI302, DI305)
- Tombol "Lanjutkan ke Petugas Pemetaan"

#### d. Petugas Pemetaan ⏳

**Path**: `frontend/src/app/berkas/proses/petugas-pemetaan/page.tsx`

- List berkas dengan status `DI_PETUGAS_PEMETAAN`
- Form validasi pemetaan (notes)
- Tombol "Validasi Selesai" → auto transition ke `PEMILIHAN_KKS`

#### e. Operator Data Berkas - Pemilihan KKS ⏳

**Path**: `frontend/src/app/berkas/proses/operator-data-berkas/page.tsx`

- List berkas dengan status `PEMILIHAN_KKS`
- Dropdown pilih KKS (dari user dengan role KKS)
- Tombol "Kirim ke KKS"
- Fitur cetak tanda terima

#### f. KKS ⏳

**Path**: `frontend/src/app/berkas/proses/kks/page.tsx`

- List berkas dengan status `DI_KKS`
- Detail berkas view
- Tombol "ACC" → transition ke `DI_KEPALA_SEKSI`
- Tombol "Revisi" → modal dengan:
  - Dropdown pilih target revisi (Operator Data Ukur, Petugas Ukur, Operator Data Pemetaan, Petugas Pemetaan)
  - Textarea alasan revisi (required)

#### g. Kepala Seksi ⏳

**Path**: `frontend/src/app/berkas/proses/kepala-seksi/page.tsx`

- List berkas dengan status `DI_KEPALA_SEKSI`
- Detail berkas view
- Tombol "ACC" → transition ke `SELESAI`
- Tombol "Revisi" → modal dengan:
  - Dropdown pilih target revisi (semua tahap termasuk KKS)
  - Textarea alasan revisi (required)

#### h. Berkas Selesai ⏳

**Path**: `frontend/src/app/berkas/selesai/page.tsx`

- List berkas dengan status `SELESAI`
- View only (tidak ada aksi)
- Export/print functionality

### 5. Components yang Perlu Dibuat

#### a. BerkasTimeline Component

**Path**: `frontend/src/components/berkas/BerkasTimeline.tsx`

- Tampilkan history workflow berkas
- Visual timeline dengan status dan timestamp
- Nama user yang melakukan aksi
- Alasan jika ada revisi

#### b. RevisionModal Component

**Path**: `frontend/src/components/modals/RevisionModal.tsx`

- Modal untuk input revisi
- Dropdown target revisi
- Textarea alasan
- Validasi form

#### c. AssignKKSModal Component

**Path**: `frontend/src/components/modals/AssignKKSModal.tsx`

- Modal untuk assign KKS
- Dropdown pilih user KKS
- Konfirmasi assignment

#### d. BerkasDetailCard Component

**Path**: `frontend/src/components/berkas/BerkasDetailCard.tsx`

- Tampilan detail berkas
- Semua informasi berkas
- Status badge
- Revision indicator

### 6. Testing

#### Unit Tests

- Test service methods untuk validasi transisi status
- Test DTO validations
- Test helper functions

#### Integration Tests

- Test API endpoints
- Test workflow transitions
- Test revision flow

#### E2E Tests

- Test full workflow dari awal sampai selesai
- Test revision flow
- Test role-based access

### 7. Features Tambahan (Optional)

#### a. Notifications

- Notify user ketika berkas masuk ke halaman mereka
- Notify user ketika berkas di-revisi

#### b. Dashboard Updates

- Update dashboard untuk menampilkan berkas per status
- Chart untuk visualisasi workflow

#### c. Reporting

- Laporan berkas per tahap
- Laporan waktu proses per tahap
- Laporan jumlah revisi

#### d. Audit Trail

- Lengkapi audit log untuk setiap action
- Track perubahan data

## File Reference

### Backend Files Created/Modified:

1. `backend/prisma/schema.prisma` - Schema update
2. `backend/src/common/constants/berkas-status.ts` - Status constants
3. `backend/src/modules/berkas/dto/workflow.dto.ts` - Workflow DTOs
4. `backend/src/modules/berkas/services/berkas-workflow.service.ts` - Workflow service
5. `backend/src/modules/berkas/controllers/berkas-workflow.controller.ts` - Workflow controller
6. `backend/src/modules/berkas/berkas.module.ts` - Module update
7. `backend/src/modules/berkas/services/berkas.service.ts` - Auto-transition on create

### Frontend Files Created/Modified:

1. `frontend/src/types/index.ts` - Types update
2. `frontend/src/lib/workflow-api.ts` - Workflow API client
3. `frontend/src/lib/utils.ts` - Utility functions

### Documentation Files Created:

1. `docs/WORKFLOW_BERKAS.md` - Workflow documentation
2. `docs/MIGRATION_WORKFLOW.md` - Migration guide
3. `docs/IMPLEMENTATION_SUMMARY.md` - This file

## API Endpoints Summary

```
GET    /api/berkas/workflow/status/:status          - Get berkas by status
PUT    /api/berkas/workflow/:id/operator-ukur/update      - Update data ukur
POST   /api/berkas/workflow/:id/operator-ukur/lanjutkan    - Lanjut ke Petugas Ukur
POST   /api/berkas/workflow/:id/petugas-ukur/validate      - Validasi pengukuran
PUT    /api/berkas/workflow/:id/operator-pemetaan/update   - Update data pemetaan
POST   /api/berkas/workflow/:id/operator-pemetaan/lanjutkan - Lanjut ke Petugas Pemetaan
POST   /api/berkas/workflow/:id/petugas-pemetaan/validate  - Validasi pemetaan
POST   /api/berkas/workflow/:id/assign-kks                  - Assign KKS
POST   /api/berkas/workflow/:id/kks/approve                 - KKS ACC
POST   /api/berkas/workflow/:id/kks/revise                  - KKS Revisi
POST   /api/berkas/workflow/:id/kepala-seksi/approve        - Kepala Seksi ACC
POST   /api/berkas/workflow/:id/kepala-seksi/revise         - Kepala Seksi Revisi
GET    /api/berkas/workflow/:id/history                     - Get history
```

## Kontak & Support

Jika ada pertanyaan atau issue terkait implementasi workflow ini, silakan:

1. Check dokumentasi di folder `docs/`
2. Review kode yang sudah dibuat
3. Test API endpoints menggunakan Postman/Thunder Client
4. Check Prisma Studio untuk struktur database

---

**Status**: Backend Implementation ✅ | Frontend Implementation ⏳ | Testing ⏳

**Last Updated**: February 13, 2026
