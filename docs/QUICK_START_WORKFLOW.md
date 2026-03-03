# Quick Start Guide - Workflow Berkas

## 🎯 Tujuan

Panduan cepat untuk menjalankan sistem workflow berkas yang baru.

## ⚠️ Prerequisites

- PostgreSQL database running
- Node.js 18+ installed
- Backend dan frontend dependencies sudah terinstall

---

## 📋 Langkah-Langkah

### Step 1: Database Migration

```bash
# Masuk ke folder backend
cd backend

# Generate migration file
npx prisma migrate dev --name update_workflow_status

# Generate Prisma Client
npx prisma generate
```

**Expected Output:**

```
✔ Prisma Migrate applied the migrations
✔ Generated Prisma Client
```

### Step 2: Migrasi Data Existing (Jika Ada)

Jika ada data berkas dengan status lama (`PROSES`), update ke status baru:

```bash
# Buka Prisma Studio
npx prisma studio

# Atau jalankan SQL query manual:
# UPDATE "Berkas" SET status = 'DI_OPERATOR_DATA_UKUR' WHERE status = 'PROSES';
```

### Step 3: Restart Backend Server

```bash
# Masih di folder backend

# Stop server yang running (Ctrl+C)

# Start server
npm run start:dev
```

**Check Backend Ready:**

- Server running di http://localhost:3001
- Tidak ada error di console
- API endpoints accessible

### Step 4: Test API Endpoints

Gunakan Thunder Client / Postman untuk test:

1. **Create Berkas Baru**

   ```
   POST http://localhost:3001/api/berkas
   Authorization: Bearer <your-token>
   Body: {
     "nomor": "TEST-001",
     "nama": "Berkas Test",
     "namaPemohon": "John Doe"
   }
   ```

   ✅ Expected: Berkas dibuat dengan status `DI_OPERATOR_DATA_UKUR`

2. **Get Berkas by Status**

   ```
   GET http://localhost:3001/api/berkas/workflow/status/DI_OPERATOR_DATA_UKUR
   Authorization: Bearer <your-token>
   ```

   ✅ Expected: List berkas dengan status tersebut

3. **Update Data Ukur**

   ```
   PUT http://localhost:3001/api/berkas/workflow/{berkasId}/operator-ukur/update
   Authorization: Bearer <your-token>
   Body: {
     "noSTP": "STP-001",
     "tglSTP": "2026-02-13",
     "namaPemohon": "John Doe Updated"
   }
   ```

   ✅ Expected: Data berkas updated

4. **Lanjutkan ke Petugas Ukur**

   ```
   POST http://localhost:3001/api/berkas/workflow/{berkasId}/operator-ukur/lanjutkan
   Authorization: Bearer <your-token>
   ```

   ✅ Expected: Status berubah ke `DI_PETUGAS_UKUR`

### Step 5: Create Master Data Petugas

Sebelum test workflow lengkap, pastikan ada data petugas:

```bash
# Via Prisma Studio atau API
POST http://localhost:3001/api/petugas
Body: {
  "nama": "Petugas Ukur 1",
  "nip": "123456789",
  "jabatan": "Petugas Ukur",
  "departemen": "Pengukuran"
}
```

### Step 6: Test Full Workflow

Ikuti flow lengkap:

1. **Operator Data Berkas** - Create berkas ✅
2. **Operator Data Ukur** - Update data ukur & lanjutkan
3. **Petugas Ukur** - Validasi pengukuran dengan assign petugas
4. **Operator Data Pemetaan** - Update data pemetaan & lanjutkan
5. **Petugas Pemetaan** - Validasi pemetaan
6. **Operator Data Berkas** - Assign KKS
7. **KKS** - ACC atau Revisi
8. **Kepala Seksi** - ACC atau Revisi
9. **Selesai** ✅

### Step 7: Frontend Development (Optional)

Jika ingin mulai develop frontend pages:

```bash
cd frontend
npm run dev
```

