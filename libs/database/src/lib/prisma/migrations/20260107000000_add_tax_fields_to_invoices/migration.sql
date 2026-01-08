-- Add tax fields to PurchaseInvoice
ALTER TABLE "PurchaseInvoice" ADD COLUMN IF NOT EXISTS "gstRate" DECIMAL(5,2) DEFAULT 5;
ALTER TABLE "PurchaseInvoice" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(10,2);
ALTER TABLE "PurchaseInvoice" ADD COLUMN IF NOT EXISTS "pstRate" DECIMAL(5,2) DEFAULT 7;
ALTER TABLE "PurchaseInvoice" ADD COLUMN IF NOT EXISTS "pstAmount" DECIMAL(10,2);
ALTER TABLE "PurchaseInvoice" ADD COLUMN IF NOT EXISTS "hstRate" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "PurchaseInvoice" ADD COLUMN IF NOT EXISTS "hstAmount" DECIMAL(10,2);

-- Add tax fields to ExpenseInvoice
ALTER TABLE "ExpenseInvoice" ADD COLUMN IF NOT EXISTS "gstRate" DECIMAL(5,2) DEFAULT 5;
ALTER TABLE "ExpenseInvoice" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(10,2);
ALTER TABLE "ExpenseInvoice" ADD COLUMN IF NOT EXISTS "pstRate" DECIMAL(5,2) DEFAULT 7;
ALTER TABLE "ExpenseInvoice" ADD COLUMN IF NOT EXISTS "pstAmount" DECIMAL(10,2);
ALTER TABLE "ExpenseInvoice" ADD COLUMN IF NOT EXISTS "hstRate" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "ExpenseInvoice" ADD COLUMN IF NOT EXISTS "hstAmount" DECIMAL(10,2);

-- Add tax fields to PurchaseExpenseInvoice
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "amount" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "gstRate" DECIMAL(5,2) DEFAULT 5;
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "gstAmount" DECIMAL(10,2);
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "pstRate" DECIMAL(5,2) DEFAULT 7;
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "pstAmount" DECIMAL(10,2);
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "hstRate" DECIMAL(5,2) DEFAULT 0;
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "hstAmount" DECIMAL(10,2);
ALTER TABLE "PurchaseExpenseInvoice" ADD COLUMN IF NOT EXISTS "taxAmount" DECIMAL(10,2);

-- Update existing records to set amount from totalAmount and calculate tax at default rates
-- For PurchaseExpenseInvoice: amount = totalAmount / 1.12 (assuming 12% total tax: 5% GST + 7% PST)
UPDATE "PurchaseExpenseInvoice"
SET
  "amount" = ROUND("totalAmount" / 1.12, 2),
  "gstAmount" = ROUND(("totalAmount" / 1.12) * 0.05, 2),
  "pstAmount" = ROUND(("totalAmount" / 1.12) * 0.07, 2),
  "taxAmount" = ROUND("totalAmount" - ("totalAmount" / 1.12), 2)
WHERE "amount" = 0 OR "amount" IS NULL;
