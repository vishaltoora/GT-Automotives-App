-- Baseline catch-up migration. Captures schema drift between migrations history
-- and the actual local + production databases (changes were applied via earlier
-- `prisma db push` operations before migrations were enforced).
-- This migration is marked as already applied via `prisma migrate resolve --applied`
-- in environments where these changes already exist.

-- AlterEnum
BEGIN;
CREATE TYPE "public"."EmailType_new" AS ENUM ('APPOINTMENT_CONFIRMATION', 'APPOINTMENT_REMINDER', 'APPOINTMENT_CANCELLATION', 'INVOICE_DELIVERY', 'QUOTATION', 'PAYMENT_RECEIPT', 'SERVICE_COMPLETE', 'PROMOTIONAL', 'BOOKING_CONFIRMATION');
ALTER TABLE "public"."email_logs" ALTER COLUMN "type" TYPE "public"."EmailType_new" USING ("type"::text::"public"."EmailType_new");
ALTER TYPE "public"."EmailType" RENAME TO "EmailType_old";
ALTER TYPE "public"."EmailType_new" RENAME TO "EmailType";
DROP TYPE "public"."EmailType_old";
COMMIT;

-- AlterEnum
ALTER TYPE "public"."RoleName" ADD VALUE 'SUPERVISOR';

-- AlterTable
ALTER TABLE "public"."ExpenseInvoice" ALTER COLUMN "status" SET DEFAULT 'PAID',
ALTER COLUMN "gstRate" SET NOT NULL,
ALTER COLUMN "pstRate" SET NOT NULL,
ALTER COLUMN "hstRate" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PurchaseExpenseInvoice" ALTER COLUMN "amount" SET NOT NULL,
ALTER COLUMN "gstRate" SET NOT NULL,
ALTER COLUMN "pstRate" SET NOT NULL,
ALTER COLUMN "hstRate" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PurchaseInvoice" ALTER COLUMN "status" SET DEFAULT 'PAID',
ALTER COLUMN "gstRate" SET NOT NULL,
ALTER COLUMN "pstRate" SET NOT NULL,
ALTER COLUMN "hstRate" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."SquarePayment" ADD COLUMN     "appointmentId" TEXT,
ALTER COLUMN "invoiceId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "SquarePayment_appointmentId_idx" ON "public"."SquarePayment"("appointmentId");

-- AddForeignKey
ALTER TABLE "public"."SquarePayment" ADD CONSTRAINT "SquarePayment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
