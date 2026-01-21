-- Add RIMS and TEAM_MEETING to PurchaseExpenseCategory enum
ALTER TYPE "PurchaseExpenseCategory" ADD VALUE IF NOT EXISTS 'RIMS';
ALTER TYPE "PurchaseExpenseCategory" ADD VALUE IF NOT EXISTS 'TEAM_MEETING';
