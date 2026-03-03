-- AlterTable
ALTER TABLE "Berkas" ADD COLUMN     "biaya" DECIMAL(15,2),
ADD COLUMN     "jumlahBidang" INTEGER,
ADD COLUMN     "luasHasilUkur" INTEGER,
ADD COLUMN     "nib" TEXT,
ADD COLUMN     "nibel" TEXT,
ADD COLUMN     "noSHATNIBEL" TEXT,
ADD COLUMN     "noSTP" TEXT,
ADD COLUMN     "noSU" TEXT,
ADD COLUMN     "petugasUkurId" UUID,
ADD COLUMN     "puLapangId" UUID,
ADD COLUMN     "tambahBiaya" DECIMAL(15,2),
ADD COLUMN     "tanggalKeluarSHAT" TIMESTAMP(3),
ADD COLUMN     "tglSTP" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Berkas_petugasUkurId_idx" ON "Berkas"("petugasUkurId");

-- CreateIndex
CREATE INDEX "Berkas_puLapangId_idx" ON "Berkas"("puLapangId");

-- AddForeignKey
ALTER TABLE "Berkas" ADD CONSTRAINT "Berkas_petugasUkurId_fkey" FOREIGN KEY ("petugasUkurId") REFERENCES "Petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berkas" ADD CONSTRAINT "Berkas_puLapangId_fkey" FOREIGN KEY ("puLapangId") REFERENCES "Petugas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
