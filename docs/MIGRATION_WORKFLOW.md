# Database Migration Guide - Workflow Update

## Persiapan Migration

Setelah schema Prisma diupdate dengan enum status baru dan field tambahan, Anda perlu membuat dan menjalankan migration untuk mengupdate database.

## Steps untuk Migration

### 1. Generate Migration File

Jalankan command berikut di terminal dari folder `backend`:

```bash
npx prisma migrate dev --name update_workflow_status
```

### 2. Review Migration File

Migration file akan dibuat di folder `backend/prisma/migrations/`. Review file SQL yang dihasilkan untuk memastikan migrasi berjalan dengan benar.

### 3. Migrasi Data Existing

Karena kita mengubah enum `BerkasStatus`, data yang sudah ada perlu dimigrasi:

```sql
-- Berkas dengan status PROSES akan dipetakan berdasarkan kondisi
-- Jika berkas masih baru (belum ada history), set ke DI_OPERATOR_DATA_UKUR
-- Jika berkas sudah ada progress, review manual atau set ke status yang sesuai

UPDATE "Berkas"
SET status = 'DI_OPERATOR_DATA_UKUR'
WHERE status = 'PROSES';

-- Status SELESAI tetap SELESAI (sudah ada di enum baru)
-- Status DITUTUP tetap DITUTUP (sudah ada di enum baru)
```

### 4. Jalankan Migration

Jika Anda sudah yakin dengan migration file, jalankan:

```bash
npx prisma migrate deploy
```

Atau jika masih development:

```bash
npx prisma migrate dev
```

### 5. Generate Prisma Client

Setelah migration berhasil, generate ulang Prisma Client:

```bash
npx prisma generate
```

### 6. Restart Backend Server

Restart backend server untuk memuat perubahan:

```bash
# Kill existing server jika ada
# Kemudian start ulang
npm run start:dev
```

## Testing Migration

Setelah migration selesai, test dengan:

1. Check apakah enum BerkasStatus sudah terupdate:

   ```bash
   npx prisma studio
   ```

2. Test API endpoint untuk memastikan workflow berfungsi:
   - GET `/api/berkas/workflow/status/DI_OPERATOR_DATA_UKUR`
   - POST `/api/berkas` (create berkas baru dan cek statusnya otomatis jadi DI_OPERATOR_DATA_UKUR)

## Rollback (Jika Diperlukan)

Jika ada masalah dengan migration:

```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

Kemudian restore dari backup database jika diperlukan.

## Important Notes

1. **Backup Database**: Selalu backup database sebelum menjalankan migration di production
2. **Testing**: Test migration di development environment dulu
3. **Data Existing**: Pastikan data yang sudah ada dipetakan dengan benar ke status baru
4. **History**: Buat history record untuk data yang statusnya diubah saat migration

## Migration Checklist

- [ ] Backup database
- [ ] Generate migration file
- [ ] Review migration SQL
- [ ] Add data migration script jika perlu
- [ ] Test di development
- [ ] Jalankan migration
- [ ] Generate Prisma Client
- [ ] Restart server
- [ ] Test API endpoints
- [ ] Verify data berkas existing
- [ ] Update frontend untuk consume API baru
