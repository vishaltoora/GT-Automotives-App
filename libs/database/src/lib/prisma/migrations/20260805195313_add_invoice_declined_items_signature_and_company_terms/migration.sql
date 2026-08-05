-- AlterTable
ALTER TABLE "public"."Company" ADD COLUMN     "termsAndConditions" TEXT;

-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "signatureBlobName" TEXT,
ADD COLUMN     "signatureCapturedBy" TEXT,
ADD COLUMN     "signatureContainerName" TEXT,
ADD COLUMN     "signatureSignedAt" TIMESTAMP(3),
ADD COLUMN     "signatureSignedByName" TEXT;

-- CreateTable
CREATE TABLE "public"."InvoiceDeclinedItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "roServiceId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceDeclinedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceDeclinedItem_invoiceId_idx" ON "public"."InvoiceDeclinedItem"("invoiceId");

-- AddForeignKey
ALTER TABLE "public"."InvoiceDeclinedItem" ADD CONSTRAINT "InvoiceDeclinedItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
