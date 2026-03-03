# DATABASE SCHEMA DOCUMENTATION

## Overview

Database menggunakan PostgreSQL dengan UUID sebagai primary key untuk semua tabel. Berikut adalah schema lengkap beserta relationships dan constraints.

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────┐
│      users           │
├──────────────────────┤
│ id (UUID, PK)        │
│ email (VARCHAR)      │
│ password (VARCHAR)   │
│ firstName (VARCHAR)  │
│ lastName (VARCHAR)   │
│ isActive (BOOLEAN)   │
│ createdAt (TIMESTAMP)│
│ updatedAt (TIMESTAMP)│
└──────────────────────┘
         │
         │(1:M)
         ▼
┌──────────────────────┐
│  user_roles (JT)     │
├──────────────────────┤
│ userId (UUID, FK)    │
│ roleId (UUID, FK)    │
│ assignedAt (TIMESTAMP)
│ PRIMARY KEY(userId,  │
│   roleId)            │
└──────────────────────┘
         │
         │(M:1)
         │
┌──────────────────────┐
│      roles           │
├──────────────────────┤
│ id (UUID, PK)        │
│ name (VARCHAR)       │
│ description (TEXT)   │
│ permissions (JSON)   │
│ isActive (BOOLEAN)   │
│ createdAt (TIMESTAMP)│
│ updatedAt (TIMESTAMP)│
└──────────────────────┘


┌──────────────────────┐
│     berkas           │
├──────────────────────┤
│ id (UUID, PK)        │
│ nama (VARCHAR)       │
│ nomor (VARCHAR)      │
│ status (VARCHAR)     │
│ deskripsi (TEXT)     │
│ filePath (VARCHAR)   │
│ petugasId (UUID, FK) │
│ createdBy (UUID, FK) │
│ createdAt (TIMESTAMP)│
│ updatedAt (TIMESTAMP)│
└──────────────────────┘
         │
         │(1:M)
         ▼
┌──────────────────────────┐
│  berkas_history          │
├──────────────────────────┤
│ id (UUID, PK)            │
│ berkasId (UUID, FK)      │
│ oldStatus (VARCHAR)      │
│ newStatus (VARCHAR)      │
│ oldAssignee (UUID)       │
│ newAssignee (UUID)       │
│ changedBy (UUID, FK)     │
│ reason (TEXT)            │
│ changedAt (TIMESTAMP)    │
└──────────────────────────┘
         │
         │
┌────────┴─────────┐
│                  │
▼                  ▼
users          petugas
│
│(1:M)
│
┌──────────────────────┐
│      petugas         │
├──────────────────────┤
│ id (UUID, PK)        │
│ nama (VARCHAR)       │
│ nip (VARCHAR)        │
│ jabatan (VARCHAR)    │
│ departemen (VARCHAR) │
│ userId (UUID, FK)    │
│ isActive (BOOLEAN)   │
│ createdAt (TIMESTAMP)│
│ updatedAt (TIMESTAMP)│
└──────────────────────┘


┌──────────────────────┐
│   notifications      │
├──────────────────────┤
│ id (UUID, PK)        │
│ userId (UUID, FK)    │
│ type (VARCHAR)       │
│ title (VARCHAR)      │
│ message (TEXT)       │
│ data (JSON)          │
│ isRead (BOOLEAN)     │
│ createdAt (TIMESTAMP)│
└──────────────────────┘


┌──────────────────────┐
│    audit_logs        │
├──────────────────────┤
│ id (UUID, PK)        │
│ userId (UUID, FK)    │
│ action (VARCHAR)     │
│ entity (VARCHAR)     │
│ entityId (UUID)      │
│ oldValues (JSON)     │
│ newValues (JSON)     │
│ ipAddress (VARCHAR)  │
│ userAgent (TEXT)     │
│ createdAt (TIMESTAMP)│
└──────────────────────┘
```

---

## Tabel Detail

### 1. users

Menyimpan informasi user/akun aplikasi.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  phoneNumber VARCHAR(20),
  isActive BOOLEAN DEFAULT true,
  lastLoginAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_isActive ON users(isActive);
CREATE INDEX idx_users_createdAt ON users(createdAt DESC);
```

