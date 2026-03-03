# 🧪 TESTING GUIDE - MANAJEMEN AKUN

## SETUP TESTING ENVIRONMENT

### Prerequisites
1. ✅ Backend running di `http://localhost:3001`
2. ✅ Frontend running di `http://localhost:3000`
3. ✅ PostgreSQL database running
4. ✅ Sudah login dengan user yang punya permission manage users

### Test Data Setup
Pastikan ada sample data di database:
- Minimal 2 users di tabel User
- Minimal 3 roles di tabel Role
- UserRole relationship sudah tersetting

---

## 🧪 TEST CASE 1: LOAD & TAMPIL DATA USER

**Test:** Data user dimuat saat halaman pertama kali dibuka

### Steps:
1. Buka browser, navigate ke `http://localhost:3000/akun`
2. Tunggu loading selesai (⌛ disappear)
3. Lihat tabel user

### Expected Results:
- ✅ Loading spinner muncul lalu hilang
- ✅ Tabel user tampil dengan data
- ✅ Setiap row menampilkan: Nama, Email, Role (badge), Status (badge), Aksi (buttons)
- ✅ Role badge menampilkan nama role dengan warna sesuai role type
- ✅ Status badge: "Aktif" (green) atau "Tidak Aktif" (red)
- ✅ Tidak ada error di console
- ✅ Browser network tab: GET /users → 200 OK

### Debugging:
```
- Check Network tab di DevTools
  → GET /users should return { data: [...], pagination: {...} }
- Check Console
  → Should not have fetch errors
- Check Elements
  → Table tbody should have tr elements for each user
```

---

## 🧪 TEST CASE 2: TAMBAH USER

**Test:** Menambah user baru via modal form

### Steps:
1. Klik tombol "+ Tambah User" di header
2. Modal "Tambah User Baru" muncul
3. Isi form:
   - Nama Depan: "Agus"
   - Nama Belakang: "Wijaya"
   - Email: "agus@example.com"
   - Password: "SecurePass123"
   - No Telepon: "081234567890"
   - Role: Pilih "Operator Data Berkas"
   - Status: Aktif (checked)
4. Klik "Simpan"
5. Modal hilang, tabel ter-refresh
6. Lihat user baru di tabel

### Expected Results:
- ✅ Modal muncul dengan form kosong
- ✅ Email field bisa di-input
- ✅ Role dropdown menampilkan semua roles
- ✅ Validasi: Jika kosongkan required field → error message
- ✅ Validasi: Password < 8 chars → error
- ✅ POST /users → 201 Created
- ✅ Modal close otomatis setelah success
- ✅ Tabel refresh otomatis
- ✅ User baru tampil di tabel dengan role badge yang benar
- ✅ Status user sesuai checkbox (Aktif/Tidak Aktif)
- ✅ Tidak ada error di console

### Debugging:
```
- Check Network tab
  → POST /users should return new user data
  → Check request payload match DTO format
- Check Console
  → Should not have validation errors
- Check Database (Prisma Studio)
  → User tabel harus ada entry baru
  → UserRole tabel harus ada junction record
```

---

## 🧪 TEST CASE 3: VALIDASI FORM TAMBAH USER

**Test:** Form validasi input sebelum submit

### Test Cases:
1. **Empty Name Fields**
   - Kosongkan "Nama Depan" → Klik Simpan
   - Expected: Error "Nama depan harus diisi"

2. **Invalid Email**
   - Email: "bukan-email" → Klik Simpan
   - Expected: Error "Email harus valid" atau form tidak submit

3. **Short Password**
   - Password: "short" → Klik Simpan
   - Expected: Error "Password minimal 8 karakter"

4. **No Role Selected**
   - Kosongkan role selection → Klik Simpan
   - Expected: Error "Minimal pilih satu role"

5. **Duplicate Email**
   - Email: existing_email@example.com → Klik Simpan
   - Expected: Error "Email sudah terdaftar"

### Expected Results:
- ✅ Setiap validasi error ditampilkan
- ✅ Form tidak submit jika ada error
- ✅ Error message jelas dan membantu

---

## 🧪 TEST CASE 4: EDIT USER

**Test:** Edit user via modal

### Steps:
1. Klik tombol Edit (pensil) pada user di tabel
2. Modal "Edit User" muncul dengan data terisi
3. Ubah data:
   - Nama Belakang: "Updated Name"
   - No Telepon: "081111111111"
   - Role: Tambah role kedua (multi-select)
4. Klik "Simpan"
5. Modal hilang, tabel ter-refresh
6. Lihat perubahan user di tabel

