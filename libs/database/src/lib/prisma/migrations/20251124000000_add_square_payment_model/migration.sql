-- CreateEnum
CREATE TYPE "SquarePaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'APPROVED', 'CANCELED', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND');

-- CreateTable
CREATE TABLE "SquarePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "squarePaymentId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "status" "SquarePaymentStatus" NOT NULL DEFAULT 'PENDING',
    "sourceType" TEXT,
    "cardBrand" TEXT,
    "last4" TEXT,
    "expMonth" INTEGER,
    "expYear" INTEGER,
    "receiptUrl" TEXT,
    "receiptNumber" TEXT,
    "note" TEXT,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "squareOrderId" TEXT,
    "locationId" TEXT,
    "deviceId" TEXT,
    "processingFee" DECIMAL(10,2),
    "netAmount" DECIMAL(10,2),
    "refundedAmount" DECIMAL(10,2),
    "refundedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SquarePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SquarePayment_squarePaymentId_key" ON "SquarePayment"("squarePaymentId");

-- CreateIndex
CREATE INDEX "SquarePayment_invoiceId_idx" ON "SquarePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "SquarePayment_status_idx" ON "SquarePayment"("status");

-- CreateIndex
CREATE INDEX "SquarePayment_squarePaymentId_idx" ON "SquarePayment"("squarePaymentId");

-- AddForeignKey
ALTER TABLE "SquarePayment" ADD CONSTRAINT "SquarePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