**Kolom:**
- `id`: UUID primary key, auto-generated
- `email`: Unique email address, required
- `password`: Hashed password (bcryptjs), required
- `firstName`: First name, required
- `lastName`: Last name, required
- `phoneNumber`: Contact number, optional
- `isActive`: User status (soft delete via flag)
- `lastLoginAt`: Timestamp of last login
- `createdAt`: Timestamp when created
- `updatedAt`: Timestamp when last updated

**Indexes:**
- `email`: Untuk login query
- `isActive`: Untuk filter active users
- `createdAt`: Untuk sorting

---

### 2. roles

Menyimpan definisi role dalam sistem.

```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_isActive ON roles(isActive);
```

**Kolom:**
- `id`: UUID primary key
- `name`: Role name (Admin, Staff, Viewer, etc.)
- `description`: Deskripsi role
- `permissions`: Array of permissions (JSON format)
  ```json
  {
    "permissions": [
      "berkas.read",
      "berkas.create",
      "berkas.update",
      "berkas.delete",
      "users.read",
      "users.create",
      "users.update",
      "users.delete"
    ]
  }
  ```
- `isActive`: Role status
- `createdAt`, `updatedAt`: Timestamps

**Indexes:**
- `name`: Untuk lookup role by name
- `isActive`: Untuk filter active roles

---

### 3. user_roles

Join table untuk many-to-many relationship antara users dan roles.

```sql
CREATE TABLE user_roles (
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roleId UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (userId, roleId),
  
  CONSTRAINT fk_user_roles_userId FOREIGN KEY (userId) 
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_roleId FOREIGN KEY (roleId) 
    REFERENCES roles(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_user_roles_userId ON user_roles(userId);
CREATE INDEX idx_user_roles_roleId ON user_roles(roleId);
```

**Kolom:**
- `userId`: Foreign key ke users
- `roleId`: Foreign key ke roles
- `assignedAt`: Kapan role di-assign
- Primary key adalah kombinasi (userId, roleId)

---

### 4. berkas

Menyimpan data dokumen/berkas yang dikelola sistem.

```sql
CREATE TABLE berkas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  nomor VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_review, approved, rejected
  deskripsi TEXT,
  filePath VARCHAR(500),
  fileSize BIGINT,
  fileType VARCHAR(50),
  petugasId UUID REFERENCES petugas(id) ON DELETE SET NULL,
  createdBy UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approvedBy UUID REFERENCES users(id) ON DELETE SET NULL,
  rejectedReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_status CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'archived'))
);

-- Indexes
CREATE INDEX idx_berkas_status ON berkas(status);
CREATE INDEX idx_berkas_petugasId ON berkas(petugasId);
CREATE INDEX idx_berkas_createdBy ON berkas(createdBy);
CREATE INDEX idx_berkas_createdAt ON berkas(createdAt DESC);
CREATE INDEX idx_berkas_nomor ON berkas(nomor);
```

**Kolom:**
- `id`: UUID primary key
- `nama`: Nama dokumen
- `nomor`: Nomor dokumen (unique)
- `status`: Status dokumen (pending, in_review, approved, rejected, archived)
- `deskripsi`: Deskripsi dokumen
- `filePath`: Path ke file di storage
- `fileSize`: Ukuran file dalam bytes
- `fileType`: Tipe file (pdf, xlsx, csv, etc.)
- `petugasId`: Assigned petugas yang menangani
- `createdBy`: User yang membuat dokumen
- `approvedBy`: User yang approve (jika approved)
- `rejectedReason`: Alasan rejection (jika rejected)
- `createdAt`, `updatedAt`: Timestamps

**Status Flow:**
```
pending → in_review → approved/rejected → (archived)
```

---

### 5. berkas_history

Audit trail untuk perubahan status dan assignment berkas.

```sql
CREATE TABLE berkas_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  berkasId UUID NOT NULL REFERENCES berkas(id) ON DELETE CASCADE,
  oldStatus VARCHAR(50),
  newStatus VARCHAR(50),
  oldAssignee UUID,
  newAssignee UUID,
  changedBy UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT,
  changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_berkas_history_berkasId FOREIGN KEY (berkasId)
    REFERENCES berkas(id) ON DELETE CASCADE,
  CONSTRAINT fk_berkas_history_changedBy FOREIGN KEY (changedBy)
    REFERENCES users(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_berkas_history_berkasId ON berkas_history(berkasId);
CREATE INDEX idx_berkas_history_changedBy ON berkas_history(changedBy);
CREATE INDEX idx_berkas_history_changedAt ON berkas_history(changedAt DESC);
```

