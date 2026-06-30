-- AlterEnum
ALTER TYPE "public"."InvoiceStatus" ADD VALUE 'PARTIALLY_PAID';

-- AlterEnum
ALTER TYPE "public"."PaymentMethod" ADD VALUE 'CASH_NO_TAX';

-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "amountPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "combinedInvoiceId" TEXT;

-- CreateTable
CREATE TABLE "public"."InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "notes" TEXT,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoicePayment_invoiceId_idx" ON "public"."InvoicePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoicePayment_paidAt_idx" ON "public"."InvoicePayment"("paidAt");

-- CreateIndex
CREATE INDEX "Invoice_combinedInvoiceId_idx" ON "public"."Invoice"("combinedInvoiceId");

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_combinedInvoiceId_fkey" FOREIGN KEY ("combinedInvoiceId") REFERENCES "public"."Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InvoicePayment" ADD CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: existing fully-paid invoices are paid in full so they don't appear
-- as having an outstanding remaining balance.
UPDATE "public"."Invoice" SET "amountPaid" = "total" WHERE "status" = 'PAID';
