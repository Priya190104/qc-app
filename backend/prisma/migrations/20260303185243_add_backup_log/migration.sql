-- CreateTable
CREATE TABLE "BackupLog" (
    "id" UUID NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSizeBytes" BIGINT NOT NULL DEFAULT 0,
    "totalBerkas" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BackupLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BackupLog_createdAt_idx" ON "BackupLog"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "BackupLog_status_idx" ON "BackupLog"("status");