**Kolom:**
- `id`: UUID primary key
- `berkasId`: Foreign key ke berkas
- `oldStatus`: Status sebelumnya
- `newStatus`: Status baru
- `oldAssignee`: Petugas sebelumnya
- `newAssignee`: Petugas yang ditugaskan
- `changedBy`: User yang melakukan perubahan
- `reason`: Alasan perubahan
- `changedAt`: Timestamp perubahan

---

### 6. petugas

Menyimpan data petugas/staff yang menangani berkas.

```sql
CREATE TABLE petugas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama VARCHAR(255) NOT NULL,
  nip VARCHAR(50) UNIQUE NOT NULL,
  jabatan VARCHAR(100),
  departemen VARCHAR(100),
  userId UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  phoneNumber VARCHAR(20),
  email VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_petugas_userId FOREIGN KEY (userId)
    REFERENCES users(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_petugas_nip ON petugas(nip);
CREATE INDEX idx_petugas_userId ON petugas(userId);
CREATE INDEX idx_petugas_isActive ON petugas(isActive);
```

**Kolom:**
- `id`: UUID primary key
- `nama`: Nama lengkap petugas
- `nip`: Nomor Induk Pegawai (unique)
- `jabatan`: Jabatan/posisi
- `departemen`: Departemen
- `userId`: Reference ke users (one-to-one)
- `phoneNumber`: Nomor telepon
- `email`: Email petugas
- `isActive`: Status aktif
- `createdAt`, `updatedAt`: Timestamps

---

### 7. notifications

Menyimpan notifikasi sistem untuk users.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- status_change, assignment, system_alert
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB, -- Tambahan data (berkasId, oldStatus, newStatus, etc.)
  isRead BOOLEAN DEFAULT false,
  readAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_notifications_userId FOREIGN KEY (userId)
    REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_notifications_userId ON notifications(userId);
CREATE INDEX idx_notifications_isRead ON notifications(isRead);
CREATE INDEX idx_notifications_createdAt ON notifications(createdAt DESC);
CREATE INDEX idx_notifications_userId_isRead ON notifications(userId, isRead);
```

**Kolom:**
- `id`: UUID primary key
- `userId`: User penerima notifikasi
- `type`: Tipe notifikasi (status_change, assignment, system_alert)
- `title`: Judul notifikasi
- `message`: Pesan notifikasi
- `data`: Data JSON tambahan
  ```json
  {
    "berkasId": "uuid",
    "oldStatus": "pending",
    "newStatus": "approved",
    "affectedEntity": "berkas"
  }
  ```
- `isRead`: Status baca
- `readAt`: Kapan dibaca
- `createdAt`: Timestamp pembuatan

**Data Example:**
```json
{
  "berkasId": "550e8400-e29b-41d4-a716-446655440000",
  "berkasNama": "Document ABC",
  "oldStatus": "pending",
  "newStatus": "approved",
  "changedBy": "Admin User"
}
```

---

### 8. audit_logs

Comprehensive audit trail untuk semua aktivitas penting.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(100) NOT NULL, -- CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
  entity VARCHAR(50) NOT NULL, -- users, berkas, petugas, roles
  entityId UUID,
  oldValues JSONB,
  newValues JSONB,
  description TEXT,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  statusCode INTEGER,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_logs_userId FOREIGN KEY (userId)
    REFERENCES users(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_audit_logs_userId ON audit_logs(userId);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX idx_audit_logs_createdAt ON audit_logs(createdAt DESC);
CREATE INDEX idx_audit_logs_entityId ON audit_logs(entityId);
```

**Kolom:**
- `id`: UUID primary key
- `userId`: User yang melakukan aksi
- `action`: Tipe aksi (CREATE, UPDATE, DELETE, LOGIN, etc.)
- `entity`: Entity yang diakses (users, berkas, petugas)
- `entityId`: ID entity yang diakses
- `oldValues`: Nilai lama (untuk UPDATE)
- `newValues`: Nilai baru (untuk CREATE/UPDATE)
- `description`: Deskripsi detail
- `ipAddress`: IP address user
- `userAgent`: Browser user agent
- `statusCode`: HTTP status code dari aksi
- `createdAt`: Timestamp aksi

