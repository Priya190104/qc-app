/*
  Warnings:

  - The values [PROSES] on the enum `BerkasStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BerkasStatus_new" AS ENUM ('DIBUAT', 'DI_OPERATOR_DATA_UKUR', 'DI_PETUGAS_UKUR', 'DI_OPERATOR_DATA_PEMETAAN', 'DI_PETUGAS_PEMETAAN', 'PEMILIHAN_KKS', 'DI_KKS', 'DI_KEPALA_SEKSI', 'SELESAI', 'DITUTUP');
ALTER TABLE "Berkas" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Berkas" ALTER COLUMN "status" TYPE "BerkasStatus_new" USING ("status"::text::"BerkasStatus_new");
ALTER TYPE "BerkasStatus" RENAME TO "BerkasStatus_old";
ALTER TYPE "BerkasStatus_new" RENAME TO "BerkasStatus";
DROP TYPE "BerkasStatus_old";
ALTER TABLE "Berkas" ALTER COLUMN "status" SET DEFAULT 'DIBUAT';
COMMIT;

-- AlterTable
ALTER TABLE "Berkas" ADD COLUMN     "kksId" UUID,
ADD COLUMN     "lastRevisionFrom" TEXT,
ADD COLUMN     "lastRevisionReason" TEXT,
ADD COLUMN     "revisionCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'DIBUAT';

-- CreateIndex
CREATE INDEX "Berkas_kksId_idx" ON "Berkas"("kksId");

-- AddForeignKey
ALTER TABLE "Berkas" ADD CONSTRAINT "Berkas_kksId_fkey" FOREIGN KEY ("kksId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
