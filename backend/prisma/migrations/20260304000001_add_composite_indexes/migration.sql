-- ================================================
-- Migration: Add composite indexes for performance
-- Date: 2026-03-04
-- ================================================

-- Composite index for most common berkas list query:
-- WHERE isClosed = false AND status = ? ORDER BY createdAt DESC
CREATE INDEX "Berkas_isClosed_status_createdAt_idx" 
  ON "Berkas"("isClosed", "status", "createdAt" DESC);

-- Composite index for base berkas list (no status filter):
-- WHERE isClosed = false ORDER BY createdAt DESC
CREATE INDEX "Berkas_isClosed_createdAt_idx" 
  ON "Berkas"("isClosed", "createdAt" DESC);

-- Composite index for AuditLog entity-based queries and archiving:
-- WHERE entity = ? ORDER BY createdAt DESC
CREATE INDEX "AuditLog_entity_createdAt_idx" 
  ON "AuditLog"("entity", "createdAt" DESC);
