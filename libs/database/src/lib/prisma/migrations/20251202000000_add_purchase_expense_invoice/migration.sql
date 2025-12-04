-- CreateEnum
CREATE TYPE "PurchaseExpenseType" AS ENUM ('PURCHASE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "PurchaseExpenseCategory" AS ENUM ('TIRES', 'PARTS', 'TOOLS', 'SUPPLIES', 'RENT', 'UTILITIES', 'INSURANCE', 'ADVERTISING', 'OFFICE_SUPPLIES', 'PROFESSIONAL_FEES', 'MAINTENANCE', 'VEHICLE', 'TRAVEL', 'TRAINING', 'SOFTWARE', 'OTHER');

-- CreateTable
CREATE TABLE "PurchaseExpenseInvoice" (
    "id" TEXT NOT NULL,
    "type" "PurchaseExpenseType" NOT NULL,
    "invoiceNumber" TEXT,
    "vendorId" TEXT,
    "vendorName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "gstAmount" DECIMAL(10,2),
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "category" "PurchaseExpenseCategory" NOT NULL,
    "notes" TEXT,
    "imageUrl" TEXT,
    "imageName" TEXT,
    "imageSize" INTEGER,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseExpenseInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseExpenseInvoice_type_idx" ON "PurchaseExpenseInvoice"("type");

-- CreateIndex
CREATE INDEX "PurchaseExpenseInvoice_invoiceDate_idx" ON "PurchaseExpenseInvoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "PurchaseExpenseInvoice_vendorId_idx" ON "PurchaseExpenseInvoice"("vendorId");

-- CreateIndex
CREATE INDEX "PurchaseExpenseInvoice_category_idx" ON "PurchaseExpenseInvoice"("category");

-- CreateIndex
CREATE INDEX "PurchaseExpenseInvoice_createdBy_idx" ON "PurchaseExpenseInvoice"("createdBy");

-- AddForeignKey
ALTER TABLE "PurchaseExpenseInvoice" ADD CONSTRAINT "PurchaseExpenseInvoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- DATA MIGRATION: Transfer from old tables
-- ============================================

-- Migrate PurchaseInvoice data to PurchaseExpenseInvoice
-- Using ::text:: double cast because PostgreSQL can't directly cast between different enum types
INSERT INTO "PurchaseExpenseInvoice" (
    "id",
    "type",
    "invoiceNumber",
    "vendorId",
    "vendorName",
    "description",
    "invoiceDate",
    "amount",
    "gstAmount",
    "totalAmount",
    "category",
    "notes",
    "imageUrl",
    "imageName",
    "imageSize",
    "createdBy",
    "createdAt",
    "updatedAt"
)
SELECT
    id,
    'PURCHASE'::"PurchaseExpenseType",
    NULL, -- invoiceNumber wasn't in PurchaseInvoice
    "vendorId",
    "vendorName",
    description,
    "invoiceDate",
    amount,
    "taxAmount", -- taxAmount becomes gstAmount
    "totalAmount",
    category::text::"PurchaseExpenseCategory", -- Cast via text for enum compatibility
    notes,
    "imageUrl",
    "imageName",
    "imageSize",
    "createdBy",
    "createdAt",
    "updatedAt"
FROM "PurchaseInvoice";

-- Migrate ExpenseInvoice data to PurchaseExpenseInvoice
INSERT INTO "PurchaseExpenseInvoice" (
    "id",
    "type",
    "invoiceNumber",
    "vendorId",
    "vendorName",
    "description",
    "invoiceDate",
    "amount",
    "gstAmount",
    "totalAmount",
    "category",
    "notes",
    "imageUrl",
    "imageName",
    "imageSize",
    "createdBy",
    "createdAt",
    "updatedAt"
)
SELECT
    id,
    'EXPENSE'::"PurchaseExpenseType",
    "invoiceNumber",
    "vendorId",
    "vendorName",
    description,
    "invoiceDate",
    amount,
    "taxAmount", -- taxAmount becomes gstAmount
    "totalAmount",
    category::text::"PurchaseExpenseCategory", -- Cast via text for enum compatibility
    notes,
    "imageUrl",
    "imageName",
    "imageSize",
    "createdBy",
    "createdAt",
    "updatedAt"
FROM "ExpenseInvoice";