### Expected Results:
- ✅ Modal muncul dengan title "Edit User"
- ✅ Form field pre-populated dengan user data lama
- ✅ Email field disabled (tidak bisa diubah)
- ✅ Password field opsional (label: "Kosongkan jika tidak ingin ubah")
- ✅ Bisa multi-select role dengan Ctrl/Cmd+Click
- ✅ PATCH /users/{id} → 200 OK
- ✅ Modal close otomatis
- ✅ Tabel refresh otomatis
- ✅ Perubahan terlihat di tabel (role badge terupdate)
- ✅ Tidak ada error di console

### Debugging:
```
- Check Network tab
  → PATCH /users/{id} should send updated data
  → Verify password excluded if empty
  → Verify email not in payload
- Check Console
  → Should not have errors
- Check Database
  → User record updated
  → UserRole junction records updated (old roles deleted, new added)
```

---

## 🧪 TEST CASE 5: HAPUS USER

**Test:** Hapus user dengan konfirmasi

### Steps:
1. Klik tombol Hapus (trash) pada user di tabel
2. Modal "Hapus User?" muncul dengan konfirmasi
3. Lihat nama user ditampilkan
4. Klik tombol "Hapus"
5. Modal hilang, tabel ter-refresh
6. User hilang dari tabel

### Expected Results:
- ✅ Modal konfirmasi muncul
- ✅ Menampilkan nama user yang akan dihapus
- ✅ Warning message: "Tindakan ini tidak dapat dibatalkan"
- ✅ Button "Batal" → close modal tanpa hapus
- ✅ Button "Hapus" → DELETE /users/{id} → 200 OK
- ✅ Modal close otomatis setelah sukses
- ✅ Tabel refresh otomatis
- ✅ User hilang dari tabel
- ✅ Tidak ada error di console
- ✅ Tidak ada orphan data (UserRole junction records juga terhapus)

### Debugging:
```
- Check Network tab
  → DELETE /users/{id} should return { message: "User deleted successfully" }
- Check Console
  → Should not have errors
- Check Database
  → User record deleted from User table
  → Related UserRole records deleted (cascade)
  → No foreign key constraint violation
```

---

## 🧪 TEST CASE 6: CANCEL OPERATIONS

**Test:** Cancel button works properly

### Test Cases:
1. **Cancel Add User**
   - Klik "+ Tambah User"
   - Isi beberapa field
   - Klik "Batal"
   - Expected: Modal close, data tidak disimpan

2. **Cancel Edit User**
   - Klik Edit pada user
   - Ubah data
   - Klik "Batal"
   - Expected: Modal close, data tidak ter-update

3. **Cancel Delete User**
   - Klik Hapus pada user
   - Klik "Batal" di confirmation modal
   - Expected: Modal close, user tidak terhapus

### Expected Results:
- ✅ Semua cancel buttons bekerja
- ✅ Modal close tanpa API call
- ✅ Data tidak berubah di tabel
- ✅ Tidak ada error di console

---

## 🧪 TEST CASE 7: ERROR HANDLING

**Test:** Aplikasi handle error dengan graceful

### Simulate Error Scenarios:
1. **Network Error (Disconnect Network)**
   - Buka halaman akun
   - Matikan internet
   - Klik "Tambah User"
   - Expected: Error message displayed

2. **API Error (Invalid Token)**
   - Clear localStorage (delete JWT token)
   - Reload halaman
   - Expected: Redirect to login

3. **Server Error (500)**
   - Klik "Tambah User" dengan invalid role ID
   - Expected: Error message from server displayed

4. **Validation Error (Backend)**
   - Coba dengan duplicate email
   - Expected: Error message "Email sudah terdaftar"

### Expected Results:
- ✅ Error message ditampilkan dalam modal atau alert
- ✅ Message jelas dan user-friendly
- ✅ Console menampilkan error untuk debugging
- ✅ Aplikasi tidak crash
- ✅ User bisa coba lagi atau cancel

---

## 🧪 TEST CASE 8: UI/UX RESPONSIVENESS

**Test:** UI responsive dan smooth

### Test Cases:
1. **Form Responsiveness**
   - Resize browser window
   - Test pada mobile (375px), tablet (768px), desktop (1024px)
   - Expected: Modal tetap centered dan readable

2. **Loading States**
   - Klik "Simpan" dan observasi button state
   - Expected: Button disabled, text "Menyimpan..." saat loading

