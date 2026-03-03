/*
  Warnings:

  - You are about to drop the column `userId` on the `Petugas` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Petugas" DROP CONSTRAINT "Petugas_userId_fkey";

-- DropIndex
DROP INDEX "Petugas_userId_idx";

-- DropIndex
DROP INDEX "Petugas_userId_key";

-- AlterTable
ALTER TABLE "Petugas" DROP COLUMN "userId";
