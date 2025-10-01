-- Migration to update company names and emails
-- UpdateCompanyNamesAndEmails

-- Update first company (registration 16472991)
UPDATE "Company"
SET
  name = 'GT Automotives',
  email = 'gt-automotives@outlook.com',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "registrationNumber" = '16472991';

-- Update second company (registration 17341938)
UPDATE "Company"
SET
  name = 'GT Automotives',
  email = 'gt-automotives@outlook.com',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "registrationNumber" = '17341938';