/*
  Warnings:

  - You are about to drop the column `petugasId` on the `Berkas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Berkas" DROP CONSTRAINT "Berkas_petugasId_fkey";

-- DropIndex
DROP INDEX "Berkas_petugasId_idx";

-- AlterTable
ALTER TABLE "Berkas" DROP COLUMN "petugasId";

-- AlterTable
ALTER TABLE "BerkasHistory" ALTER COLUMN "id" DROP DEFAULT;
