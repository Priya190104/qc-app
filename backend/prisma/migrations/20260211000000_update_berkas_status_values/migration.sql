-- Update default status value for Berkas table
ALTER TABLE "Berkas" ALTER COLUMN "status" SET DEFAULT 'PROSES';

-- Update existing status values to new format
-- DRAFT and PENDING -> PROSES
UPDATE "Berkas" SET status = 'PROSES' WHERE status IN ('DRAFT', 'DRAFT', 'pending', 'PENDING');

-- IN_REVIEW -> PROSES
UPDATE "Berkas" SET status = 'PROSES' WHERE status IN ('IN_REVIEW', 'in_review');

-- APPROVED -> SELESAI
UPDATE "Berkas" SET status = 'SELESAI' WHERE status IN ('APPROVED', 'approved');

-- REJECTED and ARCHIVED -> DITUTUP
UPDATE "Berkas" SET status = 'DITUTUP' WHERE status IN ('REJECTED', 'rejected', 'ARCHIVED', 'archived');
