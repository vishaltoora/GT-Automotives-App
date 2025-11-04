-- Fix Payment Dates for Day Summary Accuracy
-- Purpose: Resolve timezone issues and backfill historical payment dates
-- Date: November 4, 2025

-- STEP 1: Normalize all payment dates to midnight (remove time component)
-- This fixes timezone shifts where payments showed up on wrong days
UPDATE "Appointment"
SET "paymentDate" = DATE_TRUNC('day', "paymentDate")
WHERE "paymentDate" IS NOT NULL
  AND "paymentAmount" > 0;

-- STEP 2: Backfill historical completed appointments with payment dates
-- Sets paymentDate to the completion date (updatedAt) for accurate EOD reports
UPDATE "Appointment"
SET "paymentDate" = DATE_TRUNC('day', "updatedAt")
WHERE "status" = 'COMPLETED'
  AND "paymentAmount" > 0
  AND "paymentDate" IS NULL;

-- VERIFICATION QUERIES
-- Show summary by payment date
SELECT 
  TO_CHAR("paymentDate", 'Mon DD, YYYY') as payment_date,
  COUNT(*) as payment_count,
  SUM("paymentAmount") as total_collected
FROM "Appointment"
WHERE "paymentAmount" > 0
  AND "paymentDate" IS NOT NULL
GROUP BY "paymentDate"
ORDER BY "paymentDate" DESC
LIMIT 20;

-- Show appointments without payment dates
SELECT COUNT(*) as missing_payment_date
FROM "Appointment"
WHERE "status" = 'COMPLETED'
  AND "paymentAmount" > 0
  AND "paymentDate" IS NULL;
