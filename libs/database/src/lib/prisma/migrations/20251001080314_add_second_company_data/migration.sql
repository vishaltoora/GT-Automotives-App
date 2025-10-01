-- Migration to add second company data
-- AddSecondCompanyData

INSERT INTO "Company" (
  id,
  name,
  "registrationNumber",
  "businessType",
  address,
  phone,
  email,
  "isDefault",
  "createdAt",
  "updatedAt"
) VALUES (
  'cm1p8x9y10000abcdefghijk2',
  'GT Detailing',
  '17341938',
  'Automotive Services',
  'Prince George, BC',
  '(250) 555-0123',
  'info@gt-automotives.com',
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);