3. **Hover States**
   - Hover pada edit/delete buttons
   - Hover pada role badges
   - Expected: Visual feedback (color change, cursor pointer)

4. **Transitions**
   - Open/close modal
   - Expected: Smooth fade animation

### Expected Results:
- ✅ UI responsive pada berbagai ukuran layar
- ✅ Loading states jelas
- ✅ Hover/focus states visible
- ✅ Smooth transitions
- ✅ Tidak ada layout shift

---

## 🧪 TEST CASE 9: PERFORMANCE

**Test:** Aplikasi responsive dan cepat

### Test Cases:
1. **Page Load Time**
   - Open DevTools Network tab
   - Navigate to /akun
   - Expected: Network requests selesai dalam < 2 detik

2. **Data Fetch Time**
   - Network slow 3G di DevTools
   - Load halaman
   - Expected: Loading spinner muncul sebentar, data tampil

3. **No Duplicate Requests**
   - Open Network tab
   - Load halaman
   - Expected: GET /users called 1x, GET /roles called 1x
   - Not multiple calls

4. **No Memory Leaks**
   - Open halaman, create/edit/delete beberapa user
   - Open DevTools > Memory > Take snapshot sebelum & sesudah
   - Expected: Memory tidak terus meningkat drastis

### Expected Results:
- ✅ Halaman load cepat
- ✅ No unnecessary API calls
- ✅ No memory leaks
- ✅ Responsive pada slow network

---

## 🧪 TEST CASE 10: PERMISSIONS & AUTHORIZATION

**Test:** Hanya authorized user yang bisa manage users

### Test Cases:
1. **Admin User** (Administrator role)
   - Login dengan admin account
   - Expected: Bisa akses /akun, lihat semua users, CRUD operations

2. **Operator User** (Non-admin role)
   - Login dengan operator account
   - Navigate ke /akun
   - Expected: Jika tidak punya permission:
     - Halaman error atau redirect
     - Button "Tambah User" disabled atau hidden
     - Edit/Delete buttons disabled atau hidden

### Expected Results:
- ✅ Authorization check di frontend (hide/disable UI)
- ✅ Authorization check di backend (403 Forbidden if unauthorized)
- ✅ Consistent permission handling

---

## 📊 TEST SUMMARY CHECKLIST

### Sebelum Test:
- [ ] Backend running
- [ ] Frontend running
- [ ] Database has test data
- [ ] Logged in as authorized user
- [ ] DevTools open (Network + Console tabs)

### Core Functionality:
- [ ] Load data user
- [ ] Tambah user
- [ ] Edit user
- [ ] Hapus user
- [ ] Modal open/close
- [ ] Form validation
- [ ] Error handling

### Integrations:
- [ ] API calls correct (method, URL, payload)
- [ ] Response format correct
- [ ] Data refresh otomatis
- [ ] No hardcoded data
- [ ] No console errors

### UI/UX:
- [ ] Responsive layout
- [ ] Loading states
- [ ] Hover/focus states
- [ ] Transitions smooth
- [ ] Messages clear

### Performance:
- [ ] Page load < 2s
- [ ] No duplicate requests
- [ ] No memory leaks
- [ ] Responsive on slow network

### Security:
- [ ] Authorization enforced
- [ ] Input validated
- [ ] Errors handled gracefully
- [ ] No sensitive data in console

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: "Data tidak tampil di tabel"
**Solution:**
1. Check Network tab → GET /users response format
2. Verify API endpoint returns { data: [...] }
3. Check Console untuk fetch errors
4. Verify JWT token valid

### Issue: "Modal tidak muncul saat klik Tambah User"
**Solution:**
1. Check React DevTools → showUserModal state
2. Verify UserModal component imported
3. Check Console untuk errors

### Issue: "Roles tidak muncul di dropdown"
**Solution:**
1. Check GET /roles API call
2. Verify roles data loaded in state
3. Check select element options

### Issue: "Error saat submit form"
**Solution:**
1. Check Network tab → POST/PATCH request payload
2. Verify DTO format matches backend expectations
3. Check response error message
4. Verify validations passed

### Issue: "User tidak ter-delete"
**Solution:**
1. Check Network tab → DELETE request
2. Verify DELETE /users/{id} returned 200
3. Check database untuk UserRole cascade delete
4. Verify tabel refresh triggered

---

## 📝 NOTES

- Semua API calls protected dengan JWT
- Frontend harus handle 401 Unauthorized (redirect to login)
- Backend return informative error messages
- Database constraints enforce data integrity
- No destructive operations without confirmation

---

**Status:** Ready for QA Testing ✅
