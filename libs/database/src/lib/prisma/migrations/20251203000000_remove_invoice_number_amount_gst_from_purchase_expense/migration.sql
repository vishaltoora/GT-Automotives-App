-- DropColumn: Remove invoiceNumber from PurchaseExpenseInvoice
ALTER TABLE "PurchaseExpenseInvoice" DROP COLUMN IF EXISTS "invoiceNumber";

-- DropColumn: Remove amount from PurchaseExpenseInvoice
ALTER TABLE "PurchaseExpenseInvoice" DROP COLUMN IF EXISTS "amount";

-- DropColumn: Remove gstAmount from PurchaseExpenseInvoice
ALTER TABLE "PurchaseExpenseInvoice" DROP COLUMN IF EXISTS "gstAmount";
