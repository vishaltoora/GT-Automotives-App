-- Backfill company details onto pay stubs raised before those columns existed.
--
-- The stub freezes its company header at issue time so a reprint reproduces the
-- document as issued. Stubs created before the columns were added have nothing
-- frozen, so their header prints a bare name and address. This stamps the
-- default company's current details onto exactly those rows.
--
-- Two guards keep it from rewriting history it shouldn't:
--   - only rows where all four columns are NULL, i.e. never populated, so a
--     stub that recorded its own details is never overwritten;
--   - only rows whose stored company name still matches the default company,
--     so a stub issued under a different company is left alone.
--
-- Safe to run on a database with no such rows: it updates nothing.
UPDATE "public"."PayStub" AS ps
SET "companyBusinessType"       = c."businessType",
    "companyRegistrationNumber" = c."registrationNumber",
    "companyPhone"              = c."phone",
    "companyEmail"              = c."email"
FROM (
  SELECT "name", "businessType", "registrationNumber", "phone", "email"
  FROM "public"."Company"
  WHERE "isDefault" = true
  ORDER BY "createdAt" ASC
  LIMIT 1
) AS c
WHERE ps."companyName" = c."name"
  AND ps."companyBusinessType" IS NULL
  AND ps."companyRegistrationNumber" IS NULL
  AND ps."companyPhone" IS NULL
  AND ps."companyEmail" IS NULL;
