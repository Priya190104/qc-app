/*
  Warnings:

  - A unique constraint covering the columns `[nomor,isClosed]` on the table `Berkas` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Berkas_nomor_key";

-- AlterTable
ALTER TABLE "Berkas" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "closedById" UUID,
ADD COLUMN     "isClosed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Berkas_isClosed_idx" ON "Berkas"("isClosed");

-- CreateIndex
CREATE UNIQUE INDEX "Berkas_nomor_isClosed_key" ON "Berkas"("nomor", "isClosed");

-- AddForeignKey
ALTER TABLE "Berkas" ADD CONSTRAINT "Berkas_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
