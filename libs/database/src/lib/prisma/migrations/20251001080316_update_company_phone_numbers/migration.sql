-- Migration to update company phone numbers
-- UpdateCompanyPhoneNumbers

-- Update first company (registration 16472991) phone number
UPDATE "Company"
SET
  phone = '250-986-9191',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "registrationNumber" = '16472991';

-- Update second company (registration 17341938) phone number
UPDATE "Company"
SET
  phone = '250-570-2333',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "registrationNumber" = '17341938';