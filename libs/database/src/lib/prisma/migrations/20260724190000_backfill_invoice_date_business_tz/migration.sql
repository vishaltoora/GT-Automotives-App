-- Backfill: normalize existing invoiceDate values that were stored as raw UTC
-- instants (created via RO-close / quotation paths that didn't set invoiceDate)
-- to the business (America/Vancouver) calendar date at midnight UTC.
--
-- Invoices created after ~5 PM PST are stored as the next UTC day and therefore
-- displayed one day late. Rows already stored at midnight UTC (correct calendar
-- dates) are skipped. Idempotent: re-running affects no already-normalized rows.
UPDATE "Invoice"
SET "invoiceDate" =
  (DATE("invoiceDate" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Vancouver'))::timestamp
WHERE "invoiceDate"::time <> TIME '00:00:00';