**Audit Log Example:**
```json
{
  "userId": "user-uuid",
  "action": "UPDATE",
  "entity": "berkas",
  "entityId": "berkas-uuid",
  "oldValues": {
    "status": "pending",
    "petugasId": "petugas1"
  },
  "newValues": {
    "status": "approved",
    "petugasId": "petugas2"
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

---

## Relationships Summary

| Tabel | Relasi | Tabel Tujuan | Tipe |
|-------|--------|--------------|------|
| users | ← | user_roles | 1:M |
| users | ← | berkas (createdBy) | 1:M |
| users | ← | berkas (approvedBy) | 1:M |
| users | ← | petugas (userId) | 1:1 |
| users | ← | notifications | 1:M |
| users | ← | audit_logs | 1:M |
| roles | ← | user_roles | M:M |
| petugas | ← | berkas | 1:M |
| berkas | ← | berkas_history | 1:M |

---

## Constraints & Rules

### Unique Constraints
- `users.email` - Email harus unik
- `roles.name` - Nama role harus unik
- `berkas.nomor` - Nomor berkas harus unik
- `petugas.nip` - NIP harus unik
- `petugas.userId` - Setiap petugas hanya bisa 1 user

### Foreign Key Constraints
- `ON DELETE CASCADE` - Ketika parent dihapus, child juga dihapus
- `ON DELETE RESTRICT` - Tidak boleh menghapus jika ada referensi
- `ON DELETE SET NULL` - Set ke NULL jika parent dihapus

### Check Constraints
- `berkas.status` - Hanya nilai tertentu yang diizinkan

---

## Indexes Summary

| Tabel | Kolom | Alasan |
|-------|-------|--------|
| users | email | Login query |
| users | isActive | Filter active users |
| users | createdAt | Sorting/pagination |
| roles | name | Lookup by name |
| berkas | status | Filter by status |
| berkas | petugasId | Find assigned berkas |
| berkas | createdAt | Recent berkas |
| berkas_history | berkasId | History tracking |
| berkas_history | createdAt | Time-based queries |
| notifications | userId, isRead | Unread notifications |
| audit_logs | userId | User activity |
| audit_logs | createdAt | Recent activities |

---

## Migration Strategy

### Initial Migration
1. Create all tables dengan constraints
2. Create indexes
3. Create default roles

### Subsequent Migrations
```sql
-- Example: Add new column
ALTER TABLE berkas ADD COLUMN priority VARCHAR(50) DEFAULT 'medium';

-- Example: Add new table
CREATE TABLE berkas_attachments (
  id UUID PRIMARY KEY,
  berkasId UUID REFERENCES berkas(id),
  filePath VARCHAR(500),
  createdAt TIMESTAMP
);
```

---

## Backup & Recovery

**Regular Backups:**
```bash
pg_dump sistem_qc_berkas > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore:**
```bash
psql sistem_qc_berkas < backup_file.sql
```

---

## Performance Optimization

1. **Connection Pooling**
   - Min 5, Max 20 connections
   - Idle timeout 30 seconds

2. **Query Optimization**
   - Gunakan prepared statements
   - Limit pagination ke 50 records
   - Avoid N+1 queries

3. **Caching**
   - Cache roles & permissions
   - Cache user sessions
   - Cache frequently accessed data

4. **Monitoring**
   - Monitor slow queries (> 1s)
   - Monitor connection usage
   - Monitor disk space

---

## Rollback Procedures

Jika ada yang salah dengan migration:

```bash
# Rollback last migration (Prisma)
npx prisma migrate resolve --rolled-back migration_name

# Manual SQL rollback
BEGIN;
-- Undo changes
ROLLBACK;
```

---

## Notes

- Semua primary keys menggunakan UUID untuk distributed systems
- Semua timestamp menggunakan UTC timezone
- Soft delete dapat diimplementasikan dengan flag `isActive` jika perlu
- JSONB digunakan untuk flexible data storage (permissions, metadata)
- Audit logging wajib untuk compliance & troubleshooting
