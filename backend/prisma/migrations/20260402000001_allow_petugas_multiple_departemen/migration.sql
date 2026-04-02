-- DropIndex: Remove unique constraint on nip alone
DROP INDEX IF EXISTS "Petugas_nip_key";

-- CreateIndex: Add composite unique constraint on (nip, departemen)
-- This allows the same NIP to exist in multiple departments
CREATE UNIQUE INDEX "Petugas_nip_departemen_key" ON "Petugas"("nip", "departemen");
