-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "snapshotUserEmail" TEXT,
ADD COLUMN     "snapshotUserName" TEXT;

-- AlterTable
ALTER TABLE "Berkas" ADD COLUMN     "snapshotApprovedByName" TEXT,
ADD COLUMN     "snapshotClosedByName" TEXT,
ADD COLUMN     "snapshotCreatedByName" TEXT;

-- AlterTable
ALTER TABLE "UmuxResponse" ADD COLUMN     "snapshotEmail" TEXT,
ADD COLUMN     "snapshotName" TEXT,
ADD COLUMN     "snapshotRole" TEXT;
