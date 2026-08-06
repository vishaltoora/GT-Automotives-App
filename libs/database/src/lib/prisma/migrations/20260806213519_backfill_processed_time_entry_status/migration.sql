-- Move entries already paid out through payroll onto the PROCESSED status.
--
-- Processing previously only stamped payrollProcessedAt and left the status at
-- APPROVED, so a paid entry was indistinguishable from one merely waiting to be
-- paid. Everything with that stamp is, by definition, processed.
--
-- Separate from the migration that adds the enum value: PostgreSQL will not let
-- a new enum value be used in the same transaction that declares it.
--
-- VOIDED entries are left alone. A voided entry that was somehow processed is a
-- discrepancy worth seeing, not one to paper over by relabelling it as paid.
UPDATE "public"."TimeEntry"
SET "status" = 'PROCESSED'
WHERE "payrollProcessedAt" IS NOT NULL
  AND "status" <> 'VOIDED'
  AND "status" <> 'PROCESSED';
