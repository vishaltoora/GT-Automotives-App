-- Migration to update both companies with both phone numbers
-- UpdateCompaniesWithBothPhoneNumbers

-- Update both companies to have both phone numbers
UPDATE "Company"
SET
  phone = '250-986-9191, 250-570-2333',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "registrationNumber" IN ('16472991', '17341938');