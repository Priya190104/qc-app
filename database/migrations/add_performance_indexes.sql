-- Migration: Add Performance Indexes
-- Date: 2026-02-17
-- Description: Add composite indexes and full-text search for better query performance

-- Composite index for common filtering queries (status + created date)
CREATE INDEX IF NOT EXISTS "idx_berkas_status_created" ON "Berkas"("status", "createdAt" DESC);

-- Composite index for assigned petugas queries
CREATE INDEX IF NOT EXISTS "idx_berkas_petugas_ukur_status" ON "Berkas"("petugasUkurId", "status") WHERE "petugasUkurId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_berkas_petugas_pemetaan_status" ON "Berkas"("petugasPemetaanId", "status") WHERE "petugasPemetaanId" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_berkas_petugas_kks_status" ON "Berkas"("petugasKKSId", "status") WHERE "petugasKKSId" IS NOT NULL;

-- Composite index for location-based filtering (kecamatan + desa) 
CREATE INDEX IF NOT EXISTS "idx_berkas_location" ON "Berkas"("kecamatan", "desa");

-- Index for tahun berkas filtering
CREATE INDEX IF NOT EXISTS "idx_berkas_tahun" ON "Berkas"("tahunBerkas") WHERE "tahunBerkas" IS NOT NULL;

-- Full-text search index for nomor and namaPemohon (PostgreSQL specific)
-- This allows fast text search across multiple fields
CREATE INDEX IF NOT EXISTS "idx_berkas_search" ON "Berkas" USING GIN(
  to_tsvector('indonesian', COALESCE(nomor, '') || ' ' || COALESCE("namaPemohon", ''))
);

-- Index for audit logs query optimization
CREATE INDEX IF NOT EXISTS "idx_audit_user_date" ON "AuditLog"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "AuditLog"("entity", "entityId");

-- Index for berkas history queries
CREATE INDEX IF NOT EXISTS "idx_berkas_history_composite" ON "BerkasHistory"("berkasId", "changedAt" DESC);

-- Index for notification queries
CREATE INDEX IF NOT EXISTS "idx_notification_user_unread" ON "Notification"("userId", "isRead", "createdAt" DESC);

-- Index for closed berkas filtering
CREATE INDEX IF NOT EXISTS "idx_berkas_closed" ON "Berkas"("isClosed", "closedAt") WHERE "isClosed" = true;

-- Partial index for active berkas (most common query)
CREATE INDEX IF NOT EXISTS "idx_berkas_active" ON "Berkas"("status", "createdAt" DESC) WHERE "isClosed" = false;

-- Comments for documentation
COMMENT ON INDEX "idx_berkas_status_created" IS 'Optimize berkas listing by status with date sorting';
COMMENT ON INDEX "idx_berkas_search" IS 'Full-text search for nomor and nama pemohon';
COMMENT ON INDEX "idx_berkas_active" IS 'Partial index for active (non-closed) berkas only';
