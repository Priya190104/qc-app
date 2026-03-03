-- AlterTable
ALTER TABLE "Berkas" ADD COLUMN "kegiatan" TEXT,
ADD COLUMN "tanggalBerkas" TIMESTAMP(3),
ADD COLUMN "tahunBerkas" INTEGER,
ADD COLUMN "namaPemohon" TEXT,
ADD COLUMN "kecamatan" TEXT,
ADD COLUMN "desa" TEXT,
ADD COLUMN "namaProsedur" TEXT,
ADD COLUMN "luasPendaftaran" BIGINT,
ADD COLUMN "di302" TEXT,
ADD COLUMN "di305" TEXT,
ADD COLUMN "kks" TEXT;

-- CreateIndex
CREATE INDEX "Berkas_kecamatan_idx" ON "Berkas"("kecamatan");

-- CreateIndex
CREATE INDEX "Berkas_desa_idx" ON "Berkas"("desa");
