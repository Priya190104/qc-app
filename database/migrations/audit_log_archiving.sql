-- ========================================================
-- AuditLog Archiving Policy
-- ========================================================
-- Purpose : Prevent AuditLog table from growing unbounded.
-- Strategy: Move records older than 6 months to an archive
--           table, then delete them from the main table.
--
-- Recommended schedule: Run monthly via pg_cron or external cron.
--
-- Prerequisites:
--   1. Execute the "Create archive table" block once (initial setup).
--   2. Schedule the "Archive procedure" call monthly.
-- ========================================================

-- --------------------------------------------------------
-- STEP 1: Create the archive table (run once)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AuditLogArchive" (
  LIKE "AuditLog" INCLUDING ALL
);

COMMENT ON TABLE "AuditLogArchive" IS
  'Archived audit log records older than 6 months. Read-only.';

-- --------------------------------------------------------
-- STEP 2: Create the archive function
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION archive_old_audit_logs(retention_days INT DEFAULT 180)
RETURNS TABLE(archived_count BIGINT, deleted_count BIGINT) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ := NOW() - (retention_days || ' days')::INTERVAL;
  v_archived  BIGINT;
  v_deleted   BIGINT;
BEGIN
  -- 1. Copy records older than cutoff_date to archive table
  --    (IGNORE conflicts so re-runs are idempotent)
  INSERT INTO "AuditLogArchive"
  SELECT * FROM "AuditLog"
  WHERE "createdAt" < cutoff_date
  ON CONFLICT (id) DO NOTHING;

  GET DIAGNOSTICS v_archived = ROW_COUNT;

  -- 2. Delete archived records from the main table
  DELETE FROM "AuditLog"
  WHERE "createdAt" < cutoff_date;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  RETURN QUERY SELECT v_archived, v_deleted;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------
-- STEP 3: Manual execution example
-- --------------------------------------------------------
-- Archive records older than 180 days (6 months):
--   SELECT * FROM archive_old_audit_logs(180);
--
-- Archive records older than 90 days (3 months):
--   SELECT * FROM archive_old_audit_logs(90);

-- --------------------------------------------------------
-- STEP 4: Schedule with pg_cron (if available)
-- --------------------------------------------------------
-- Run archiving on the 1st of every month at 02:00 AM:
--
--   SELECT cron.schedule(
--     'archive-audit-logs',
--     '0 2 1 * *',
--     $$ SELECT * FROM archive_old_audit_logs(180); $$
--   );
--
-- Check scheduled jobs:
--   SELECT * FROM cron.job;
--
-- Unschedule:
--   SELECT cron.unschedule('archive-audit-logs');

-- --------------------------------------------------------
-- STEP 5: Useful monitoring queries
-- --------------------------------------------------------

-- Check current AuditLog size:
-- SELECT
--   relname AS table_name,
--   pg_size_pretty(pg_total_relation_size(oid)) AS total_size,
--   n_live_tup AS row_count
-- FROM pg_stat_user_tables
-- WHERE relname IN ('AuditLog', 'AuditLogArchive')
-- ORDER BY pg_total_relation_size(oid) DESC;

-- Count records by month to plan retention:
-- SELECT
--   DATE_TRUNC('month', "createdAt") AS month,
--   COUNT(*) AS record_count
-- FROM "AuditLog"
-- GROUP BY 1
-- ORDER BY 1 DESC;
