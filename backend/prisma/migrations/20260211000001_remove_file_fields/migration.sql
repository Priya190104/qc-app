-- Remove file-related columns from Berkas table
ALTER TABLE "Berkas" DROP COLUMN IF EXISTS "filePath";
ALTER TABLE "Berkas" DROP COLUMN IF EXISTS "fileSize";
ALTER TABLE "Berkas" DROP COLUMN IF EXISTS "fileType";
