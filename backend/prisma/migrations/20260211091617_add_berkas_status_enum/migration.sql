/*
  Warnings:

  - The `status` column on the `Berkas` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BerkasStatus" AS ENUM ('PROSES', 'SELESAI', 'DITUTUP');

-- AlterTable
ALTER TABLE "Berkas" DROP COLUMN "status",
ADD COLUMN     "status" "BerkasStatus" NOT NULL DEFAULT 'PROSES';

-- CreateIndex
CREATE INDEX "Berkas_status_idx" ON "Berkas"("status");
