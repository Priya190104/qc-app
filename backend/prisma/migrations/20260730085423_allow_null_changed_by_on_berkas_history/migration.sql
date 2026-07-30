-- DropForeignKey
ALTER TABLE "BerkasHistory" DROP CONSTRAINT "BerkasHistory_changedById_fkey";

-- AlterTable
ALTER TABLE "BerkasHistory" ALTER COLUMN "changedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BerkasHistory" ADD CONSTRAINT "BerkasHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
