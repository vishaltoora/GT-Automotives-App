-- Support fractional quantities on invoice and quotation line items
ALTER TABLE "InvoiceItem" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,2);
ALTER TABLE "QuotationItem" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(10,2);

-- Per-item customer approve/decline decision + quotation flag on repair-order services
CREATE TYPE "ROServiceApproval" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

ALTER TABLE "ro_services" ADD COLUMN "customerApproval" "ROServiceApproval" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "ro_services" ADD COLUMN "isQuotation" BOOLEAN NOT NULL DEFAULT false;
