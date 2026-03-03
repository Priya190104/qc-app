/*
  Warnings:

  - You are about to drop the column `biaya` on the `Berkas` table. All the data in the column will be lost.
  - You are about to drop the column `tambahBiaya` on the `Berkas` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalKeluarSHAT` on the `Berkas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Berkas" DROP COLUMN "biaya",
DROP COLUMN "tambahBiaya",
DROP COLUMN "tanggalKeluarSHAT";