Lihat contoh implementasi halaman di:

- `docs/IMPLEMENTATION_SUMMARY.md` - List halaman yang perlu dibuat
- `frontend/src/lib/workflow-api.ts` - API functions yang siap pakai
- `frontend/src/types/index.ts` - Types yang sudah defined

---

## 🧪 Testing Checklist

### Backend Tests

- [ ] Berkas baru dibuat otomatis jadi status `DI_OPERATOR_DATA_UKUR`
- [ ] Operator Data Ukur bisa update dan lanjutkan berkas
- [ ] Petugas Ukur bisa validasi dan berkas pindah ke pemetaan
- [ ] Operator Data Pemetaan bisa update dan lanjutkan
- [ ] Petugas Pemetaan bisa validasi dan berkas ke `PEMILIHAN_KKS`
- [ ] Operator bisa assign KKS
- [ ] KKS bisa ACC (ke Kepala Seksi) atau Revisi (ke tahap sebelumnya)
- [ ] Kepala Seksi bisa ACC (ke Selesai) atau Revisi
- [ ] History tercatat dengan benar

### Revision Flow Tests

- [ ] KKS bisa revisi ke 4 tahap (Operator Data Ukur, Petugas Ukur, Operator Data Pemetaan, Petugas Pemetaan)
- [ ] Kepala Seksi bisa revisi ke 5 tahap (termasuk KKS)
- [ ] Revision count increment dengan benar
- [ ] Revision reason tersimpan
- [ ] LastRevisionFrom tercatat

### Edge Cases

- [ ] Invalid status transition ditolak
- [ ] Validation errors handled dengan baik
- [ ] Berkas not found handled
- [ ] Unauthorized access blocked

---

## 🐛 Troubleshooting

### Migration Error

```
Error: Migration failed
```

**Solution:**

1. Check database connection
2. Backup database dulu
3. Drop database dan recreate (dev only!)
4. Run migration ulang

### Prisma Client Error

```
Error: Cannot find module '@prisma/client'
```

**Solution:**

```bash
cd backend
npx prisma generate
```

### API 401 Unauthorized

**Solution:**

1. Login dulu untuk dapat token
2. Set Bearer token di header
3. Check token expiry

### API 400 Bad Request

**Solution:**

1. Check request body sesuai DTO
2. Check required fields sudah diisi
3. Check data types (Date, Number, String)

### Berkas Tidak Muncul di List

**Solution:**

1. Check status berkas di database
2. Pastikan query menggunakan status yang benar
3. Check include relations di query

---

## 📚 Resources

- **Workflow Documentation**: `docs/WORKFLOW_BERKAS.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Migration Guide**: `docs/MIGRATION_WORKFLOW.md`
- **API Documentation**: `docs/API_ENDPOINTS.md` (jika ada)

---

## 🎉 Success Indicators

Anda berhasil jika:

1. ✅ Migration berhasil tanpa error
2. ✅ Backend server running tanpa error
3. ✅ Berkas baru otomatis status `DI_OPERATOR_DATA_UKUR`
4. ✅ Bisa transition berkas dari satu status ke status berikutnya
5. ✅ Revision flow berfungsi (KKS & Kepala Seksi)
6. ✅ History tercatat dengan lengkap

---

## 💡 Tips

1. **Gunakan Prisma Studio** untuk inspect database real-time:

   ```bash
   cd backend
   npx prisma studio
   ```

2. **Check API Response** di Network tab browser DevTools

3. **Enable Debug Mode** di backend untuk detailed logs (jika ada)

4. **Test dengan Postman** sebelum implement di frontend

5. **Commit Changes** secara berkala:
   ```bash
   git add .
   git commit -m "feat: implement workflow berkas system"
   ```

---

## 🚀 Next Steps

Setelah workflow backend berfungsi:

1. Buat frontend pages untuk setiap role
2. Implement revision modal
3. Add notifications
4. Add dashboard charts
5. Add reporting features

---

**Happy Coding! 🎊**
