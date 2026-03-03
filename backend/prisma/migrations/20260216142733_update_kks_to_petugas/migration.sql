/*
  Warnings:

  - You are about to drop the column `kksId` on the `Berkas` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Berkas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Berkas" DROP CONSTRAINT "Berkas_kksId_fkey";

-- DropIndex
DROP INDEX "Berkas_kksId_idx";

-- AlterTable
ALTER TABLE "Berkas" DROP COLUMN "kksId",
DROP COLUMN "nama",
ADD COLUMN     "petugasKKSId" UUID,
ADD COLUMN     "petugasPemetaanId" UUID;

-- CreateIndex
CREATE INDEX "Berkas_petugasPemetaanId_idx" ON "Berkas"("petugasPemetaanId");

-- CreateIndex
CREATE INDEX "Berkas_petugasKKSId_idx" ON "Berkas"("petugasKKSId");

-- AddForeignKey
ALTER TABLE "Berkas" ADD CONSTRAINT "Berkas_petugasPemetaanId_fkey" FOREIGN KEY ("petugasPemetaanId") REFERENCES "Petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berkas" ADD CONSTRAINT "Berkas_petugasKKSId_fkey" FOREIGN KEY ("petugasKKSId") REFERENCES "Petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
