-- Seed a starting terms & conditions block so invoices are not blank on day one.
-- This is placeholder wording: it is a liability statement and is expected to be
-- reviewed and replaced by the business from Admin > Companies. Only fills rows
-- that have no terms set, so it never overwrites business-authored text.
UPDATE "public"."Company"
SET "termsAndConditions" = 'GT Automotives provides no guarantee or warranty on parts supplied or purchased by the customer. Warranty on parts supplied and installed by GT Automotives is limited to the manufacturer''s warranty. Services and parts listed as declined on this invoice were recommended by GT Automotives and refused by the customer; GT Automotives accepts no liability for any failure or damage arising from work that was declined.'
WHERE "termsAndConditions" IS NULL;
